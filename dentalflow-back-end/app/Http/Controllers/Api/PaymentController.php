<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $payments = Payment::with(['appointment.treatment', 'patient'])
                ->orderBy('payment_date', 'desc')
                ->get();

            return response()->json($payments);
        } catch (\Exception $e) {
            \Log::error('Error fetching payments:', ['error' => $e->getMessage()]);
            return response()->json([], 200); // Return empty array instead of crashing
        }
    }

    public function stats(Request $request)
    {
        try {
            // Today's revenue - use exact column name from migration
            $todayRevenue = Payment::where('status', 'paid')
                ->whereDate('payment_date', today())
                ->sum('amount') ?? 0;

            // Monthly revenue - use exact column name from migration
            $monthlyRevenue = Payment::where('status', 'paid')
                ->whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount') ?? 0;

            // Total payments - safe count
            $totalPayments = Payment::count() ?? 0;
            
            // Today's payments count - safe count
            $todayPayments = Payment::whereDate('payment_date', today())->count() ?? 0;

            return response()->json([
                'today' => (float) $todayRevenue,
                'month' => (float) $monthlyRevenue,
                'total_payments' => $totalPayments,
                'today_payments' => $todayPayments,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching payment stats:', ['error' => $e->getMessage()]);
            return response()->json([
                'today' => 0,
                'month' => 0,
                'total_payments' => 0,
                'today_payments' => 0,
            ], 200);
        }
    }
}
