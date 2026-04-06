<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\TreatmentController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/treatments', [TreatmentController::class, 'index']);

Route::get('/clinic-info', function () {
    return response()->json([
        'name'    => 'DentalFlow',
        'email'   => 'contact@dentalflow.com',
        'phone'   => '+212 6 XX XX XX XX',
        'address' => 'N° 45, Avenue Mohammed V, Guelmim, Maroc',
    ]);
});

Route::get('/services', function () {
    return response()->json(\App\Models\Service::all());
});

Route::get('/notifications', function () {
    return response()->json([]);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Doctors list (for booking)
    Route::get('/doctors', [DoctorController::class, 'index']);

    // Patient routes
    Route::get('/my-appointments',           [AppointmentController::class, 'myAppointments']);
    Route::post('/appointments/check',       [AppointmentController::class, 'checkAvailability']);
    Route::post('/appointments',             [AppointmentController::class, 'store']);
    Route::put('/appointments/{id}/cancel',  [AppointmentController::class, 'cancel']);
    Route::get('/my-invoices',               [InvoiceController::class, 'myInvoices']);
    
    // Notifications
    Route::get('/notifications',             [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read',   [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all',    [NotificationController::class, 'markAllAsRead']);

    // Admin routes
    Route::get('/dashboard',                 [DashboardController::class, 'index']);
    Route::get('/appointments',              [AppointmentController::class, 'index']);
    Route::get('/appointments/stats',         [AppointmentController::class, 'stats']);
    Route::put('/appointments/{id}/confirm', [AppointmentController::class, 'confirm']);
    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::patch('/appointments/{id}',       [AppointmentController::class, 'update']);
    Route::put('/appointments/{id}',         [AppointmentController::class, 'update']);
    Route::delete('/appointments/{id}',      [AppointmentController::class, 'destroy']);

    Route::get('/patients',                  [PatientController::class, 'index']);
    Route::get('/admin/patients/{id}',        [PatientController::class, 'show']);
    Route::get('/patients/{id}',             [PatientController::class, 'show']);
    Route::put('/patients/{id}',             [PatientController::class, 'update']);
    Route::delete('/patients/{id}',          [PatientController::class, 'destroy']);

    Route::get('/invoices',                  [InvoiceController::class, 'index']);
    Route::post('/invoices',                 [InvoiceController::class, 'store']);
    Route::put('/invoices/{id}/pay',         [InvoiceController::class, 'markAsPaid']);
    Route::get('/finance/stats',             [InvoiceController::class, 'stats']);

    // Payment routes
    Route::get('/payments',                  [PaymentController::class, 'index']);
    Route::get('/payments/stats',             [PaymentController::class, 'stats']);

    Route::post('/treatments',               [TreatmentController::class, 'store']);
    Route::put('/treatments/{id}',           [TreatmentController::class, 'update']);
    Route::delete('/treatments/{id}',        [TreatmentController::class, 'destroy']);
});