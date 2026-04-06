<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClinicInfo;

class ClinicInfoSeeder extends Seeder
{
    public function run()
    {
        ClinicInfo::updateInfo([
            'clinic_name' => 'DentalFlow',
            'email' => 'contact@dentalflow.com',
            'phone' => '+212 5 28 45 67 89',
            'address' => 'N° 123, Avenue Hassan II, Guelmimim, Maroc',
            'working_hours' => [
                'monday_friday' => ['08:30-13:00', '14:30-18:30'],
                'saturday' => '08:30-14:00',
                'sunday' => 'Fermé'
            ]
        ]);

        $this->command->info('✅ Clinic info table seeded successfully!');
    }
}
