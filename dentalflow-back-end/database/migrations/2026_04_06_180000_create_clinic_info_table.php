<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clinic_info', function (Blueprint $table) {
            $table->id();
            $table->string('clinic_name')->default('DentalFlow');
            $table->string('email')->default('contact@dentalflow.com');
            $table->string('phone')->default('+212 6 XX XX XX XX');
            $table->text('address')->default('N° 45, Avenue Mohammed V, Guelmim, Maroc');
            
            // Working hours as JSON for flexibility
            $table->json('working_hours')->default(json_encode([
                'monday_friday' => ['08:00-13:00', '14:00-18:00'],
                'saturday' => '08:00-14:30',
                'sunday' => 'Fermé'
            ]));
            
            $table->timestamps();
            
            // Only one record should exist
            $table->unique(['id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinic_info');
    }
};
