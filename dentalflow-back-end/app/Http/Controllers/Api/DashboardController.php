<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Debug: Count all appointments first
            $allAppointments = Appointment::count();
            Log::info('Total appointments in database: ' . $allAppointments);
            
            // Debug: Count by status
            $enAttenteCount = Appointment::where('status', 'en_attente')->count();
            $confirméCount = Appointment::where('status', 'confirmé')->count();
            $terminéCount = Appointment::where('status', 'terminé')->count();
            
            Log::info('Appointment counts by status:', [
                'en_attente' => $enAttenteCount,
                'confirmé' => $confirméCount,
                'terminé' => $terminéCount
            ]);
            
            // Debug: Get sample appointments with status
            $sampleAppointments = Appointment::select('id', 'status', 'start_time')
                ->limit(5)
                ->get()
                ->toArray();
            Log::info('Sample appointments:', $sampleAppointments);
            
            // Get basic statistics with safe fallbacks
            $stats = [
                'appointments_today' => Appointment::whereDate('start_time', today())->count() ?? 0,
                'pending' => $enAttenteCount,
                'confirmed' => $confirméCount,
                'completed' => $terminéCount,
                'total_patients' => User::where('role', 'patient')->count() ?? 0,
            ];
            
            // Calculate revenue from payments only (actual money received)
            $stats['total_revenue'] = Payment::where('status', 'paid')->sum('amount') ?? 0;
            $stats['paid_invoices'] = Invoice::where('status', 'paid')->count() ?? 0;
            
            // Get recent appointments with safe mapping
            $recentAppointments = Appointment::with(['patient', 'treatment'])
                ->orderBy('start_time', 'desc')
                ->take(5)
                ->get()
                ->map(fn ($appointment) => [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient?->name ?? 'Unknown',
                    'treatment_name' => $appointment->treatment?->name ?? 'Consultation',
                    'date' => $appointment->start_time->format('Y-m-d H:i'),
                    'status' => $appointment->status,
                ]);
            
            // Calculate monthly revenue
            $monthlyRevenue = $this->getMonthlyRevenue();
            
            $finalResponse = $stats + [
                'recent_appointments' => $recentAppointments,
                'monthly_revenue' => $monthlyRevenue,
            ];
            
            Log::info('Final dashboard response:', $finalResponse);
            
            return response()->json($finalResponse);
        } catch (\Exception $e) {
            Log::error('Dashboard API Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'appointments_today' => 0,
                'pending' => 0,
                'confirmed' => 0,
                'completed' => 0,
                'total_patients' => 0,
                'total_revenue' => 0,
                'paid_invoices' => 0,
                'recent_appointments' => [],
                'monthly_revenue' => $this->getEmptyMonthlyRevenue(),
            ], 200);
        }
    }
    
    private function getMonthlyRevenue(): array
    {
        try {
            $allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
            
            // Get payment revenue by month only (actual money received)
            $paymentMonthlyRevenue = Payment::where('status', 'paid')
                ->whereYear('payment_date', now()->year)
                ->selectRaw('MONTHNAME(payment_date) as month, SUM(amount) as revenue')
                ->groupBy(DB::raw('MONTHNAME(payment_date)'))
                ->orderBy(DB::raw('MONTH(payment_date)'))
                ->get()
                ->keyBy('month');
            
            // Return monthly revenue from payments only
            return collect($allMonths)->map(function ($month) use ($paymentMonthlyRevenue) {
                $paymentRevenue = $paymentMonthlyRevenue->get($month, (object) ['revenue' => 0])->revenue;
                
                return [
                    'month' => substr($month, 0, 3),
                    'revenue' => (float) $paymentRevenue,
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Monthly revenue calculation error:', ['error' => $e->getMessage()]);
            return $this->getEmptyMonthlyRevenue();
        }
    }
    
    private function getEmptyMonthlyRevenue(): array
    {
        $allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
        
        return collect($allMonths)->map(fn ($month) => [
            'month' => substr($month, 0, 3),
            'revenue' => 0,
        ])->toArray();
    }
}
