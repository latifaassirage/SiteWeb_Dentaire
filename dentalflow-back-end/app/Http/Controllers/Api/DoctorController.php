<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = User::whereIn('role', ['doctor', 'admin'])
            ->select('id', 'name', 'email', 'phone')
            ->get();
        return response()->json($doctors);
    }
}
