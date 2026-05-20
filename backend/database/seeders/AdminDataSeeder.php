<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminDataSeeder extends Seeder
{
    public function run()
    {
        // Create main admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@khadicraft.com',
            'password' => Hash::make('admin123'),
            'phone' => '9876543210',
            'role' => 'admin',
            'is_active' => true,
            'email_verified' => true,
        ]);

        // Create staff users
        $staffUsers = [
            ['John Smith', 'john@khadicraft.com', 'staff123', '9876543211'],
            ['Sarah Johnson', 'sarah@khadicraft.com', 'staff123', '9876543212'],
            ['Mike Wilson', 'mike@khadicraft.com', 'staff123', '9876543213'],
        ];

        foreach ($staffUsers as [$name, $email, $password, $phone]) {
            User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'phone' => $phone,
                'role' => 'staff',
                'is_active' => true,
                'email_verified' => true,
            ]);
        }

        // Create tailor users
        $tailors = [
            ['Ramesh Kumar', 'ramesh@khadicraft.com', 'tailor123', '9876543214', 'Master Tailor'],
            ['Amit Sharma', 'amit@khadicraft.com', 'tailor123', '9876543215', 'Senior Tailor'],
            ['Rajesh Gupta', 'rajesh@khadicraft.com', 'tailor123', '9876543216', 'Junior Tailor'],
            ['Vikram Singh', 'vikram@khadicraft.com', 'tailor123', '9876543217', 'Expert Tailor'],
            ['Sunil Kumar', 'sunil@khadicraft.com', 'tailor123', '9876543218', 'Apprentice Tailor'],
        ];

        foreach ($tailors as [$name, $email, $password, $phone, $title]) {
            User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'phone' => $phone,
                'role' => 'tailor',
                'is_active' => true,
                'email_verified' => true,
            ]);
        }

        $this->command->info('Admin data seeded: 1 admin, 3 staff, 5 tailors');
    }
}
