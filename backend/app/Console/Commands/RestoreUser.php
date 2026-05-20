<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RestoreUser extends Command
{
    protected $signature = 'restore:user {email}';
    protected $description = 'Restore user account with email';

    public function handle()
    {
        $email = $this->argument('email');
        
        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            $this->info("✅ User already exists: {$email}");
            return Command::SUCCESS;
        }
        
        // Create user account
        $user = User::create([
            'name' => 'Ritesh Sharma',
            'email' => $email,
            'password' => Hash::make('password123'),
            'phone' => '9876543210',
            'role' => 'customer',
            'is_active' => true,
            'email_verified' => true,
        ]);
        
        $this->info("✅ User restored successfully!");
        $this->info("Email: {$email}");
        $this->info("Password: password123");
        $this->info("User ID: {$user->id}");
        
        return Command::SUCCESS;
    }
}
