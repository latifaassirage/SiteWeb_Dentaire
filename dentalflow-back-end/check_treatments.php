<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Treatment;

echo "=== Checking Treatments ===\n";

$treatments = Treatment::all();

echo "Total treatments: " . $treatments->count() . "\n";

if ($treatments->count() > 0) {
    echo "Treatments found:\n";
    foreach ($treatments as $t) {
        echo "- ID: {$t->id}, Name: {$t->name}, Price: {$t->price} MAD, Duration: {$t->duration} min\n";
    }
} else {
    echo "❌ No treatments found in database!\n";
    echo "Creating treatments...\n";
    
    $treatmentData = [
        [
            'name' => 'Consultation',
            'duration' => 20,
            'price' => 150,
            'description' => 'Consultation générale',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'name' => 'Détartrage',
            'duration' => 30,
            'price' => 200,
            'description' => 'Nettoyage professionnel',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'name' => 'Blanchiment',
            'duration' => 60,
            'price' => 800,
            'description' => 'Blanchiment des dents',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'name' => 'Extraction',
            'duration' => 45,
            'price' => 350,
            'description' => 'Extraction dentaire',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'name' => 'Implant',
            'duration' => 90,
            'price' => 5000,
            'description' => 'Implant dentaire',
            'created_at' => now(),
            'updated_at' => now()
        ],
    ];
    
    Treatment::insert($treatmentData);
    echo "✅ " . count($treatmentData) . " treatments created successfully!\n";
}
