<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'appointment_id', 
        'patient_id', 
        'amount', 
        'status', 
        'payment_method', 
        'description', 
        'payment_date'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    // Scope for today's payments
    public function scopeToday($query)
    {
        return $query->whereDate('payment_date', today());
    }

    // Scope for current month payments
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('payment_date', now()->month)
                    ->whereYear('payment_date', now()->year);
    }

    // Scope for paid payments
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}
