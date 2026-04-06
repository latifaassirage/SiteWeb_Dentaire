<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('paid'); // paid, pending, refunded
            $table->string('payment_method')->default('cash'); // cash, card, transfer
            $table->text('description')->nullable();
            $table->timestamp('payment_date')->useCurrent();
            $table->timestamps();
            
            $table->index(['payment_date', 'status']);
            $table->index('patient_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
