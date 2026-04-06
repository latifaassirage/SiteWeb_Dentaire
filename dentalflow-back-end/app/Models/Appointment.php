<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $patient_id
 * @property int $doctor_id
 * @property int|null $treatment_id
 * @property string|\Carbon\Carbon $start_time
 * @property string|\Carbon\Carbon $end_time
 * @property string $status
 * @property string|null $cancellation_reason
 * @property string $formatted_start_time
 * @property string $formatted_end_time
 * @property string $formatted_date
 * @property int $duration
 * @property string $status_label
 * @property string $status_color
 * @property-read \App\Models\User $patient
 * @property-read \App\Models\User $doctor
 * @property-read \App\Models\Treatment $treatment
 */
class Appointment extends Model
{
    protected $fillable = [
        'user_id',
        'patient_id', 
        'doctor_id', 
        'treatment_id',
        'start_time', 
        'end_time', 
        'status', 
        'cancellation_reason'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    // Accessors for safe ID access
    public function getPatientIdAttribute()
    {
        return $this->attributes['patient_id'] ?? null;
    }

    public function getDoctorIdAttribute()
    {
        return $this->attributes['doctor_id'] ?? null;
    }

    public function getTreatmentIdAttribute()
    {
        return $this->attributes['treatment_id'] ?? null;
    }

    // Relationships
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function treatment()
    {
        return $this->belongsTo(Treatment::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    // Helper methods
    public function isUpcoming()
    {
        return $this->start_time > now();
    }

    public function isPast()
    {
        return $this->start_time <= now();
    }

    public function canBeCancelled()
    {
        return $this->isUpcoming() && 
               now()->diffInHours($this->start_time, false) >= 24 &&
               in_array($this->status, ['en_attente', 'confirmé']);
    }

    public function getDurationAttribute()
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    public function getFormattedDateAttribute()
    {
        return $this->start_time->format('Y-m-d');
    }

    public function getFormattedStartTimeAttribute()
    {
        return $this->start_time->format('H:i');
    }

    public function getFormattedEndTimeAttribute()
    {
        return $this->end_time->format('H:i');
    }

    public function getStatusLabelAttribute()
    {
        $labels = [
            'en_attente' => 'Pending',
            'confirmé' => 'Confirmed',
            'annulé' => 'Cancelled',
            'terminé' => 'Completed',
            'absent' => 'Absent',
        ];

        return $labels[$this->status] ?? 'Unknown';
    }

    public function getStatusColorAttribute()
    {
        $colors = [
            'en_attente' => '#fb923c',
            'confirmé' => '#22c55e',
            'annulé' => '#ef4444',
            'terminé' => '#9ca3af',
            'absent' => '#a855f7',
        ];

        return $colors[$this->status] ?? '#6b7280';
    }
}
