<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicInfo extends Model
{
    protected $fillable = [
        'clinic_name',
        'email',
        'phone', 
        'address',
        'working_hours'
    ];

    protected $casts = [
        'working_hours' => 'array',
    ];

    /**
     * Get the single clinic info record
     */
    public static function getInfo()
    {
        return static::first() ?: new static([
            'clinic_name' => 'DentalFlow',
            'email' => 'contact@dentalflow.com',
            'phone' => '+212 6 XX XX XX XX',
            'address' => 'N° 45, Avenue Mohammed V, Guelmim, Maroc',
            'working_hours' => [
                'monday_friday' => ['08:00-13:00', '14:00-18:00'],
                'saturday' => '08:00-14:30',
                'sunday' => 'Fermé'
            ]
        ]);
    }

    /**
     * Update clinic info
     */
    public static function updateInfo($data)
    {
        $info = static::first() ?: new static();
        $info->fill($data);
        $info->save();
        return $info;
    }
}
