<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClinicSettings;

class ClinicSettingsSeeder extends Seeder
{
    public function run()
    {
        // Basic Clinic Information
        ClinicSettings::set('clinic_name', 'DentalFlow');
        ClinicSettings::set('email', 'contact@dentalflow.com');
        ClinicSettings::set('phone', '+212 6 XX XX XX XX');
        ClinicSettings::set('address', 'N° 45, Avenue Mohammed V, Guelmim, Maroc');

        // Working Hours
        ClinicSettings::set('monday_friday', ['08:00-13:00', '14:00-18:00']);
        ClinicSettings::set('saturday', '08:00-14:30');
        ClinicSettings::set('sunday', 'Fermé');

        // Services for Homepage
        $services = [
            [
                'id' => 1,
                'title' => 'Consultation Générale',
                'description' => 'Examen dentaire complet et diagnostic',
                'icon' => '🦷'
            ],
            [
                'id' => 2,
                'title' => 'Blanchiment Dentaire',
                'description' => 'Techniques modernes pour un sourire éclatant',
                'icon' => '✨'
            ],
            [
                'id' => 3,
                'title' => 'Orthodontie',
                'description' => 'Correction de l\'alignement dentaire',
                'icon' => '🦷'
            ],
            [
                'id' => 4,
                'title' => 'Implants Dentaires',
                'description' => 'Solutions permanentes pour dents manquantes',
                'icon' => '🔧'
            ]
        ];
        ClinicSettings::set('services', $services);

        $this->command->info('✅ Clinic settings seeded successfully!');
    }
}
