<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicSettings;
use App\Models\ClinicInfo;
use App\Models\Service;
use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClinicSettingsController extends Controller
{
    /**
     * Get all clinic settings
     */
    public function index()
    {
        try {
            $clinicInfo = ClinicInfo::getInfo();
            $workingHours = $clinicInfo->working_hours;
            
            return response()->json([
                'clinic_info' => [
                    'clinic_name' => $clinicInfo->clinic_name,
                    'email' => $clinicInfo->email,
                    'phone' => $clinicInfo->phone,
                    'address' => $clinicInfo->address,
                ],
                'working_hours' => $workingHours,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching clinic settings:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch settings'], 500);
        }
    }

    /**
     * Update clinic basic info
     */
    public function updateClinicInfo(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'clinic_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:50',
                'address' => 'required|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $clinicInfo = ClinicInfo::updateInfo($request->all());

            return response()->json([
                'message' => 'Clinic information updated successfully',
                'clinic_info' => [
                    'clinic_name' => $clinicInfo->clinic_name,
                    'email' => $clinicInfo->email,
                    'phone' => $clinicInfo->phone,
                    'address' => $clinicInfo->address,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating clinic info:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update clinic information'], 500);
        }
    }

    /**
     * Update working hours
     */
    public function updateWorkingHours(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'monday_friday' => 'required|array',
                'monday_friday.*' => 'required|string|regex:/^\d{2}:\d{2}-\d{2}:\d{2}$/',
                'saturday' => 'required|string|regex:/^\d{2}:\d{2}-\d{2}:\d{2}$|^Fermé$/',
                'sunday' => 'required|string|in:Fermé',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $workingHours = [
                'monday_friday' => $request->monday_friday,
                'saturday' => $request->saturday,
                'sunday' => $request->sunday,
            ];

            ClinicInfo::updateInfo(['working_hours' => $workingHours]);

            return response()->json([
                'message' => 'Working hours updated successfully',
                'working_hours' => $workingHours
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating working hours:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update working hours'], 500);
        }
    }

    /**
     * Get services for homepage
     */
    public function getServices()
    {
        try {
            $services = Service::getForHomepage();
            return response()->json($services);
        } catch (\Exception $e) {
            \Log::error('Error fetching services:', ['error' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }

    /**
     * Update services
     */
    public function updateServices(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'services' => 'required|array',
                'services.*.id' => 'required|integer',
                'services.*.title' => 'required|string|max:255',
                'services.*.description' => 'required|string|max:500',
                'services.*.icon_name' => 'required|string|max:50',
                'services.*.is_active' => 'boolean',
                'services.*.sort_order' => 'integer',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            foreach ($request->services as $serviceData) {
                Service::updateOrCreate(
                    ['id' => $serviceData['id']],
                    $serviceData
                );
            }

            return response()->json([
                'message' => 'Services updated successfully',
                'services' => Service::getForHomepage()
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating services:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update services'], 500);
        }
    }

    /**
     * Add new service
     */
    public function addService(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string|max:500',
                'icon_name' => 'required|string|max:50',
                'image_path' => 'nullable|string|max:255',
                'sort_order' => 'integer',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $service = Service::create([
                'title' => $request->title,
                'description' => $request->description,
                'icon_name' => $request->icon_name,
                'image_path' => $request->image_path,
                'sort_order' => $request->sort_order ?? 0,
                'is_active' => true,
            ]);

            return response()->json([
                'message' => 'Service added successfully',
                'service' => $service
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error adding service:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to add service'], 500);
        }
    }

    /**
     * Delete service
     */
    public function deleteService($id)
    {
        try {
            $service = Service::findOrFail($id);
            $service->delete();

            return response()->json(['message' => 'Service deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Error deleting service:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete service'], 500);
        }
    }

    /**
     * Get treatments with prices
     */
    public function getTreatments()
    {
        try {
            $treatments = Treatment::where('is_active', true)
                ->orderBy('category')
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'category', 'price', 'duration']);

            return response()->json($treatments);
        } catch (\Exception $e) {
            \Log::error('Error fetching treatments:', ['error' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }

    /**
     * Add new treatment
     */
    public function addTreatment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:treatments',
                'description' => 'nullable|string|max:1000',
                'category' => 'required|string|max:100',
                'price' => 'required|numeric|min:0',
                'duration' => 'nullable|integer|min:15|max:480',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $treatment = Treatment::create([
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'price' => $request->price,
                'duration' => $request->duration || 60,
                'is_active' => true,
            ]);

            return response()->json([
                'message' => 'Treatment added successfully',
                'treatment' => $treatment
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error adding treatment:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to add treatment'], 500);
        }
    }

    /**
     * Update treatment
     */
    public function updateTreatment(Request $request, $id)
    {
        try {
            $treatment = Treatment::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:treatments,name,' . $id,
                'description' => 'nullable|string|max:1000',
                'category' => 'required|string|max:100',
                'price' => 'required|numeric|min:0',
                'duration' => 'nullable|integer|min:15|max:480',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $treatment->update($request->all());

            return response()->json([
                'message' => 'Treatment updated successfully',
                'treatment' => $treatment
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating treatment:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update treatment'], 500);
        }
    }

    /**
     * Delete treatment
     */
    public function deleteTreatment($id)
    {
        try {
            $treatment = Treatment::findOrFail($id);
            $treatment->delete();

            return response()->json(['message' => 'Treatment deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Error deleting treatment:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete treatment'], 500);
        }
    }
}
