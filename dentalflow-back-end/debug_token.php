<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "=== Token Creation Debug ===\n";

// Find admin user
$user = User::where('email', 'admin@dental.com')->first();

if (!$user) {
    echo "❌ Admin user not found!\n";
    exit;
}

echo "✅ Admin user found: " . $user->name . "\n";

try {
    echo "Attempting to create token...\n";
    $token = $user->createToken('auth_token')->plainTextToken;
    echo "✅ Token created successfully!\n";
    echo "Token: " . substr($token, 0, 20) . "...\n";
} catch (Exception $e) {
    echo "❌ Token creation failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

// Check if personal_access_tokens table exists
try {
    echo "\n=== Database Check ===\n";
    $count = \DB::table('personal_access_tokens')->count();
    echo "Personal access tokens table exists. Records: " . $count . "\n";
} catch (Exception $e) {
    echo "❌ Personal access tokens table issue: " . $e->getMessage() . "\n";
}
