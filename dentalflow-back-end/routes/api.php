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
use App\Http\Controllers\Api\AdminNotificationController;
use App\Http\Controllers\Api\ClinicSettingsController;

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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Doctors list (for booking)
    Route::get('/doctors', [DoctorController::class, 'index']);

    // Clinic settings
    Route::get('/clinic-settings', [ClinicSettingsController::class, 'index']);
    Route::get('/clinic-settings/working-hours', [ClinicSettingsController::class, 'getWorkingHours']);

    // Patient routes
    Route::get('/my-appointments',           [AppointmentController::class, 'myAppointments']);
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots']);
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
    Route::post('/invoices/create-unpaid',  [InvoiceController::class, 'createUnpaidInvoice']);
    Route::post('/appointments/{id}/mark-as-paid', [AppointmentController::class, 'markAsPaid']);
    Route::get('/finance/stats',             [InvoiceController::class, 'stats']);
    Route::get('/finance/monthly',           [InvoiceController::class, 'monthly']);
    Route::get('/finance/daily-revenue', [InvoiceController::class, 'dailyRevenue']);

    // Payment routes
    Route::get('/payments',                  [PaymentController::class, 'index']);
    Route::get('/payments/stats',             [PaymentController::class, 'stats']);

    // Admin notification routes
    Route::get('/admin/notifications',       [AdminNotificationController::class, 'index']);
    Route::put('/admin/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
    Route::put('/admin/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
    Route::get('/admin/notifications/unread-count', [AdminNotificationController::class, 'unreadCount']);

    Route::post('/treatments',               [TreatmentController::class, 'store']);
    Route::put('/treatments/{id}',           [TreatmentController::class, 'update']);
    Route::delete('/treatments/{id}',        [TreatmentController::class, 'destroy']);
});

// Public routes - no auth needed
Route::get('/settings', function () {
    return response()->json([
        'clinic_name'    => App\Models\ClinicSetting::get('clinic_name', 'DentalFlow'),
        'phone'          => App\Models\ClinicSetting::get('phone', '+212 600-000-000'),
        'email'          => App\Models\ClinicSetting::get('email', 'contact@dentalflow.ma'),
        'address'        => App\Models\ClinicSetting::get('address', 'Agadir, Maroc'),
        
        // Working Hours - Detailed Daily Schedules
        'monday_open'    => App\Models\ClinicSetting::get('monday_open', '09:00'),
        'monday_close'   => App\Models\ClinicSetting::get('monday_close', '19:00'),
        'monday_closed'  => App\Models\ClinicSetting::get('monday_closed', '0'),
        
        'tuesday_open'   => App\Models\ClinicSetting::get('tuesday_open', '09:00'),
        'tuesday_close'  => App\Models\ClinicSetting::get('tuesday_close', '19:00'),
        'tuesday_closed' => App\Models\ClinicSetting::get('tuesday_closed', '0'),
        
        'wednesday_open' => App\Models\ClinicSetting::get('wednesday_open', '09:00'),
        'wednesday_close'=> App\Models\ClinicSetting::get('wednesday_close', '19:00'),
        'wednesday_closed'=> App\Models\ClinicSetting::get('wednesday_closed', '0'),
        
        'thursday_open'  => App\Models\ClinicSetting::get('thursday_open', '09:00'),
        'thursday_close' => App\Models\ClinicSetting::get('thursday_close', '19:00'),
        'thursday_closed'=> App\Models\ClinicSetting::get('thursday_closed', '0'),
        
        'friday_open'    => App\Models\ClinicSetting::get('friday_open', '09:00'),
        'friday_close'   => App\Models\ClinicSetting::get('friday_close', '19:00'),
        'friday_closed'  => App\Models\ClinicSetting::get('friday_closed', '0'),
        
        'saturday_open'  => App\Models\ClinicSetting::get('saturday_open', '09:00'),
        'saturday_close' => App\Models\ClinicSetting::get('saturday_close', '13:00'),
        'saturday_closed'=> App\Models\ClinicSetting::get('saturday_closed', '0'),
        
        'sunday_closed'  => App\Models\ClinicSetting::get('sunday_closed', '1'),
        
        // Lunch Break
        'lunch_start'    => App\Models\ClinicSetting::get('lunch_start', '12:00'),
        'lunch_end'      => App\Models\ClinicSetting::get('lunch_end', '14:00'),
    ]);
});

Route::middleware('auth:sanctum')->post('/settings', function (\Illuminate\Http\Request $request) {
    foreach ($request->all() as $key => $value) {
        App\Models\ClinicSetting::set($key, $value);
    }
    return response()->json(['message' => 'Settings saved successfully']);
});

Route::get('/services', function () {
    return response()->json(
        App\Models\Service::where('is_active', 1)->orderBy('sort_order')->get()
    );
});

Route::middleware('auth:sanctum')->post('/services', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'icon_name' => 'required|string|max:50',
        'sort_order' => 'nullable|integer|min:0',
        'is_active' => 'boolean'
    ]);
    
    $service = App\Models\Service::create([
        'name' => $request->name,
        'description' => $request->description,
        'icon_name' => $request->icon_name,
        'sort_order' => $request->sort_order ?? 0,
        'is_active' => $request->is_active ?? true
    ]);
    
    return response()->json($service, 201);
});

Route::middleware('auth:sanctum')->put('/services/{id}', function (\Illuminate\Http\Request $request, $id) {
    $service = App\Models\Service::findOrFail($id);
    
    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'icon_name' => 'required|string|max:50',
        'sort_order' => 'nullable|integer|min:0',
        'is_active' => 'boolean'
    ]);
    
    $service->update($request->all());
    return response()->json($service);
});

Route::middleware('auth:sanctum')->delete('/services/{id}', function ($id) {
    $service = App\Models\Service::findOrFail($id);
    $service->delete();
    return response()->json(['message' => 'Service deleted successfully']);
});

// Treatments CRUD
Route::middleware('auth:sanctum')->get('/treatments', function () {
    return response()->json(
        App\Models\Treatment::orderBy('name')->get()
    );
});