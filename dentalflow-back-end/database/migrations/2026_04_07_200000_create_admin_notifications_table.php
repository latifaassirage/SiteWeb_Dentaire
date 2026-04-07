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
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('message');
            $table->string('type')->default('new_appointment'); // new_appointment, new_patient, system, etc.
            $table->boolean('is_read')->default(false);
            $table->json('data')->nullable(); // Additional data like appointment_id, patient_id, etc.
            $table->timestamps();
            
            $table->index(['is_read', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
};
