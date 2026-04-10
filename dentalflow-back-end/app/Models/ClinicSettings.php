<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicSettings extends Model
{
    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'json',
    ];

    /**
     * Get a setting value by key
     */
    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value
     */
    public static function set($key, $value)
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Get all settings as key-value array
     */
    public static function getAll()
    {
        return static::all()->pluck('value', 'key')->toArray();
    }

    /**
     * Get clinic basic info
     */
    public static function getClinicInfo()
    {
        return [
            'clinic_name' => static::get('clinic_name', 'DentalFlow'),
            'email' => static::get('email', 'contact@dentalflow.com'),
            'phone' => static::get('phone', '+212 6 XX XX XX XX'),
            'address' => static::get('address', 'N° 45, Avenue Mohammed V, Guelmim, Maroc'),
        ];
    }

    /**
     * Get working hours
     */
    public static function getWorkingHours()
    {
        return [
            'opening_time' => static::get('opening_time', '08:00'),
            'closing_time' => static::get('closing_time', '18:30'),
            'saturday_closing_time' => static::get('saturday_closing_time', '14:00'), // Saturday-specific closing
            'lunch_start' => static::get('lunch_start', '13:00'),
            'lunch_end' => static::get('lunch_end', '14:00'),
            'monday_friday' => static::get('monday_friday', ['08:00-13:00', '14:00-18:30']),
            'saturday' => static::get('saturday', '08:00-14:30'),
            'sunday' => static::get('sunday', 'Fermé'),
        ];
    }

    /**
     * Get available working days for patients
     */
    public static function getAvailableDays()
    {
        return [
            'monday'    => static::get('monday_enabled', true),
            'tuesday'   => static::get('tuesday_enabled', true),
            'wednesday' => static::get('wednesday_enabled', true),
            'thursday'  => static::get('thursday_enabled', true),
            'friday'    => static::get('friday_enabled', true),
            'saturday'  => static::get('saturday_enabled', false), // Disabled for patients
            'sunday'    => static::get('sunday_enabled', false), // Disabled for patients
        ];
    }

    /**
     * Update clinic info
     */
    public static function updateClinicInfo($data)
    {
        foreach ($data as $key => $value) {
            static::set($key, $value);
        }
        return true;
    }

    /**
     * Update working hours
     */
    public static function updateWorkingHours($data)
    {
        foreach ($data as $key => $value) {
            static::set($key, $value);
        }
        return true;
    }
}
