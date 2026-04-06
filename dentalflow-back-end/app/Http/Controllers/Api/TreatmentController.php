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
        ]);

        $treatment = Treatment::create($request->only([
            'name', 'description', 'duration', 'price'
        ]));

        return response()->json($treatment, 201);
    }

    public function update(Request $request, $id)
    {
        $treatment = Treatment::findOrFail($id);
        $treatment->update($request->only([
            'name', 'description', 'duration', 'price'
        ]));
        return response()->json($treatment);
    }

    public function destroy($id)
    {
        Treatment::findOrFail($id)->delete();
        return response()->json(['message' => 'Treatment deleted']);
    }
}
