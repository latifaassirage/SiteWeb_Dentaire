<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $count = App\Models\Treatment::count();
    echo "Treatments count: " . $count . "\n";
    
    if ($count > 0) {
        $treatments = App\Models\Treatment::take(3)->get();
        echo "First 3 treatments:\n";
        foreach ($treatments as $treatment) {
            echo "- ID: {$treatment->id}, Name: {$treatment->name}, Price: {$treatment->price}\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
