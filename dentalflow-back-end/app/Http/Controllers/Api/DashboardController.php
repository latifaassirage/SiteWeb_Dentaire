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
            
            // Fix 1: Appointments Today - All confirmed appointments for today
            $todayAppointments = Appointment::whereDate('start_time', today())
                ->whereIn('status', ['confirmé', 'terminé'])
                ->with(['patient', 'treatment'])
                ->orderBy('start_time', 'asc')
                ->get()
                ->map(fn ($appointment) => [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient?->name ?? 'Unknown',
                    'treatment_name' => $appointment->treatment?->name ?? 'Consultation',
                    'date' => $appointment->start_time->format('Y-m-d H:i'),
                    'status' => $appointment->status,
                ]);

            // Fix 2: "En Attente" - Patients currently in clinic (confirmed OR terminé but not yet paid)
            $enAttentePatients = Appointment::with(['patient', 'treatment'])
                ->where(function($query) {
                    // Waiting for doctor
                    $query->where('status', 'confirmé')
                          // OR waiting to pay (terminé but not paid)
                          ->orWhere(function($subQuery) {
                              $subQuery->where('status', 'terminé')
                                       ->whereDoesntHave('invoices', function($invoiceQuery) {
                                           $invoiceQuery->where('status', 'paid');
                                       });
                          });
                })
                ->orderBy('start_time', 'asc')
                ->get()
                ->map(fn ($appointment) => [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient?->name ?? 'Unknown',
                    'treatment_name' => $appointment->treatment?->name ?? 'Consultation',
                    'date' => $appointment->start_time->format('Y-m-d H:i'),
                    'status' => $appointment->status,
                    'waiting_type' => $appointment->status === 'confirmé' ? 'doctor' : 'payment',
                ]);

            // Fix 3: Statistics Cards
            $stats = [
                'appointments_today' => Appointment::whereDate('start_time', today())
                    ->whereIn('status', ['confirmé', 'terminé'])
                    ->count() ?? 0,
                'en_attente_count' => $enAttentePatients->count(),
                'confirmed' => Appointment::where('status', 'confirmé')->count(),
                'completed' => Appointment::where('status', 'terminé')->count(),
                'total_patients' => User::where('role', 'patient')->count() ?? 0,
            ];
            
            // Fix 4: Pending Payments - Sum of terminé appointments that are not paid
            $pendingPayments = Appointment::join('invoices', 'appointments.id', '=', 'invoices.appointment_id')
                ->where('appointments.status', 'terminé')
                ->where('invoices.status', '!=', 'paid')
                ->sum('invoices.amount');
            
            $stats['pending_payments'] = (float) $pendingPayments ?: 0;
            
            // Calculate revenue from paid invoices only (actual money received)
            $stats['total_revenue'] = Invoice::where('status', 'paid')->sum('amount') ?? 0;
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
                'today_appointments' => $todayAppointments,
                'en_attente_patients' => $enAttentePatients,
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
                'en_attente_count' => 0,
                'confirmed' => 0,
                'completed' => 0,
                'total_patients' => 0,
                'pending_payments' => 0,
                'total_revenue' => 0,
                'paid_invoices' => 0,
                'today_appointments' => [],
                'en_attente_patients' => [],
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
            
            // Get invoice revenue by month only (actual money received)
            $invoiceMonthlyRevenue = Invoice::where('status', 'paid')
                ->whereYear('paid_at', now()->year)
                ->selectRaw('MONTHNAME(paid_at) as month, SUM(amount) as revenue')
                ->groupBy(DB::raw('MONTHNAME(paid_at)'))
                ->orderBy(DB::raw('MONTH(paid_at)'))
                ->get()
                ->keyBy('month');
            
            // Return monthly revenue from paid invoices only
            return collect($allMonths)->map(function ($month) use ($invoiceMonthlyRevenue) {
                $invoiceRevenue = $invoiceMonthlyRevenue->get($month, (object) ['revenue' => 0])->revenue;
                
                return [
                    'month' => substr($month, 0, 3),
                    'revenue' => (float) $invoiceRevenue,
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
