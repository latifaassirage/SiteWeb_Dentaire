<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Treatment;

echo "=== Creating Dental Treatments ===\n";

// Clear existing treatments
Treatment::truncate();

$treatments = [
    [
        'id' => 1,
        'name' => 'Obturation',
        'duration' => 30,
        'price' => 300,
        'description' => 'Restauration dentaire',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 2,
        'name' => 'Détartrage',
        'duration' => 30,
        'price' => 200,
        'description' => 'Nettoyage professionnel',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 3,
        'name' => 'Traitement de canal',
        'duration' => 60,
        'price' => 800,
        'description' => 'Traitement endodontique',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 4,
        'name' => 'Couronne',
        'duration' => 45,
        'price' => 1200,
        'description' => 'Couronne dentaire',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 5,
        'name' => 'Extraction',
        'duration' => 45,
        'price' => 350,
        'description' => 'Extraction dentaire',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 6,
        'name' => 'Orthodontie',
        'duration' => 60,
        'price' => 2000,
        'description' => 'Traitement orthodontique',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 7,
        'name' => 'Implants',
        'duration' => 90,
        'price' => 5000,
        'description' => 'Implant dentaire',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 8,
        'name' => 'Chirurgie buccale',
        'duration' => 75,
        'price' => 2500,
        'description' => 'Chirurgie orale',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 9,
        'name' => 'Parodontologie',
        'duration' => 40,
        'price' => 600,
        'description' => 'Traitement des gencives',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 10,
        'name' => 'Blanchiment',
        'duration' => 60,
        'price' => 800,
        'description' => 'Blanchiment des dents',
        'created_at' => now(),
        'updated_at' => now()
    ],
];

Treatment::insert($treatments);

echo "✅ " . count($treatments) . " dental treatments created successfully!\n";

foreach ($treatments as $t) {
    echo "- {$t['name']} ({$t['duration']}min, {$t['price']}MAD)\n";
}
