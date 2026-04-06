<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;

echo "=== Testing Login API ===\n";

// Simulate the exact request from browser
$request = Request::create('/api/login', 'POST', [
    'email' => 'admin@dental.com',
    'password' => 'admin123'
], [], [], [
    'HTTP_CONTENT_TYPE' => 'application/json',
    'HTTP_ACCEPT' => 'application/json'
]);

echo "Request data:\n";
echo "Email: " . $request->email . "\n";
echo "Password: " . $request->password . "\n\n";

// Check if user exists
$user = User::where('email', 'admin@dental.com')->first();
echo "User found: " . ($user ? 'YES' : 'NO') . "\n";

if ($user) {
    echo "User name: " . $user->name . "\n";
    echo "User role: " . $user->role . "\n";
    echo "Password check: " . (Hash::check('admin123', $user->password) ? '✅ PASS' : '❌ FAIL') . "\n";
}

// Test the actual AuthController login method
try {
    $controller = new \App\Http\Controllers\Api\AuthController();
    $response = $controller->login($request);
    
    echo "\n✅ Login successful!\n";
    echo "Response: " . $response->getContent() . "\n";
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "\n❌ Validation failed!\n";
    echo "Errors: " . json_encode($e->errors()) . "\n";
} catch (\Exception $e) {
    echo "\n❌ Login failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
}
