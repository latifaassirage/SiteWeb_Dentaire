<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceTableSeeders extends Seeder
{
    public function run(): void
    {
        DB::table('services')->truncate();
        
        DB::table('services')->insert([
            ['title' => 'Soins conservateurs et restauration dentaire', 'description' => 'Réparation du tissu dentaire endommagé par les caries', 'icon_name' => '🦷', 'image_path' => null, 'is_active' => 1, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Hygiène et prévention bucco-dentaire', 'description' => 'Nettoyage professionnel et prévention des maladies dentaires', 'icon_name' => '✨', 'image_path' => null, 'is_active' => 1, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Endodontie et traitement des infections dentaires', 'description' => 'Traitement canalaire et élimination des infections', 'icon_name' => '🔬', 'image_path' => null, 'is_active' => 1, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Prothèses dentaires fixes et restauration', 'description' => 'Couronnes et bridges pour restaurer vos dents', 'icon_name' => '👑', 'image_path' => null, 'is_active' => 1, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Chirurgie dentaire et extractions', 'description' => 'Extractions simples et complexes réalisées avec soin', 'icon_name' => '🏥', 'image_path' => null, 'is_active' => 1, 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Orthodontie et alignement des dents', 'description' => 'Appareils et aligneurs pour un sourire parfait', 'icon_name' => '😁', 'image_path' => null, 'is_active' => 1, 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Implantologie et remplacement des dents', 'description' => 'Implants dentaires pour remplacer les dents manquantes', 'icon_name' => '⚙️', 'image_path' => null, 'is_active' => 1, 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Chirurgie buccale spécialisée', 'description' => 'Interventions chirurgicales complexes de la bouche', 'icon_name' => '🩺', 'image_path' => null, 'is_active' => 1, 'sort_order' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Soins et traitement des gencives', 'description' => 'Parodontologie et traitement des maladies des gencives', 'icon_name' => '🛡️', 'image_path' => null, 'is_active' => 1, 'sort_order' => 9, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Esthétique dentaire et blanchiment', 'description' => 'Blanchiment et techniques pour un sourire éclatant', 'icon_name' => '⭐', 'image_path' => null, 'is_active' => 1, 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
