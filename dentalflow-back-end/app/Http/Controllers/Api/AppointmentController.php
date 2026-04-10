<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Treatment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Models\AdminNotification;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        $validated = $request->validate([
            'treatment_id' => 'required|exists:treatments,id',
            'doctor_id'    => 'sometimes|exists:users,id',
            'start_time'   => 'required|date|after:now',
            'end_time'     => 'required|date|after:start_time',
        ]);

        try {
            // Get treatment duration
            $treatment = Treatment::find($validated['treatment_id']);
            $duration = $treatment ? $treatment->duration : 30;

            // Get clinic working hours for validation
            $workingHours = \App\Models\ClinicSettings::getWorkingHours();
            $openingTime = $workingHours['opening_time'] ?? '08:00';
            $closingTime = $workingHours['closing_time'] ?? '18:30';
            $lunchStart = $workingHours['lunch_start'] ?? '13:00';
            $lunchEnd = $workingHours['lunch_end'] ?? '14:00';
            
            $appointmentDate = date('Y-m-d', strtotime($validated['start_time']));
            $dayOfWeek = date('N', strtotime($appointmentDate));
            
            // Validate day is available for patients (Mon-Fri only)
            if ($dayOfWeek < 1 || $dayOfWeek > 5) {
                return response()->json(['error' => 'Appointments only available Monday to Friday'], 422);
            }
            
            $appointmentTime = date('H:i', strtotime($validated['start_time']));
            $endTime = date('H:i', strtotime($validated['end_time']));
            
            // Validate appointment is within working hours
            if ($appointmentTime < $openingTime || $endTime > $closingTime) {
                return response()->json(['error' => 'Appointment time is outside clinic working hours'], 422);
            }
            
            // Validate appointment doesn't fall during lunch break
            if ($appointmentTime >= $lunchStart && $appointmentTime < $lunchEnd) {
                return response()->json(['error' => 'Appointment time conflicts with lunch break'], 422);
            }

            // Assign default doctor if not provided
            $doctorId = $validated['doctor_id'] ?? User::where('role', 'admin')->orWhere('role', 'doctor')->first()->id;

            // Check for conflicts
            $conflict = Appointment::where('doctor_id', $doctorId)
                ->where('status', '!=', 'annulé')
                ->where(function ($q) use ($validated) {
                    $q->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                      ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']]);
                })
                ->first();

            if ($conflict) {
                return response()->json(['error' => 'This time slot is already booked'], 422);
            }

            $appointment = Appointment::create([
                'patient_id'   => $request->user()->id,
                'treatment_id' => $validated['treatment_id'],
                'doctor_id'    => $doctorId,
                'start_time'   => $validated['start_time'],
                'end_time'     => $validated['end_time'],
                'status'       => 'en_attente',
            ]);

            // Create admin notification for new appointment
            $treatment = Treatment::find($validated['treatment_id']);
            AdminNotification::createNotification(
                "New appointment booked by {$request->user()->name}",
                'new_appointment',
                [
                    'treatment' => $treatment->name,
                    'time' => $appointment->start_time,
                    'patient' => $request->user()->name
                ]
            );

            // Send notification to patient
            Notification::create([
                'user_id' => $request->user()->id,
                'message' => "Your appointment has been booked successfully",
                'type' => 'appointment_booked',
            ]);

            return response()->json([
                'message' => 'Appointment booked successfully',
                'appointment' => $appointment->load(['patient', 'doctor', 'treatment'])
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error creating appointment:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create appointment'], 500);
        }
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
            'status' => 'required|in:completed,confirmed,cancelled,pending,absent,terminé'
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
            'absent' => 'absent',
            'terminé' => 'terminé'
        ];
        
        $dbStatus = $statusMap[$request->status] ?? $request->status;
        $appointment->update(['status' => $dbStatus]);

        // Send status notifications
        $this->createStatusNotification($appointment, $dbStatus);

        // Auto-create invoice when appointment is marked as terminé (but NOT payment)
        if ($request->status === 'completed' || $request->status === 'terminé') {
            try {
                // Load treatment relationship if not already loaded
                if (!$appointment->relationLoaded('treatment')) {
                    $appointment->load('treatment');
                }
                
                // Step A: Fetch treatment price (already loaded above)
                $treatmentPrice = $appointment->treatment->price;
                $treatmentName = $appointment->treatment->name;
                
                \Log::info('About to create invoice for appointment:', [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'treatment_id' => $appointment->treatment->id,
                    'treatment_name' => $treatmentName,
                    'price' => $treatmentPrice
                ]);
                
                // Step B: Create Invoice (if not exists) - status = 'en_attente_paiement'
                $existingInvoice = Invoice::where('appointment_id', $appointment->id)->first();
                if (!$existingInvoice) {
                    $invoice = Invoice::create([
                        'appointment_id' => $appointment->id,
                        'patient_id'     => $appointment->patient_id,
                        'amount'         => $treatmentPrice,
                        'status'         => 'en_attente_paiement', // Create as en_attente_paiement, admin can mark as paid later
                        'issued_at'      => now(),
                    ]);
                    
                    \Log::info('Invoice created successfully for appointment:', [
                        'invoice_id' => $invoice->id,
                        'appointment_id' => $appointment->id,
                        'amount' => $treatmentPrice,
                        'status' => $invoice->status,
                        'paid_at' => $invoice->paid_at
                    ]);
                } else {
                    \Log::info('Invoice already exists for appointment:', [
                        'appointment_id' => $appointment->id,
                        'existing_invoice_id' => $existingInvoice->id,
                        'existing_status' => $existingInvoice->status,
                        'existing_paid_at' => $existingInvoice->paid_at
                    ]);
                }
                
                // CRITICAL: Ensure we NEVER set status to 'paid' automatically
                if ($existingInvoice && $existingInvoice->status === 'paid') {
                    \Log::error('CRITICAL: Existing invoice already marked as paid!', [
                        'appointment_id' => $appointment->id,
                        'invoice_id' => $existingInvoice->id,
                        'status' => $existingInvoice->status,
                        'paid_at' => $existingInvoice->paid_at
                    ]);
                }
                
                // Note: Payment will be created manually when admin clicks "Payé" button
                // Do NOT create payment automatically
                
            } catch (\Exception $e) {
                \Log::error('Error creating invoice for completed appointment:', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return response()->json([
                    'message' => 'Error creating invoice: ' . $e->getMessage(),
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
    /**
     * Get available time slots based on clinic settings and treatment duration
     */
    public function getAvailableSlots(Request $request)
    {
        try {
            $clinicSettings = \App\Models\ClinicSettings::getWorkingHours();
            $date = $request->date;
            $treatmentId = $request->treatment_id;
            
            // Get treatment duration
            $treatment = Treatment::find($treatmentId);
            $duration = $treatment ? $treatment->duration : 30; // Default 30 mins
            
            // Get clinic working hours
            $openingTime = $clinicSettings['opening_time'] ?? '08:00';
            $closingTime = $clinicSettings['closing_time'] ?? '18:30';
            $lunchStart = $clinicSettings['lunch_start'] ?? '13:00';
            $lunchEnd = $clinicSettings['lunch_end'] ?? '14:00';
            
            // Parse working hours for the day
            $dayOfWeek = date('N', strtotime($date)); // 1=Monday, 7=Sunday
            
            // Check if day is enabled for patients (Mon-Fri only)
            if ($dayOfWeek >= 1 && $dayOfWeek <= 5) { // Monday-Friday
                $daySchedule = $clinicSettings['monday_friday'] ?? ['08:00-13:00', '14:00-18:00'];
                $closingTime = $clinicSettings['closing_time'] ?? '18:00'; // Use weekday closing time
            } elseif ($dayOfWeek == 6) { // Saturday
                $daySchedule = [$clinicSettings['saturday'] ?? '08:00-14:30'];
                $closingTime = $clinicSettings['saturday_closing_time'] ?? '14:00'; // Use Saturday closing time
            } else { // Sunday
                return response()->json(['slots' => [], 'message' => 'Clinic closed on Sundays']);
            }
            
            $availableSlots = [];
            
            foreach ($daySchedule as $schedule) {
                if ($schedule === 'Fermé') continue;
                
                // Parse schedule times
                list($scheduleStart, $scheduleEnd) = explode('-', $schedule);
                $scheduleStartHour = (int)substr($scheduleStart, 0, 2);
                $scheduleEndHour = (int)substr($scheduleEnd, 0, 2);
                
                // Generate slots for this schedule
                $currentSlot = $scheduleStartHour;
                while ($currentSlot < $scheduleEndHour) {
                    $slotEndTime = $currentSlot + ($duration / 60);
                    
                    // Skip lunch break
                    if ($currentSlot >= 13 && $currentSlot < 14) {
                        $currentSlot = 14; // Jump to after lunch
                        continue;
                    }
                    
                    // Ensure slot doesn't exceed closing time
                    if ($slotEndTime <= $scheduleEndHour) {
                        $availableSlots[] = sprintf('%02d:00', $currentSlot);
                    }
                    
                    $currentSlot++; // Next hour slot
                }
            }
            
            return response()->json(['slots' => $availableSlots]);
            
        } catch (\Exception $e) {
            \Log::error('Error getting available slots:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to get available slots'], 500);
        }
    }

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

        // Auto-create invoice when appointment is marked as terminé
        if ($request->has('status') && $request->status === 'terminé') {
            try {
                $appointment->load(['treatment']);
                
                \Log::info('Processing terminé appointment:', [
                    'appointment_id' => $appointment->id,
                    'has_treatment' => !is_null($appointment->treatment),
                    'has_patient_id' => !is_null($appointment->patient_id),
                    'treatment_price' => $appointment->treatment?->price,
                    'doctor_id' => $appointment->doctor_id
                ]);
                
                if ($appointment->treatment && $appointment->patient_id) {
                    $price = $appointment->treatment->price; // Get price from treatment
                    
                    // Create Invoice
                    \Log::info('About to create Invoice:', [
                        'appointment_id' => $appointment->id,
                        'patient_id' => $appointment->patient_id,
                        'user_id' => $appointment->doctor_id, // Use doctor as user_id
                        'amount' => $price,
                        'status' => 'en_attente_paiement',
                        'issued_at' => now()->format('Y-m-d H:i:s')
                    ]);
                    
                    $invoice = Invoice::create([
                        'user_id' => $appointment->doctor_id, // Use doctor as user_id
                        'appointment_id' => $appointment->id,
                        'patient_id' => $appointment->patient_id,
                        'amount' => $price,
                        'status' => 'en_attente_paiement', // CRITICAL: Do NOT set to 'paid' automatically
                        'issued_at' => now()->format('Y-m-d H:i:s')
                    ]);
                    
                    \Log::info('Invoice created successfully:', [
                        'invoice_id' => $invoice->id,
                        'appointment_id' => $appointment->id,
                        'amount' => $price
                    ]);
                    
                    // Send notification to patient about invoice
                    $this->createInvoiceNotification($appointment);
                } else {
                    \Log::error('Missing required data for invoice creation:', [
                        'appointment_id' => $appointment->id,
                        'has_treatment' => !is_null($appointment->treatment),
                        'has_patient_id' => !is_null($appointment->patient_id)
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Error creating invoice for terminé appointment:', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return response()->json([
                    'message' => 'Error creating invoice: ' . $e->getMessage(),
                    'appointment_id' => $appointment->id
                ], 500);
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

    // Admin: Mark appointment as paid
    public function markAsPaid($id)
    {
        try {
            $appointment = Appointment::findOrFail($id);
            
            // Update appointment status to 'payé'
            $appointment->update([
                'status' => 'payé',
                'paid_at' => now(),
            ]);
            
            // Create or update invoice
            $invoice = Invoice::where('appointment_id', $id)->first();
            if ($invoice) {
                // Only update to paid if manually confirmed - this is the correct behavior
                $invoice->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
            } else {
                // Create new invoice if it doesn't exist - start as unpaid
                $invoice = Invoice::create([
                    'patient_id' => $appointment->patient_id,
                    'appointment_id' => $appointment->id,
                    'amount' => $appointment->treatment->price ?? 0,
                    'status' => 'unpaid', // CRITICAL: Start as unpaid
                    'issued_at' => now(),
                    // paid_at stays NULL until manual confirmation
                ]);
            }
            
            // Create payment record only when manually confirming payment
            Payment::create([
                'appointment_id' => $appointment->id,
                'patient_id'     => $appointment->patient_id,
                'amount'         => $appointment->treatment->price ?? 0,
                'status'         => 'paid',
                'payment_method' => 'cash', // Default payment method
                'description'    => 'Payment for appointment #' . $appointment->id,
                'payment_date'   => now(),
            ]);
            
            return response()->json(['message' => 'Appointment marked as paid successfully']);
        } catch (\Exception $e) {
            \Log::error('Error marking appointment as paid:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to mark appointment as paid'], 500);
        }
    }

    public function treatmentsStats()
    {
        $data = Appointment::with('treatment')
            ->select('treatment_id', DB::raw('count(*) as total'))
            ->groupBy('treatment_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn($a) => [
                'name' => $a->treatment->name ?? 'Unknown',
                'value' => $a->total
            ]);
        return response()->json($data);
    }
}
