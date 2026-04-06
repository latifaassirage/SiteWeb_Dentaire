<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Treatment;
use App\Models\PatientProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@dentalflow.com',
            'password' => Hash::make('password'),
            'phone' => '+212600000000',
            'role' => 'admin',
        ]);

        // Create doctor user
        $doctor = User::create([
            'name' => 'Dr. Sarah Johnson',
            'email' => 'doctor@dentalflow.com',
            'password' => Hash::make('password'),
            'phone' => '+212600000001',
            'role' => 'doctor',
        ]);

        // Create sample patients
        $patient1 = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'phone' => '+212600000002',
            'role' => 'patient',
        ]);

        $patient2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
            'phone' => '+212600000003',
            'role' => 'patient',
        ]);

        // Create patient profiles
        PatientProfile::create([
            'user_id' => $patient1->id,
            'date_of_birth' => '1990-05-15',
            'address' => '123 Main Street, Casablanca',
            'cin' => 'AB123456',
            'medical_history' => 'No known allergies',
            'emergency_contact_name' => 'Mary Doe',
            'emergency_contact_phone' => '+212600000004',
            'insurance_company' => 'AXA Insurance',
            'insurance_number' => 'AXA123456',
        ]);

        PatientProfile::create([
            'user_id' => $patient2->id,
            'date_of_birth' => '1985-08-22',
            'address' => '456 Oak Avenue, Rabat',
            'cin' => 'CD789012',
            'medical_history' => 'Allergic to penicillin',
            'emergency_contact_name' => 'Bob Smith',
            'emergency_contact_phone' => '+212600000005',
            'insurance_company' => 'Wafa Assurance',
            'insurance_number' => 'WAFA789012',
        ]);

        // Call the TreatmentSeeder
        $this->call([
            TreatmentSeeder::class,
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin login: admin@dentalflow.com / password');
        $this->command->info('Doctor login: doctor@dentalflow.com / password');
        $this->command->info('Patient login: john@example.com / password');
    }
}
