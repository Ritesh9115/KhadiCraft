// src/utils/otp.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// Send OTP email (gracefully fails — won't break the flow)
const sendOtpEmail = async (email, name, otp, type = 'verify') => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log(`[OTP] Email not configured. OTP for ${email}: ${otp}`);
      return; // Graceful no-op when SMTP not configured
    }

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = type === 'reset'
      ? 'Password Reset OTP - KhadiCraft'
      : 'Email Verification OTP - KhadiCraft';

    await transporter.sendMail({
      from:    `"KhadiCraft by Goldy" <${process.env.SMTP_USER}>`,
      to:      email,
      subject,
      html:    otpEmailHtml(name, otp, subject),
    });
  } catch (err) {
    // Log but do NOT throw — OTP is still stored in DB
    console.error('[OTP] Email send failed:', err.message);
  }
};

const otpEmailHtml = (name, otp, title) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
  <div style="background:#1B4332;padding:28px 32px;text-align:center">
    <h2 style="color:#fff;margin:0;font-size:1.4rem">KhadiCraft by Goldy</h2>
    <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:0.85rem">Pure. Handwoven. Timeless.</p>
  </div>
  <div style="padding:32px">
    <p style="color:#333;font-size:1rem">Hi ${name},</p>
    <p style="color:#555;font-size:0.9rem;line-height:1.7">${title}</p>
    <div style="background:#f8f5f0;border:2px dashed #C5933A;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
      <p style="color:#888;font-size:0.75rem;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase">Your OTP</p>
      <div style="font-size:2.5rem;font-weight:bold;color:#1B4332;letter-spacing:12px">${otp}</div>
      <p style="color:#888;font-size:0.75rem;margin:10px 0 0">Valid for 10 minutes only</p>
    </div>
    <p style="color:#999;font-size:0.8rem">If you didn't request this, please ignore this email.</p>
  </div>
  <div style="background:#f8f5f0;padding:16px;text-align:center">
    <p style="color:#aaa;font-size:0.75rem;margin:0">© 2025 KhadiCraft by Goldy · Rampur Maniharan, Saharanpur, India</p>
  </div>
</div>
</body></html>
`;

module.exports = { generateOtp, sendOtpEmail };
