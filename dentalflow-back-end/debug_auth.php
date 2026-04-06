<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Debug Authentication ===\n";

// Check users
$users = User::all();
echo "Total users: " . $users->count() . "\n\n";

foreach ($users as $user) {
    echo "User: " . $user->name . " (" . $user->email . ")\n";
    echo "Role: " . $user->role . "\n";
    echo "Password hash: " . substr($user->password, 0, 20) . "...\n";
    
    // Test password verification
    if ($user->email === 'admin@dental.com') {
        $check1 = Hash::check('admin123', $user->password);
        echo "Password 'admin123' check: " . ($check1 ? '✅ PASS' : '❌ FAIL') . "\n";
    }
    if ($user->email === 'patient@dental.com') {
        $check2 = Hash::check('patient123', $user->password);
        echo "Password 'patient123' check: " . ($check2 ? '✅ PASS' : '❌ FAIL') . "\n";
    }
    echo "---\n";
}

// Test manual login
echo "\n=== Manual Login Test ===\n";
$admin = User::where('email', 'admin@dental.com')->first();
if ($admin) {
    echo "Admin found: " . ($admin ? 'YES' : 'NO') . "\n";
    echo "Password check: " . (Hash::check('admin123', $admin->password) ? '✅' : '❌') . "\n";
    
    // Simulate login logic
    if ($admin && Hash::check('admin123', $admin->password)) {
        echo "✅ Login would succeed!\n";
        $token = $admin->createToken('auth_token')->plainTextToken;
        echo "Token generated: " . substr($token, 0, 20) . "...\n";
    } else {
        echo "❌ Login would fail!\n";
    }
}
