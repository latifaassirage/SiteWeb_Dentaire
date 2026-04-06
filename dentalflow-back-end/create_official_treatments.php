<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Treatment;

echo "=== Creating Official Dental Treatments ===\n";

// Clear existing treatments
Treatment::truncate();

$officialTreatments = [
    [
        'id' => 1,
        'name' => 'Obturation / Plombage',
        'duration' => 30,
        'price' => 300,
        'description' => 'Soins conservateurs / Réparation du tissu dentaire',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 2,
        'name' => 'Détartrage / Nettoyage profond',
        'duration' => 30,
        'price' => 200,
        'description' => 'Hygiène dentaire / Prévention',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 3,
        'name' => 'Traitement de canal / Dévitalisation',
        'duration' => 60,
        'price' => 800,
        'description' => 'Endodontie / Traitement de l\'infection dentaire',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 4,
        'name' => 'Couronne dentaire',
        'duration' => 45,
        'price' => 1200,
        'description' => 'Prothèse fixe / Protection et restauration du dent',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 5,
        'name' => 'Extraction dentaire / Arrachage',
        'duration' => 45,
        'price' => 350,
        'description' => 'Chirurgie dentaire / Retrait de dent',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 6,
        'name' => 'Orthodontie / Appareils dentaires',
        'duration' => 60,
        'price' => 2000,
        'description' => 'Correction de l\'alignement des dents et de la mâchoire',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 7,
        'name' => 'Implants dentaires',
        'duration' => 90,
        'price' => 5000,
        'description' => 'Prothèse implantaire / Remplacement de dent manquante',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 8,
        'name' => 'Chirurgie buccale',
        'duration' => 75,
        'price' => 2500,
        'description' => 'Interventions chirurgicales sur dents, gencives ou mâchoire',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 9,
        'name' => 'Parodontologie / Traitement des gencives',
        'duration' => 40,
        'price' => 600,
        'description' => 'Soins des tissus parodontaux / Traitement des gencives',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'id' => 10,
        'name' => 'Blanchiment des dents',
        'duration' => 60,
        'price' => 800,
        'description' => 'Esthétique dentaire / Amélioration de la couleur des dents',
        'created_at' => now(),
        'updated_at' => now()
    ],
];

Treatment::insert($officialTreatments);

echo "✅ " . count($officialTreatments) . " official dental treatments created successfully!\n";

foreach ($officialTreatments as $t) {
    echo "- {$t['name']} ({$t['duration']}min, {$t['price']}MAD)\n";
}

echo "\n🎯 All treatments now match the official list!\n";
