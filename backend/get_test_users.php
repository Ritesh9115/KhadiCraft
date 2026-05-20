<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

// Get all users from database
$users = App\Models\User::all();

echo "=== TEST USERS DATABASE ===\n\n";

foreach ($users as $user) {
    echo "User ID: {$user->id}\n";
    echo "Email: {$user->email}\n";
    echo "Name: {$user->name}\n";
    echo "Phone: {$user->phone}\n";
    echo "Role: {$user->role}\n";
    echo "Password: (Hashed in database)\n";
    echo "Status: " . ($user->is_active ? 'Active' : 'Inactive') . "\n";
    echo "Email Verified: " . ($user->email_verified ? 'Yes' : 'No') . "\n";
    echo "Created: {$user->created_at}\n";
    echo str_repeat('-', 50) . "\n";
}

echo "\nTotal Users: " . $users->count() . "\n";

// Check if we have the admin user we created earlier
$adminUser = App\Models\User::where('email', 'riteshparasher87@gmail.com')->first();
if ($adminUser) {
    echo "\n=== ADMIN ACCESS ===\n";
    echo "Email: riteshparasher87@gmail.com\n";
    echo "Password: Ritesh@22\n";
    echo "Role: admin\n";
    echo "ID: {$adminUser->id}\n";
} else {
    echo "\n=== DEFAULT ADMIN ACCESS ===\n";
    echo "Email: admin@khadicraft.in\n";
    echo "Password: Admin@123\n";
    echo "Role: admin\n";
}

// Get some sample customer users
$customers = App\Models\User::where('role', 'customer')->limit(3)->get();
if ($customers->count() > 0) {
    echo "\n=== SAMPLE CUSTOMERS ===\n";
    foreach ($customers as $customer) {
        echo "Email: {$customer->email}\n";
        echo "Name: {$customer->name}\n";
        echo "Password: (Use password reset if needed)\n";
        echo "ID: {$customer->id}\n";
        echo "---\n";
    }
}
