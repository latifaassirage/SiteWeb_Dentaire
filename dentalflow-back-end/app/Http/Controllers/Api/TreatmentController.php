<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Treatment;
use Illuminate\Http\Request;

class TreatmentController extends Controller
{
    public function index()
    {
        return response()->json(Treatment::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'price'    => 'required|numeric|min:0',
            'category'  => 'required|string|in:general,cosmetic',
            'description' => 'nullable|string',
        ]);

        $treatment = Treatment::create($request->only([
            'name', 'description', 'duration', 'price', 'category'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Treatment created successfully',
            'treatment' => $treatment
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $treatment = Treatment::findOrFail($id);
        
        // Use sometimes rule for flexible validation - only validate fields that are sent
        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'duration'    => 'sometimes|required|integer|min:1',
            'price'       => 'sometimes|required|numeric|min:0',
            'category'     => 'sometimes|required|string|in:general,cosmetic',
        ]);
        
        // Update only the validated fields
        $treatment->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Treatment updated successfully',
            'treatment' => $treatment->fresh()
        ]);
    }

    public function destroy($id)
    {
        Treatment::findOrFail($id)->delete();
        return response()->json(['message' => 'Treatment deleted']);
    }
}
