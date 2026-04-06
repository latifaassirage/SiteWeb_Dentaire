<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PatientProfile;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index()
    {
        $patients = User::where('role', 'patient')
            ->with('patientProfile')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($patients);
    }

    public function show($id)
    {
        try {
            $patient = User::with([
                'appointments.treatment',
                'appointments.invoice'
            ])->findOrFail($id);
            
            \Log::info('Patient appointments:', $patient->appointments->toArray());
            return response()->json($patient);
        } catch (\Exception $e) {
            \Log::error('PatientController@show error:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $patient = User::findOrFail($id);

        $patient->update($request->only(['name', 'email', 'phone']));

        if ($patient->patientProfile) {
            $patient->patientProfile->update(
                $request->only(['date_of_birth', 'address', 'cin', 'medical_history'])
            );
        } else {
            PatientProfile::create(array_merge(
                $request->only(['date_of_birth', 'address', 'cin', 'medical_history']),
                ['user_id' => $id]
            ));
        }

        return response()->json(['message' => 'Patient updated successfully']);
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Patient deleted successfully']);
    }
}
