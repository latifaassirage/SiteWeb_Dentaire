<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicSetting;
use Illuminate\Http\Request;

class ClinicSettingController extends Controller
{
    /**
     * Get all clinic settings
     */
    public function index()
    {
        $settings = ClinicSetting::getAll();
        
        // Ensure all required settings exist with defaults
        $defaults = [
            'clinic_name' => 'DentalFlow',
            'email' => 'admin@dental.com',
            'phone' => '+212 6 XX XX XX XX',
            'address' => 'N° 45, Avenue Mohammed V, Guelmim, Maroc',
            'working_hours' => json_encode([
                'monday_friday' => '09:00 - 18:30',
                'saturday' => '09:00 - 14:00',
                'sunday' => 'Fermé'
            ]),
            'logo' => null,
            'appointment_duration' => '30',
            'opening_time' => '09:00',
            'closing_time' => '18:30',
            'lunch_start' => '12:00',
            'lunch_end' => '14:00'
        ];

        // Merge with defaults for missing keys
        foreach ($defaults as $key => $value) {
            if (!isset($settings[$key])) {
                $settings[$key] = json_decode($value) ?? $value;
            }
        }

        return response()->json($settings);
    }

    /**
     * Update clinic settings
     */
    public function update(Request $request)
    {
        \Log::info('🔧 Clinic settings update request:', [
            'all_data' => $request->all(),
            'validated' => $request->validate([
                'clinic_name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email',
                'phone' => 'sometimes|string|max:20',
                'address' => 'sometimes|string|max:500',
                'working_hours' => 'sometimes|array',
                'logo' => 'sometimes|string|nullable',
                'appointment_duration' => 'sometimes|string|in:15,30,45,60',
                'opening_time' => 'sometimes|string',
                'closing_time' => 'sometimes|string',
                'lunch_start' => 'sometimes|string',
                'lunch_end' => 'sometimes|string',
            ])
        ]);

        $updates = $request->all();

        foreach ($updates as $key => $value) {
            if (is_array($value)) {
                ClinicSetting::setValue($key, json_encode($value));
            } else {
                ClinicSetting::setValue($key, $value);
            }
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => ClinicSetting::getAll()
        ]);
    }
}
