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

    // Patient: فواتيره
    public function myInvoices(Request $request)
    {
        $invoices = Invoice::where('patient_id', $request->user()->id)
            ->with('appointment.treatment')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($invoices);
    }

    // Admin: إنشاء فاتورة
    public function store(Request $request)
    {
        $request->validate([
            'patient_id'     => 'required|exists:users,id',
            'appointment_id' => 'required|exists:appointments,id',
            'amount'         => 'required|numeric|min:0',
        ]);

        $invoice = Invoice::create([
            'patient_id'     => $request->patient_id,
            'appointment_id' => $request->appointment_id,
            'amount'         => $request->amount,
            'status'         => 'unpaid',
            'issued_at'      => now(),
        ]);

        return response()->json($invoice->load(['patient', 'appointment']), 201);
    }

    // Admin: تسجيل الدفع
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
        // Use payments table for actual revenue (money received)
        $today = Payment::where('status', 'paid')
            ->whereDate('payment_date', today())
            ->sum('amount');

        $month = Payment::where('status', 'paid')
            ->whereMonth('payment_date', now()->month)
            ->whereYear('payment_date', now()->year)
            ->sum('amount');

        $total = Payment::where('status', 'paid')->sum('amount');

        $unpaid = Invoice::where('status', 'unpaid')->count();

        return response()->json([
            'today'  => $today,
            'month'  => $month,
            'total'  => $total,
            'unpaid' => $unpaid,
        ]);
    }
}
