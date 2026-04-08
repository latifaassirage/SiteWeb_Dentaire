<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    // Admin: كل الفواتير
    public function index()
    {
        $invoices = Invoice::with(['patient', 'appointment.treatment'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($invoices);
    }

    // Patient: My Invoices
    public function myInvoices(Request $request)
    {
        $invoices = Invoice::where('patient_id', $request->user()->id)
            ->with('appointment.treatment')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($invoices);
    }

    // Admin: Create Invoice
    public function store(Request $request)
    {
        $existing = Invoice::where('appointment_id', $request->appointment_id)->first();
        if ($existing) {
            return response()->json($existing, 200);
        }
        
        $request->validate([
            'patient_id'     => 'required|exists:users,id',
            'appointment_id' => 'required|exists:appointments,id',
            'amount'         => 'required|numeric|min:0',
            'status'         => 'required|in:en_attente_paiement,unpaid,paid',
        ]);

        $invoice = Invoice::create([
            'patient_id'     => $request->patient_id,
            'appointment_id' => $request->appointment_id,
            'amount'         => $request->amount,
            'status'         => 'unpaid',
            'issued_at'      => now(),
        ]);

        return response()->json($invoice, 201);
    }

    // Admin: Record Payment
    public function markAsPaid($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->update([
            'status'  => 'paid',
            'paid_at' => now(),
        ]);
        return response()->json(['message' => 'Payment recorded successfully']);
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

        $unpaid = Invoice::where('status', 'unpaid')
            ->count();

        $totalPending = Invoice::where('status', 'unpaid')
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
}
