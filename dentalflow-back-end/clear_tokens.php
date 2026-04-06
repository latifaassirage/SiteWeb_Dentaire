<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Clear all personal access tokens
\Laravel\Sanctum\PersonalAccessToken::truncate();

echo "All Sanctum tokens cleared successfully!\n";

// Check remaining tokens
$count = \Laravel\Sanctum\PersonalAccessToken::count();
echo "Remaining tokens: " . $count . "\n";
