<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

// Check existing users
$users = User::all();
echo "Current users count: " . $users->count() . "\n";

if ($users->count() > 0) {
    echo "Existing users:\n";
    foreach ($users as $user) {
        echo "- {$user->name} ({$user->email}) - Role: {$user->role}\n";
    }
} else {
    echo "No users found. Creating test users...\n";
    
    // Create Admin user
    User::create([
        'name' => 'Admin',
        'email' => 'admin@dental.com',
        'password' => bcrypt('admin123'),
        'role' => 'admin',
        'phone' => '0600000000',
    ]);
    echo "Admin user created!\n";

    // Create Patient user
    User::create([
        'name' => 'Patient Test',
        'email' => 'patient@dental.com',
        'password' => bcrypt('patient123'),
        'role' => 'patient',
        'phone' => '0612345678',
    ]);
    echo "Patient user created!\n";
}

// Clear tokens
\Laravel\Sanctum\PersonalAccessToken::truncate();
echo "All tokens cleared!\n";

echo "\nTest login credentials:\n";
echo "Admin: admin@dental.com / admin123\n";
echo "Patient: patient@dental.com / patient123\n";
