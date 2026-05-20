<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

// Set default passwords for all users
$users = App\Models\User::all();

echo "=== SETTING TEST PASSWORDS ===\n\n";

foreach ($users as $user) {
    // Set a simple test password based on user role
    $password = match($user->role) {
        'admin' => 'Admin@123',
        'staff' => 'Staff@123',
        'tailor' => 'Tailor@123',
        'customer' => 'Customer@123',
        default => 'Test@123'
    };
    
    // Update the user's password
    $user->password = Hash::make($password);
    $user->save();
    
    echo "User ID: {$user->id}\n";
    echo "Email: {$user->email}\n";
    echo "Name: {$user->name}\n";
    echo "Role: {$user->role}\n";
    echo "Password: {$password}\n";
    echo str_repeat('-', 50) . "\n";
}

echo "\n=== UPDATED LOGIN CREDENTIALS ===\n\n";

echo "🔑 ADMIN USERS:\n";
echo "1. riteshparasher87@gmail.com -> Ritesh@22 (Your custom admin)\n";
echo "2. admin@khadicraft.com -> Admin@123\n\n";

echo "👥 STAFF USERS:\n";
echo "3. john@khadicraft.com -> Staff@123\n";
echo "4. sarah@khadicraft.com -> Staff@123\n";
echo "5. mike@khadicraft.com -> Staff@123\n\n";

echo "🧵 TAILOR USERS:\n";
echo "6. ramesh@khadicraft.com -> Tailor@123\n";
echo "7. amit@khadicraft.com -> Tailor@123\n";
echo "8. rajesh@khadicraft.com -> Tailor@123\n";
echo "9. vikram@khadicraft.com -> Tailor@123\n";
echo "10. sunil@khadicraft.com -> Tailor@123\n\n";

echo "🛍️ CUSTOMER USERS:\n";
echo "1. test@example.com -> Customer@123\n\n";

echo "✅ All passwords have been updated successfully!\n";
