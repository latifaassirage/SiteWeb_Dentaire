<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "=== Creating Test Users ===\n";

// Clear existing users
User::truncate();

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

echo "\n=== Test Login Credentials ===\n";
echo "Admin: admin@dental.com / admin123\n";
echo "Patient: patient@dental.com / patient123\n";

echo "\n=== Ready for Testing ===\n";
