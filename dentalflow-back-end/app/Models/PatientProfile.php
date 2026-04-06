<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientProfile extends Model
{
    protected $fillable = [
        'user_id',
        'date_of_birth',
        'address',
        'cin',
        'medical_history',
        'emergency_contact_name',
        'emergency_contact_phone',
        'insurance_company',
        'insurance_number',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        return $this->hasManyThrough(Appointment::class, User::class, 'id', 'patient_id');
    }
}
