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
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('status', ['en_attente', 'en_cours', 'confirmé', 'annulé', 'terminé', 'absent'])
                  ->default('en_attente')
                  ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('status', ['en_attente', 'confirmé', 'annulé', 'terminé', 'absent'])
                  ->default('en_attente')
                  ->change();
        });
    }
};
