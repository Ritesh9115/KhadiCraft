<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class FindUserOTP extends Command
{
    protected $signature = 'find:user:otp {email}';
    protected $description = 'Find OTP for user email';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();
        
        if ($user) {
            $this->info("✅ User Found - Email: {$email}");
            $this->info("Current OTP: " . ($user->otp ?: 'None'));
            $this->info("OTP Expires At: " . ($user->otp_expires_at ?: 'None'));
            $this->info("Is Email Verified: " . ($user->email_verified ? 'Yes' : 'No'));
        } else {
            $this->error("❌ User Not Found - Email: {$email}");
        }
        
        return Command::SUCCESS;
    }
}
