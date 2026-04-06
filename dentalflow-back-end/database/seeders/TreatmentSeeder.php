<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Treatment;

class TreatmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $treatments = [
            ['name' => 'General Consultation', 'duration' => 30, 'price' => 300.00, 'description' => 'General dental consultation and examination'],
            ['name' => 'Dental Cleaning', 'duration' => 45, 'price' => 400.00, 'description' => 'Professional teeth cleaning and polishing'],
            ['name' => 'Tooth Extraction', 'duration' => 60, 'price' => 800.00, 'description' => 'Simple tooth extraction'],
            ['name' => 'Root Canal', 'duration' => 90, 'price' => 1500.00, 'description' => 'Root canal treatment'],
            ['name' => 'Dental Filling', 'duration' => 60, 'price' => 600.00, 'description' => 'Composite or amalgam filling'],
            ['name' => 'Teeth Whitening', 'duration' => 120, 'price' => 2000.00, 'description' => 'Professional teeth whitening treatment'],
            ['name' => 'Dental Crown', 'duration' => 90, 'price' => 2500.00, 'description' => 'Porcelain or metal crown placement'],
            ['name' => 'Dental Bridge', 'duration' => 120, 'price' => 3500.00, 'description' => 'Fixed dental bridge placement'],
            ['name' => 'Dental Implant', 'duration' => 150, 'price' => 8000.00, 'description' => 'Single dental implant placement'],
            ['name' => 'Orthodontic Consultation', 'duration' => 45, 'price' => 500.00, 'description' => 'Orthodontic evaluation and treatment planning'],
        ];

        foreach ($treatments as $treatment) {
            Treatment::create($treatment);
        }
    }
}
