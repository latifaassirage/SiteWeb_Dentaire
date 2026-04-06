<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClinicSetting;

class ClinicSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaultSettings = [
            'clinic_name' => 'DentalFlow',
            'email' => '[Your Admin Gmail]',
            'phone' => '+212 6 XX XX XX XX',
            'address' => 'N° 45, Avenue Mohammed V, Guelmim, Maroc',
            'working_hours' => json_encode([
                'monday_friday' => '09:00 - 18:30',
                'saturday' => '09:00 - 14:00',
                'sunday' => 'Fermé'
            ]),
            'logo' => null,
            'appointment_duration' => '30',
            'opening_time' => '09:00',
            'closing_time' => '18:30',
            'lunch_start' => '12:00',
            'lunch_end' => '14:00'
        ];

        foreach ($defaultSettings as $key => $value) {
            ClinicSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        $this->command->info('✅ Default clinic settings seeded successfully!');
    }
}
