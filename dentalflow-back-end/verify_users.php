<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "=== User Verification ===\n";

// Check if users exist
$users = User::all();
echo "Total users: " . $users->count() . "\n\n";

if ($users->count() === 0) {
    echo "No users found. Creating test users...\n";
    
    try {
        // Create Admin user
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@dental.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'phone' => '0600000000',
        ]);
        echo "✅ Admin user created: " . $admin->email . "\n";

        // Create Patient user
        $patient = User::create([
            'name' => 'Patient Test',
            'email' => 'patient@dental.com',
            'password' => bcrypt('patient123'),
            'role' => 'patient',
            'phone' => '0612345678',
        ]);
        echo "✅ Patient user created: " . $patient->email . "\n";
    } catch (Exception $e) {
        echo "❌ Error creating users: " . $e->getMessage() . "\n";
    }
} else {
    foreach ($users as $user) {
        echo "👤 User: " . $user->name . " (" . $user->email . ") - Role: " . $user->role . "\n";
        
        // Test password verification
        if ($user->email === 'admin@dental.com') {
            $test = Hash::check('admin123', $user->password);
            echo "   Password check (admin123): " . ($test ? '✅' : '❌') . "\n";
        }
        if ($user->email === 'patient@dental.com') {
            $test = Hash::check('patient123', $user->password);
            echo "   Password check (patient123): " . ($test ? '✅' : '❌') . "\n";
        }
    }
}

echo "\n=== Test Login Credentials ===\n";
echo "Admin: admin@dental.com / admin123\n";
echo "Patient: patient@dental.com / patient123\n";
