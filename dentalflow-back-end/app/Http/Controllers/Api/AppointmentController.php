<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Treatment;
use App\Models\User;
use App\Notifications\AppointmentBooked;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    // Check availability before booking
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'doctor_id'  => 'required|exists:users,id',
            'start_time' => 'required|date',
            'end_time'   => 'required|date',
        ]);

        $conflict = Appointment::where('doctor_id', $request->doctor_id)
            ->where('status', '!=', 'annulé')
            ->where(function ($q) use ($request) {
                $q->whereBetween('start_time', [$request->start_time, $request->end_time])
                  ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                  ->orWhere(function ($q2) use ($request) {
                      $q2->where('start_time', '<=', $request->start_time)
                         ->where('end_time', '>=', $request->end_time);
                  });
            })->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.'
            ], 422);
        }

        return response()->json(['available' => true]);
    }

    // Patient: مواعيده
    public function myAppointments(Request $request)
    {
        $appointments = Appointment::with(['treatment', 'doctor'])
            ->where('patient_id', $request->user()->id)
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function ($a) {
                return [
                    'id'          => $a->id,
                    'start_time'  => $a->start_time,
                    'end_time'    => $a->end_time,
                    'status'      => $a->status,
                    'cancellation_reason' => $a->cancellation_reason,
                    'treatment'   => $a->treatment,
                    'doctor'      => [
                        'id'   => $a->doctor->id,
                        'name' => $a->doctor->name,
                    ],
                ];
            });

        return response()->json($appointments);
    }

    // Patient: حجز موعد
    public function store(Request $request)
    {
        $request->validate([
            'doctor_id'    => 'sometimes|exists:users,id',
            'treatment_id' => 'required|exists:treatments,id',
            'start_time'   => 'required|date|after:now',
            'end_time'     => 'required|date|after:start_time',
        ]);

        // Assign default doctor if not provided
        $doctorId = $request->doctor_id ?? User::where('role', 'admin')->orWhere('role', 'doctor')->first()->id;

        // Enhanced conflict check - prevent double-booking same slot
        $conflict = Appointment::where('doctor_id', $doctorId)
            ->where('status', '!=', 'annulé')
            ->where(function ($q) use ($request) {
                $q->whereBetween('start_time', [$request->start_time, $request->end_time])
                  ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                  ->orWhere(function ($q2) use ($request) {
                      $q2->where('start_time', '<=', $request->start_time)
                         ->where('end_time', '>=', $request->end_time);
                  });
            })->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.'
            ], 422);
        }

        // Create appointment with "En attente" status by default
        $appointment = Appointment::create([
            'patient_id'   => $request->user()->id,
            'doctor_id'    => $doctorId,
            'treatment_id' => $request->treatment_id,
            'start_time'   => $request->start_time,
            'end_time'     => $request->end_time,
            'status'       => 'en_attente', // Default status
        ]);

        // Send notification to all admin users
        $admins = User::where('role', 'admin')->get();
        $treatment = Treatment::find($request->treatment_id);
        
        // Debug: Log the admin users we found
        \Log::info('Found admin users for notification:', ['count' => $admins->count()]);
        
        foreach ($admins as $admin) {
            if ($admin instanceof User) {
                \Log::info('Sending notification to admin:', ['admin_id' => $admin->id, 'admin_name' => $admin->name]);
                $admin->notify(new AppointmentBooked($appointment, $request->user(), $treatment));
            } else {
                \Log::warning('Admin is not a User instance:', ['admin' => get_class($admin)]);
            }
        }

        return response()->json(
            $appointment->load(['treatment', 'doctor', 'patient']),
            201
        );
    }

    // Patient: إلغاء موعد فقط قبل 24h
    public function cancel(Request $request, $id)
    {
        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $request->user()->id)
            ->firstOrFail();

        if (in_array($appointment->status, ['annulé', 'terminé'])) {
            return response()->json([
                'message' => 'Ce rendez-vous ne peut pas être annulé.'
            ], 422);
        }

        if (now()->diffInHours($appointment->start_time, false) < 24) {
            return response()->json([
                'message' => 'Annulation impossible moins de 24h avant le rendez-vous.'
            ], 422);
        }

        $appointment->update([
            'status'              => 'annulé',
            'cancellation_reason' => $request->reason ?? 'Annulé par le patient',
        ]);

        return response()->json(['message' => 'Rendez-vous annulé avec succès.']);
    }

    // Admin: كل المواعيد
    public function index(Request $request)
    {
        \Log::info('📅 Appointments index request:', [
            'all_params' => $request->all(),
            'week_start' => $request->get('week_start'),
            'week_end' => $request->get('week_end'),
        ]);

        $query = Appointment::with(['patient', 'doctor', 'treatment'])
            ->orderBy('start_time', 'asc');

        // Filter by week if provided
        if ($request->has('week_start') && $request->has('week_end')) {
            $query->whereBetween('start_time', [
                $request->week_start . ' 00:00:00',
                $request->week_end . ' 23:59:59'
            ]);
        }

        $appointments = $query->get()->map(function ($a) {
            return [
                'id'         => $a->id,
                'start_time' => $a->start_time,
                'end_time'   => $a->end_time,
                'status'     => $a->status,
                'cancellation_reason' => $a->cancellation_reason,
                'treatment'  => $a->treatment,
                'patient'    => [
                    'id'    => $a->patient->id,
                    'name'  => $a->patient->name,
                    'email' => $a->patient->email,
                    'phone' => $a->patient->phone,
                ],
                'doctor'     => [
                    'id'   => $a->doctor->id,
                    'name' => $a->doctor->name,
                ],
            ];
        });

        return response()->json($appointments);
    }

    // Admin: تأكيد موعد
    public function confirm($id)
    {
        $appointment = Appointment::with(['doctor', 'patient', 'treatment'])->findOrFail($id);

        if ($appointment->status === 'annulé') {
            return response()->json(['message' => 'Impossible de confirmer un rendez-vous annulé.'], 422);
        }

        $appointment->update(['status' => 'confirmé']);

        return response()->json([
            'message'     => 'Rendez-vous confirmé.',
            'appointment' => $appointment->load(['patient', 'doctor', 'treatment']),
        ]);
    }

    // Admin: تحديث حالة موعد (مخصص لزر "Terminé")
    public function updateStatus(Request $request, $id)
    {
        \Log::info('updateStatus called:', [
            'appointment_id' => $id,
            'requested_status' => $request->status,
            'request_data' => $request->all()
        ]);

        $request->validate([
            'status' => 'required|in:completed,confirmed,cancelled,pending,absent'
        ]);

        $appointment = Appointment::with(['doctor', 'patient', 'treatment'])->findOrFail($id);
        
        \Log::info('Appointment found:', [
            'id' => $appointment->id,
            'current_status' => $appointment->status,
            'has_treatment' => !is_null($appointment->treatment),
            'treatment_id' => $appointment->treatment?->id,
            'treatment_name' => $appointment->treatment?->name,
            'treatment_price' => $appointment->treatment?->price,
            'patient_id' => $appointment->patient_id
        ]);
        
        // Map frontend status to database status
        $statusMap = [
            'completed' => 'terminé',
            'confirmed' => 'confirmé',
            'cancelled' => 'annulé',
            'pending' => 'en_attente',
            'absent' => 'absent'
        ];
        
        $dbStatus = $statusMap[$request->status] ?? $request->status;
        $appointment->update(['status' => $dbStatus]);

        // Send status notifications
        $this->createStatusNotification($appointment, $dbStatus);

        // Auto-create invoice and payment when appointment is marked as completed
        if ($request->status === 'completed') {
            try {
                // Load treatment relationship if not already loaded
                if (!$appointment->relationLoaded('treatment')) {
                    $appointment->load('treatment');
                }
                
                // Validate that appointment has treatment and patient
                if (!$appointment->treatment) {
                    \Log::error('Cannot complete appointment: No treatment assigned', [
                        'appointment_id' => $appointment->id
                    ]);
                    return response()->json([
                        'message' => 'Cannot complete appointment: No treatment assigned',
                        'appointment_id' => $appointment->id
                    ], 400);
                }
                
                if (!$appointment->patient_id) {
                    \Log::error('Cannot complete appointment: No patient assigned', [
                        'appointment_id' => $appointment->id
                    ]);
                    return response()->json([
                        'message' => 'Cannot complete appointment: No patient assigned',
                        'appointment_id' => $appointment->id
                    ], 400);
                }
                
                if (!$appointment->treatment->price || $appointment->treatment->price <= 0) {
                    \Log::error('Cannot complete appointment: Treatment has no valid price', [
                        'appointment_id' => $appointment->id,
                        'treatment_id' => $appointment->treatment->id,
                        'price' => $appointment->treatment->price
                    ]);
                    return response()->json([
                        'message' => 'Cannot complete appointment: Treatment has no valid price',
                        'appointment_id' => $appointment->id,
                        'treatment_id' => $appointment->treatment->id,
                        'price' => $appointment->treatment->price
                    ], 400);
                }
                
                // Step A: Fetch treatment price (already loaded above)
                $treatmentPrice = $appointment->treatment->price;
                $treatmentName = $appointment->treatment->name;
                
                \Log::info('About to create invoice and payment for appointment:', [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'treatment_id' => $appointment->treatment->id,
                    'treatment_name' => $treatmentName,
                    'price' => $treatmentPrice
                ]);
                
                // Step B: Create Invoice (if not exists)
                $existingInvoice = Invoice::where('appointment_id', $appointment->id)->first();
                if (!$existingInvoice) {
                    $invoice = Invoice::create([
                        'appointment_id' => $appointment->id,
                        'patient_id'     => $appointment->patient_id,
                        'amount'         => $treatmentPrice,
                        'status'         => 'paid', // Auto-mark as paid since treatment is completed
                        'issued_at'      => now(),
                    ]);
                    
                    \Log::info('Invoice created successfully for appointment:', [
                        'appointment_id' => $appointment->id,
                        'invoice_id' => $invoice->id,
                        'amount' => $treatmentPrice
                    ]);
                } else {
                    \Log::info('Invoice already exists for appointment:', [
                        'appointment_id' => $appointment->id,
                        'existing_invoice_id' => $existingInvoice->id
                    ]);
                }
                
                // Step C: Create Payment (if not exists)
                $existingPayment = Payment::where('appointment_id', $appointment->id)->first();
                if (!$existingPayment) {
                    $payment = Payment::create([
                        'appointment_id' => $appointment->id,
                        'patient_id'     => $appointment->patient_id,
                        'amount'         => $treatmentPrice,
                        'status'         => 'paid',
                        'payment_method' => 'cash', // Default payment method
                        'description'    => "Payment for " . ($treatmentName ?? 'Treatment'),
                        'payment_date'   => now(),
                    ]);
                    
                    \Log::info('Payment created successfully for appointment:', [
                        'appointment_id' => $appointment->id,
                        'payment_id' => $payment->id,
                        'amount' => $treatmentPrice
                    ]);
                } else {
                    \Log::info('Payment already exists for appointment:', [
                        'appointment_id' => $appointment->id,
                        'existing_payment_id' => $existingPayment->id
                    ]);
                }
                
                // Update finance stats immediately
                $this->updateFinanceStats($treatmentPrice);
                
                // Send notifications to patient
                $this->createInvoiceNotification($appointment);
                $this->createPaymentNotification($appointment);
                
            } catch (\Exception $e) {
                \Log::error('Error creating invoice/payment:', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return response()->json([
                    'message' => 'Failed to create invoice/payment: ' . $e->getMessage(),
                    'appointment_id' => $appointment->id
                ], 500);
            }
        }

        return response()->json([
            'message'     => 'Appointment status updated successfully.',
            'appointment' => $appointment->load(['patient', 'doctor', 'treatment']),
            'status'      => $dbStatus
        ]);
    }

    // Admin: تعديل موعد (Drag & Drop)
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $data = [];
        
        if ($request->has('status')) {
            $data['status'] = $request->status;
        }
        if ($request->has('cancellation_reason')) {
            $data['cancellation_reason'] = $request->cancellation_reason;
        }
        if ($request->has('start_time')) {
            $data['start_time'] = $request->start_time;
        }
        if ($request->has('end_time')) {
            $data['end_time'] = $request->end_time;
        }
        if ($request->has('doctor_id')) {
            $data['doctor_id'] = $request->doctor_id;
        }

        $appointment->update($data);

        // Send status notifications
        if ($request->has('status') && in_array($request->status, ['confirmé', 'annulé', 'terminé'])) {
            $this->createStatusNotification($appointment, $request->status);
        }

        // Auto-create invoice and payment when appointment is marked as terminé
        if ($request->has('status') && $request->status === 'terminé') {
            $appointment->load(['treatment']);
            
            if ($appointment->treatment && $appointment->patient_id) {
                $price = $appointment->treatment->price; // Get price from treatment
                
                // Create Invoice
                \Log::info('About to create Invoice:', [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'amount' => $price,
                    'status' => 'paid',
                    'issued_at' => now()->format('Y-m-d H:i:s')
                ]);
                
                $invoice = Invoice::create([
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'amount' => $price,
                    'status' => 'paid',
                    'issued_at' => now()
                ]);
                
                \Log::info('Invoice created successfully:', [
                    'invoice_id' => $invoice->id,
                    'appointment_id' => $appointment->id,
                    'amount' => $price
                ]);
                
                // Create Payment
                \Log::info('About to create Payment with exact column names:', [
                    'appointment_id' => $appointment->id,
                    'amount' => $price,
                    'payment_method' => 'cash',
                    'status' => 'paid', // Use 'paid' as default in migration
                    'payment_date' => now()->format('Y-m-d H:i:s')
                ]);
                
                try {
                    $payment = Payment::create([
                        'appointment_id' => $appointment->id,
                        'amount' => $price,
                        'payment_method' => 'cash',
                        'status' => 'paid', // Use 'paid' as default in migration
                        'payment_date' => now(),
                    ]);
                    
                    \Log::info('Payment created successfully:', [
                        'payment_id' => $payment->id,
                        'appointment_id' => $appointment->id,
                        'amount' => $price,
                        'payment_date' => $payment->payment_date->format('Y-m-d H:i:s')
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to create Payment:', [
                        'error' => $e->getMessage(),
                        'appointment_id' => $appointment->id,
                        'amount' => $price
                    ]);
                }
                
                // Send notification to patient about invoice
                $this->createInvoiceNotification($appointment);
            }
        }

        return response()->json(
            $appointment->load(['patient', 'doctor', 'treatment'])
        );
    }

    private function updateFinanceStats($amount): void
    {
        // Log the revenue update for dashboard stats
        // The DashboardController already calculates revenue from invoices
        // so we just need to ensure the invoice is created as 'paid'
        
        \Log::info('💰 Finance stats updated:', [
            'amount' => $amount,
            'date' => now()->format('Y-m-d'),
            'type' => 'completed_appointment'
        ]);
    }

    private function createStatusNotification(Appointment $appointment, string $status): void
    {
        // Load patient relationship if not already loaded
        if (!$appointment->relationLoaded('patient')) {
            $appointment->load('patient');
        }
        
        $date = $appointment->start_time->format('d/m/Y à H:i');
        
        $message = match($status) {
            'en_cours' => "Votre rendez-vous du {$date} est en cours. Le médecin vous reçoit maintenant.",
            'confirmé' => "✅ Votre rendez-vous du {$date} a été confirmé.",
            'annulé' => "❌ Votre rendez-vous du {$date} a été annulé. Veuillez choisir un autre créneau.",
            'terminé' => "🏁 Votre rendez-vous du {$date} est terminé. Facture de " . ($appointment->treatment->price ?? 0) . " MAD générée.",
            default => null,
        };

        if ($message) {
            Notification::create([
                'user_id' => $appointment->patient_id,
                'message' => $message,
                'type' => 'appointment',
            ]);
            
            \Log::info('📢 Status notification created:', [
                'message' => $message, 
                'user_id' => $appointment->patient_id,
                'appointment_id' => $appointment->id
            ]);
        }
    }

    private function createPaymentNotification(Appointment $appointment): void
    {
        // Load patient relationship if not already loaded
        if (!$appointment->relationLoaded('patient')) {
            $appointment->load(['patient', 'treatment']);
        }
        
        $date = $appointment->start_time->format('d/m/Y à H:i');
        $price = $appointment->treatment->price ?? 0;
        $message = "💰 Payment of {$price} MAD processed for your appointment on {$date}.";
        
        if ($appointment->patient) {
            Notification::create([
                'user_id' => $appointment->patient->id,
                'message' => $message,
                'type' => 'payment',
            ]);
            
            \Log::info('💰 Payment notification created:', [
                'message' => $message, 
                'user_id' => $appointment->patient->id,
                'appointment_id' => $appointment->id,
                'amount' => $price
            ]);
        }
    }

    private function createInvoiceNotification(Appointment $appointment): void
    {
        // Load patient relationship if not already loaded
        if (!$appointment->relationLoaded('patient')) {
            $appointment->load(['patient', 'treatment']);
        }
        
        $date = $appointment->start_time->format('d/m/Y à H:i');
        $price = $appointment->treatment->price ?? 0;
        $message = "Votre RDV du {$date} est terminé. Facture: {$price} MAD générée.";
        
        if ($appointment->patient) {
            Notification::create([
                'user_id' => $appointment->patient->id,
                'message' => $message,
                'type' => 'invoice',
            ]);
            
            \Log::info('💰 Invoice notification created:', [
                'message' => $message, 
                'user_id' => $appointment->patient->id,
                'appointment_id' => $appointment->id,
                'amount' => $price
            ]);
        }
    }

    // Admin: حذف موعد
    public function destroy($id)
    {
        $appointment = Appointment::with(['doctor', 'patient', 'treatment'])->findOrFail($id);
        $appointment->delete();

        return response()->json(['message' => 'Rendez-vous supprimé.']);
    }

    // Admin: إحصائيات المواعيد
    public function stats()
    {
        $today = Appointment::whereDate('start_time', today())->count();
        $week  = Appointment::whereBetween('start_time', [
            now()->startOfWeek(), now()->endOfWeek()
        ])->count();
        $pending   = Appointment::where('status', 'en_attente')->count();
        $confirmed = Appointment::where('status', 'confirmé')->count();
        $cancelled = Appointment::where('status', 'annulé')->count();

        return response()->json([
            'today'     => $today,
            'week'      => $week,
            'pending'   => $pending,
            'confirmed' => $confirmed,
            'cancelled' => $cancelled,
        ]);
    }
}
