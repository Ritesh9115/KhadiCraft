<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'riteshparasher87@gmail.com'],
            [
                'name'           => 'Ritesh Parasher',
                'phone'          => '9876543210',
                'password'       => Hash::make('Ritesh@22'),
                'role'           => 'admin',
                'email_verified' => true,
                'is_active'      => true,
            ]
        );

        // ── Staff ──────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'staff@khadicraft.in'],
            [
                'name'           => 'Priya Sharma (Staff)',
                'phone'          => '9876500001',
                'password'       => Hash::make('Staff@123'),
                'role'           => 'staff',
                'email_verified' => true,
                'is_active'      => true,
            ]
        );

        // ── Tailors ────────────────────────────────────────
        $tailors = [
            ['name' => 'Suresh Kumar (Tailor)',  'email' => 'tailor1@khadicraft.in', 'phone' => '9876500010'],
            ['name' => 'Ramesh Yadav (Tailor)',  'email' => 'tailor2@khadicraft.in', 'phone' => '9876500011'],
            ['name' => 'Mohan Singh (Tailor)',   'email' => 'tailor3@khadicraft.in', 'phone' => '9876500012'],
        ];
        foreach ($tailors as $t) {
            User::updateOrCreate(
                ['email' => $t['email']],
                array_merge($t, [
                    'password'       => Hash::make('Tailor@123'),
                    'role'           => 'tailor',
                    'email_verified' => true,
                    'is_active'      => true,
                ])
            );
        }

        // ── Sample Customers ───────────────────────────────
        $customers = [
            ['name' => 'Rahul Verma',      'email' => 'rahul@example.com',   'phone' => '9811111111'],
            ['name' => 'Anjali Gupta',     'email' => 'anjali@example.com',  'phone' => '9822222222'],
            ['name' => 'Vikram Mehta',     'email' => 'vikram@example.com',  'phone' => '9833333333'],
            ['name' => 'Sneha Kapoor',     'email' => 'sneha@example.com',   'phone' => '9844444444'],
            ['name' => 'Arjun Nair',       'email' => 'arjun@example.com',   'phone' => '9855555555'],
        ];
        foreach ($customers as $c) {
            User::updateOrCreate(
                ['email' => $c['email']],
                array_merge($c, [
                    'password'       => Hash::make('Customer@123'),
                    'role'           => 'customer',
                    'email_verified' => true,
                    'is_active'      => true,
                ])
            );
        }

        echo "✅ Users seeded: 1 admin | 1 staff | 3 tailors | 5 customers\n";
    }
}
