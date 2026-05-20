<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    protected $signature = 'create:admin {email} {password} {phone}';
    protected $description = 'Create an admin user account';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        $phone = $this->argument('phone');
        
        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            $this->error("❌ User already exists: {$email}");
            return Command::FAILURE;
        }
        
        // Create admin user
        $user = User::create([
            'name' => 'Ritesh Sharma',
            'email' => $email,
            'password' => Hash::make($password),
            'phone' => $phone,
            'role' => 'admin',
            'is_active' => true,
            'email_verified' => true,
        ]);
        
        $this->info("✅ Admin user created successfully!");
        $this->info("Email: {$email}");
        $this->info("Password: {$password}");
        $this->info("Phone: {$phone}");
        $this->info("Role: admin");
        $this->info("User ID: {$user->id}");
        
        return Command::SUCCESS;
    }
}
