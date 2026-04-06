<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "=== Checking Admin Profile ===\n";

$admin = User::where('role', 'admin')->first();

if ($admin) {
    echo "Admin found:\n";
    echo "- Name: {$admin->name}\n";
    echo "- Email: {$admin->email}\n";
    echo "- Phone: {$admin->phone}\n";
    echo "- Role: {$admin->role}\n";
} else {
    echo "❌ No admin user found!\n";
    
    // Create admin if not exists
    echo "Creating admin user...\n";
    $admin = User::create([
        'name' => 'Dr. Admin',
        'email' => 'admin@dental.com',
        'password' => Hash::make('admin123'),
        'phone' => '+212 600-123-456',
        'role' => 'admin',
    ]);
    
    echo "✅ Admin created:\n";
    echo "- Name: {$admin->name}\n";
    echo "- Email: {$admin->email}\n";
    echo "- Phone: {$admin->phone}\n";
    echo "- Role: {$admin->role}\n";
}
