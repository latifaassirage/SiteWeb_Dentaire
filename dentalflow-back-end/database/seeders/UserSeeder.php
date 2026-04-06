<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@dental.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '0600000000',
        ]);

        // Create Patient user
        User::create([
            'name' => 'Patient Test',
            'email' => 'patient@dental.com',
            'password' => Hash::make('patient123'),
            'role' => 'patient',
            'phone' => '0612345678',
        ]);

        $this->command->info('Test users created successfully!');
    }
}
