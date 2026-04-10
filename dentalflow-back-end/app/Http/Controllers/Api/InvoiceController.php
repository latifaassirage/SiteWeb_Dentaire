<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Appointment;
use App\Models\Payment;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    // Admin: tous les factures
    public function index(Request $request)
    {
        $query = Invoice::with(['patient', 'appointment.treatment'])
            ->orderBy('created_at', 'desc');
        
        // Filter by appointment_id if provided
        if ($request->has('appointment_id')) {
            $query->where('appointment_id', $request->appointment_id);
        }
        
        $invoices = $query->get();
        
        // Log current invoice statuses for debugging
        \Log::info('Current invoice statuses:', [
            'total_invoices' => $invoices->count(),
            'statuses' => $invoices->pluck('status')->unique()->toArray(),
            'unpaid_count' => $invoices->where('status', 'unpaid')->count(),
            'paid_count' => $invoices->where('status', 'paid')->count(),
        ]);
        
        // CRITICAL: Verify no auto-paid invoices
        $autoPaidInvoices = $invoices->filter(function($invoice) {
            return $invoice->status === 'paid' && is_null($invoice->paid_at);
        });
        if ($autoPaidInvoices->count() > 0) {
            \Log::error('CRITICAL: Found paid invoices without paid_at timestamp!', [
                'count' => $autoPaidInvoices->count(),
                'invoice_ids' => $autoPaidInvoices->pluck('id')->toArray()
            ]);
        }
        
        return response()->json($invoices);
    }

    // Patient: My Invoices (all)
    public function myInvoices(Request $request)
    {
        $invoices = Invoice::where('patient_id', $request->user()->id)
            ->with('appointment.treatment')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($invoices);
    }

    // Patient: My Unpaid Invoices
    public function myUnpaidInvoices(Request $request)
    {
        $invoices = Invoice::where('patient_id', $request->user()->id)
            ->whereIn('status', ['unpaid', 'en_attente_paiement'])
            ->with('appointment.treatment')
            ->orderBy('created_at', 'desc')
            ->get();
            
        // Calculate summary
        $totalAmount = $invoices->sum('amount');
        $totalCount = $invoices->count();
        
        return response()->json([
            'invoices' => $invoices,
            'summary' => [
                'total_count' => $totalCount,
                'total_amount' => (float) $totalAmount,
                'formatted_amount' => number_format($totalAmount, 2, ',', ' ') . ' MAD'
            ]
        ]);
    }

    // Admin: Create Invoice
    public function store(Request $request)
    {
        $existing = Invoice::where('appointment_id', $request->appointment_id)->first();
        if ($existing) {
            return response()->json($existing, 200);
        }
        
        $validated = $request->validate([
            'patient_id'     => 'required|exists:users,id',
            'appointment_id' => 'required|exists:appointments,id',
            'amount'         => 'required|numeric|min:0',
            'status'         => 'required|in:unpaid,paid,en_attente_paiement',
        ]);

        $invoice = Invoice::create([
            'patient_id'     => $request->patient_id,
            'appointment_id' => $request->appointment_id,
            'amount'         => $request->amount,
            'status'         => 'unpaid',
            'issued_at'      => now(),
        ]);

        \Log::info('Invoice created in store method:', [
            'invoice_id' => $invoice->id,
            'status' => $invoice->status,
            'amount' => $invoice->amount,
            'appointment_id' => $invoice->appointment_id,
            'requested_status' => $request->status
        ]);

        return response()->json($invoice, 201);
    }

    // Admin: Record Payment
    public function markAsPaid($id)
    {
        try {
            $invoice = Invoice::findOrFail($id);
            
            // Update invoice status and set paid_at
            $invoice->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);
            
            // Create payment record
            Payment::create([
                'appointment_id' => $invoice->appointment_id,
                'patient_id'     => $invoice->patient_id,
                'amount'         => $invoice->amount,
                'status'         => 'paid',
                'payment_method' => 'cash', // Default payment method
                'description'    => 'Payment for invoice #' . $invoice->id,
                'payment_date'   => now(),
            ]);
            
            return response()->json(['message' => 'Payment recorded successfully']);
        } catch (\Exception $e) {
            \Log::error('Error marking invoice as paid:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to record payment'], 500);
        }
    }

    // Admin: Cancel Payment
    public function markAsUnpaid($id)
    {
        try {
            $invoice = Invoice::findOrFail($id);
            
            // Update invoice status and clear paid_at
            $invoice->update([
                'status'  => 'en_attente_paiement',
                'paid_at' => null,
            ]);
            
            // Delete payment record if exists
            Payment::where('appointment_id', $invoice->appointment_id)->delete();
            
            return response()->json(['message' => 'Payment cancelled successfully']);
        } catch (\Exception $e) {
            \Log::error('Error marking invoice as unpaid:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to cancel payment'], 500);
        }
    }

    // Admin: Create unpaid invoice for terminé appointment
    public function createUnpaidInvoice(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);
        
        // Check if invoice already exists
        $existingInvoice = Invoice::where('appointment_id', $appointment->id)->first();
        if ($existingInvoice) {
            if ($existingInvoice->status === 'paid') {
                return response()->json(['message' => 'Invoice already paid'], 400);
            }
            // Return existing unpaid invoice
            return response()->json($existingInvoice);
        }

        // Create new unpaid invoice
        $invoice = Invoice::create([
            'patient_id'     => $appointment->patient_id,
            'appointment_id' => $appointment->id,
            'amount'         => $appointment->treatment->price ?? 0,
            'status'         => 'unpaid',
            'issued_at'      => now(),
        ]);

        return response()->json($invoice, 201);
    }

    // Admin: إحصائيات مالية
    public function stats()
    {
        $today = Invoice::where('status', 'paid')
            ->whereDate('paid_at', today())
            ->sum('amount');

        $month = Invoice::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $total = Invoice::where('status', 'paid')
            ->sum('amount');

        $unpaid = Invoice::whereIn('status', ['unpaid', 'en_attente_paiement'])
            ->count();

        // Total Pending = sum of amounts for invoices that are unpaid or en_attente_paiement
        $totalPending = Invoice::whereIn('status', ['unpaid', 'en_attente_paiement'])
            ->sum('amount');

        $totalTransactions = Invoice::count();

        return response()->json([
            'today'             => (float) $today ?: 0,
            'month'             => (float) $month ?: 0,
            'total'             => (float) $total ?: 0,
            'unpaid'            => (int) $unpaid ?: 0,
            'total_pending'     => (float) $totalPending ?: 0,
            'total_transactions'=> (int) $totalTransactions ?: 0,
        ]);
    }

    // Admin: Monthly revenue data for chart
    public function monthly()
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $amount = Invoice::where('status', 'paid')
                ->whereMonth('paid_at', $month->month)
                ->whereYear('paid_at', $month->year)
                ->sum('amount');
            $data[] = [
                'month' => $month->format('M'),
                'amount' => (float) $amount ?: 0,
            ];
        }
        return response()->json($data);
    }

    // Admin: Daily revenue for current month chart
    public function dailyRevenue()
    {
        $data = [];
        $currentMonth = now()->month;
        $currentYear = now()->year;
        $daysInMonth = now()->daysInMonth;

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = now()->setDate($currentYear, $currentMonth, $day)->format('Y-m-d');
            
            $total = Invoice::where('status', 'paid')
                ->whereDate('paid_at', $date)
                ->sum('amount');
                
            $data[] = [
                'date' => $date,
                'total' => (float) $total ?: 0,
            ];
        }

        return response()->json($data);
    }

    // Admin: Get terminé appointments without paid invoices
    public function getTerminéAppointments()
    {
        try {
            $terminéAppointments = Appointment::with(['patient', 'treatment'])
                ->where('status', 'terminé')
                ->whereDoesntHave('invoices', function($q) {
                    $q->where('status', 'paid');
                })
                ->orderBy('start_time', 'desc')
                ->get()
                ->map(function($appointment) {
                    return [
                        'id' => null, // No invoice ID yet
                        'patient_id' => $appointment->patient_id,
                        'appointment_id' => $appointment->id,
                        'amount' => $appointment->treatment->price ?? 0,
                        'status' => 'unpaid',
                        'issued_at' => $appointment->start_time,
                        'paid_at' => null,
                        'payment_date' => null,
                        'created_at' => $appointment->start_time,
                        'updated_at' => $appointment->updated_at,
                        'patient' => $appointment->patient,
                        'appointment' => $appointment,
                        'is_terminé_appointment' => true
                    ];
                });

            return response()->json($terminéAppointments);
        } catch (\Exception $e) {
            \Log::error('Error getting terminé appointments:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to get terminé appointments'], 500);
        }
    }
}
