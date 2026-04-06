<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Treatment extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category',
        'duration',
        'price',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Scope to get only active treatments
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get treatments by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get all available categories
     */
    public static function getCategories()
    {
        return static::active()->distinct()->pluck('category')->sort()->values();
    }

    /**
     * Relationship with appointments
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Relationship with invoices
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Format price for display
     */
    public function getFormattedPriceAttribute()
    {
        return number_format((float) $this->price, 2) . ' MAD';
    }

    /**
     * Helper method to get duration in hours and minutes
     */
    // Helper method to get duration in hours and minutes
    public function getFormattedDurationAttribute()
    {
        $hours = floor($this->duration / 60);
        $minutes = $this->duration % 60;
        
        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}min";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}min";
        }
    }
}
