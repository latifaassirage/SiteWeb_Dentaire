<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\DatabaseMessage;

class AppointmentBooked extends Notification implements ShouldQueue
{
    use Queueable;

    public $appointment;
    public $patient;
    public $treatment;

    public function __construct($appointment, $patient, $treatment)
    {
        $this->appointment = $appointment;
        $this->patient = $patient;
        $this->treatment = $treatment;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        // Extract date and time from start_time
        $startTime = $this->appointment->start_time;
        $date = date('d/m/Y', strtotime($startTime));
        $time = date('H:i', strtotime($startTime));
        
        return [
            'title' => 'Nouveau Rendez-vous',
            'message' => "Nouveau rendez-vous de {$this->patient->name} pour {$this->treatment->name} le {$date} à {$time}",
            'appointment_id' => $this->appointment->id,
            'patient_id' => $this->patient->id,
            'treatment_id' => $this->treatment->id,
            'type' => 'appointment_booked',
            'icon' => '📅',
            'date' => $date,
            'time' => $time,
        ];
    }

    public function toArray($notifiable)
    {
        // Extract date and time from start_time
        $startTime = $this->appointment->start_time;
        $date = date('d/m/Y', strtotime($startTime));
        $time = date('H:i', strtotime($startTime));
        
        return [
            'title' => 'Nouveau Rendez-vous',
            'message' => "Nouveau rendez-vous de {$this->patient->name} pour {$this->treatment->name} le {$date} à {$time}",
            'appointment_id' => $this->appointment->id,
            'patient_id' => $this->patient->id,
            'treatment_id' => $this->treatment->id,
            'type' => 'appointment_booked',
        ];
    }
}
