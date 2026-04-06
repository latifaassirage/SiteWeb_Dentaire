<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Treatment;

class TreatmentSeeder extends Seeder
{
    public function run()
    {
        $treatments = [
            [
                'name' => 'Obturation / Plombage',
                'description' => 'Restauration du tissu dentaire carié',
                'category' => 'conservateur',
                'price' => 400.00,
                'duration' => 45,
                'is_active' => true,
            ],
            [
                'name' => 'Détartrage / Nettoyage profond',
                'description' => 'Hygiène dentaire professionnelle et prévention',
                'category' => 'preventive',
                'price' => 300.00,
                'duration' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'Traitement de canal / Dévitalisation',
                'description' => 'Traitement de l\'infection dentaire et conservation de la dent',
                'category' => 'endodontie',
                'price' => 1200.00,
                'duration' => 90,
                'is_active' => true,
            ],
            [
                'name' => 'Couronne dentaire',
                'description' => 'Protection et restauration complète de la dent endommagée',
                'category' => 'prothese',
                'price' => 800.00,
                'duration' => 60,
                'is_active' => true,
            ],
            [
                'name' => 'Extraction dentaire / Arrachage',
                'description' => 'Retrait de dent endommagée ou incluse',
                'category' => 'chirurgie',
                'price' => 500.00,
                'duration' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'Orthodontie / Appareils dentaires',
                'description' => 'Correction de l\'alignement des dents et de la mâchoire',
                'category' => 'orthodontie',
                'price' => 5000.00,
                'duration' => 60,
                'is_active' => true,
            ],
            [
                'name' => 'Implants dentaires',
                'description' => 'Remplacement permanent de dent manquante',
                'category' => 'prothese',
                'price' => 8000.00,
                'duration' => 120,
                'is_active' => true,
            ],
            [
                'name' => 'Chirurgie buccale',
                'description' => 'Interventions chirurgicales complexes sur dents, gencives et mâchoire',
                'category' => 'chirurgie',
                'price' => 2500.00,
                'duration' => 90,
                'is_active' => true,
            ],
            [
                'name' => 'Parodontologie / Traitement des gencives',
                'description' => 'Soins des tissus parodontaux et traitement des maladies des gencives',
                'category' => 'parodontie',
                'price' => 600.00,
                'duration' => 45,
                'is_active' => true,
            ],
            [
                'name' => 'Blanchiment des dents',
                'description' => 'Amélioration de la couleur et de l\'esthétique dentaire',
                'category' => 'esthetique',
                'price' => 2000.00,
                'duration' => 90,
                'is_active' => true,
            ],
        ];

        foreach ($treatments as $treatment) {
            Treatment::create($treatment);
        }

        $this->command->info('✅ Treatments table seeded successfully!');
    }
}
