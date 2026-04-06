<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = ['user_id', 'patient_id', 'appointment_id', 'amount', 'status', 'paid_at', 'issued_at'];

    public function user() { return $this->belongsTo(User::class, 'user_id'); }
    public function patient() { return $this->belongsTo(User::class, 'patient_id'); }
    public function appointment() { return $this->belongsTo(Appointment::class); }
}
