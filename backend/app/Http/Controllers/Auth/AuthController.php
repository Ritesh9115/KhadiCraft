<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    // ─── REGISTER ──────────────────────────────────────────
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|min:2|max:100',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'required|string|min:10|max:15|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => 'customer',
        ]);

        // Send OTP for email verification
        $this->generateAndSendOtp($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please verify your email with the OTP sent.',
            'token'   => $token,
            'user'    => $this->userResource($user),
        ], 201);
    }

    // ─── LOGIN ─────────────────────────────────────────────
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            \Log::warning('Login failed - Email: ' . $request->email . ', User ID: ' . ($user ? $user->id : 'null') . ', Password check: false');
            return response()->json(['success' => false, 'message' => 'Invalid email or password.'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['success' => false, 'message' => 'Your account has been suspended. Contact support.'], 403);
        }

        // Revoke old tokens
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $this->userResource($user),
        ]);
    }

    // ─── LOGOUT ────────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Logged out successfully.']);
    }

    // ─── ME ────────────────────────────────────────────────
    public function me(Request $request)
    {
        return response()->json(['success' => true, 'user' => $this->userResource($request->user())]);
    }

    // ─── SEND OTP ──────────────────────────────────────────
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        $this->generateAndSendOtp($user);

        return response()->json(['success' => true, 'message' => 'OTP sent to your email address.']);
    }

    // ─── VERIFY OTP ────────────────────────────────────────
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp'   => 'required|string|size:6',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user->otp || $user->otp !== $request->otp) {
            return response()->json(['success' => false, 'message' => 'Invalid OTP.'], 400);
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['success' => false, 'message' => 'OTP has expired. Please request a new one.'], 400);
        }

        $user->update([
            'email_verified' => true,
            'otp'            => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Email verified successfully.']);
    }

    // ─── FORGOT PASSWORD ───────────────────────────────────
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        $this->generateAndSendOtp($user, 'reset');

        return response()->json(['success' => true, 'message' => 'Password reset OTP sent to your email.']);
    }

    // ─── RESET PASSWORD ────────────────────────────────────
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'     => 'required|email|exists:users,email',
            'otp'       => 'required|string|size:6',
            'password'  => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user->otp || $user->otp !== $request->otp) {
            return response()->json(['success' => false, 'message' => 'Invalid OTP.'], 400);
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['success' => false, 'message' => 'OTP has expired.'], 400);
        }

        $user->update([
            'password'       => Hash::make($request->password),
            'otp'            => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Password reset successfully. You can now login.']);
    }

    // ─── HELPERS ───────────────────────────────────────────
    private function generateAndSendOtp(User $user, string $type = 'verify'): void
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'otp'            => $otp,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // Send email
        try {
            $subject = $type === 'reset' ? 'Password Reset OTP - KhadiCraft' : 'Email Verification OTP - KhadiCraft';
            Mail::send([], [], function ($mail) use ($user, $otp, $subject) {
                $mail->to($user->email, $user->name)
                     ->subject($subject)
                     ->html($this->otpEmailHtml($user->name, $otp, $subject));
            });
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('OTP email failed: ' . $e->getMessage());
        }
    }

    private function otpEmailHtml(string $name, string $otp, string $title): string
    {
        return <<<HTML
        <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px">
        <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
          <div style="background:#1B4332;padding:28px 32px;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:1.4rem">KhadiCraft by Goldy</h2>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:0.85rem">Pure. Handwoven. Timeless.</p>
          </div>
          <div style="padding:32px">
            <p style="color:#333;font-size:1rem">Hi {$name},</p>
            <p style="color:#555;font-size:0.9rem;line-height:1.7">{$title}</p>
            <div style="background:#f8f5f0;border:2px dashed #C5933A;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
              <p style="color:#888;font-size:0.75rem;margin:0 0 8px;letter-spacing:2px;text-transform:uppercase">Your OTP</p>
              <div style="font-size:2.5rem;font-weight:bold;color:#1B4332;letter-spacing:12px">{$otp}</div>
              <p style="color:#888;font-size:0.75rem;margin:10px 0 0">Valid for 10 minutes only</p>
            </div>
            <p style="color:#999;font-size:0.8rem">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="background:#f8f5f0;padding:16px;text-align:center">
            <p style="color:#aaa;font-size:0.75rem;margin:0">© 2025 KhadiCraft by Goldy · Rampur Maniharan, Saharanpur, India</p>
          </div>
        </div>
        </body></html>
        HTML;
    }

    private function userResource(User $user): array
    {
        return [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'phone'          => $user->phone,
            'role'           => $user->role,
            'avatar'         => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'email_verified' => (bool) $user->email_verified,
            'is_active'      => (bool) $user->is_active,
            'created_at'     => $user->created_at,
        ];
    }
}
