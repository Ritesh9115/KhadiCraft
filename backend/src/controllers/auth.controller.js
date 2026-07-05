// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOtp, sendOtpEmail } = require('../utils/otp');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const userResource = (user) => ({
  id:             user._id,
  name:           user.name,
  email:          user.email,
  phone:          user.phone,
  role:           user.role,
  avatar:         user.avatar || null,
  email_verified: user.email_verified,
  is_active:      user.is_active,
  created_at:     user.createdAt,
});

// ─── REGISTER ────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, password_confirmation } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(422).json({ success: false, message: 'All fields are required.' });

    if (password !== password_confirmation)
      return res.status(422).json({ success: false, errors: { password_confirmation: ['Passwords do not match.'] } });

    if (await User.findOne({ email }))
      return res.status(422).json({ success: false, errors: { email: ['Email already registered.'] } });

    if (await User.findOne({ phone }))
      return res.status(422).json({ success: false, errors: { phone: ['Phone number already registered.'] } });

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name, email, phone, password, role: 'customer',
      otp, otp_expires_at: otpExpiresAt,
    });

    await sendOtpEmail(email, name, otp, 'verify');

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      token,
      user: userResource(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGIN ───────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(422).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password +otp +otp_expires_at');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_active)
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' });

    const token = signToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userResource(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGOUT ──────────────────────────────────────────────
exports.logout = (req, res) => {
  // JWT is stateless — client deletes token; nothing to do server-side
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ─── ME ──────────────────────────────────────────────────
exports.me = (req, res) => {
  res.json({ success: true, user: userResource(req.user) });
};

// ─── SEND OTP ────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otp_expires_at');
    if (!user) return res.status(422).json({ success: false, errors: { email: ['Email not found.'] } });

    const otp = generateOtp();
    user.otp = otp;
    user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(email, user.name, otp, 'verify');

    res.json({ success: true, message: 'OTP sent to your email address.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY OTP ──────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otp_expires_at');
    if (!user) return res.status(422).json({ success: false, errors: { email: ['Email not found.'] } });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });

    if (new Date() > new Date(user.otp_expires_at))
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

    user.email_verified = true;
    user.otp = undefined;
    user.otp_expires_at = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otp_expires_at');
    if (!user) return res.status(422).json({ success: false, errors: { email: ['Email not found.'] } });

    const otp = generateOtp();
    user.otp = otp;
    user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(email, user.name, otp, 'reset');

    res.json({ success: true, message: 'Password reset OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password, password_confirmation } = req.body;

    if (password !== password_confirmation)
      return res.status(422).json({ success: false, errors: { password_confirmation: ['Passwords do not match.'] } });

    const user = await User.findOne({ email }).select('+otp +otp_expires_at +password');
    if (!user) return res.status(422).json({ success: false, errors: { email: ['Email not found.'] } });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });

    if (new Date() > new Date(user.otp_expires_at))
      return res.status(400).json({ success: false, message: 'OTP has expired.' });

    user.password = password;
    user.otp = undefined;
    user.otp_expires_at = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
