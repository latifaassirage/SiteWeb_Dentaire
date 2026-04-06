<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value'];

    /**
     * Get setting value by key
     */
    public static function getValue($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set setting value by key
     */
    public static function setValue($key, $value)
    {
        return static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Get all settings as key-value array
     */
    public static function getAll()
    {
        $settings = static::all();
        $result = [];
        
        foreach ($settings as $setting) {
            // Handle JSON values
            if (json_decode($setting->value) !== null) {
                $result[$setting->key] = json_decode($setting->value, true);
            } else {
                $result[$setting->key] = $setting->value;
            }
        }
        
        return $result;
    }
}
