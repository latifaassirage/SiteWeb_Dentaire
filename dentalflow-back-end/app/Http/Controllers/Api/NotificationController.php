<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $notifications = $request->user()->notifications()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    $data = $notification->data;
                    return [
                        'id' => $notification->id,
                        'title' => $data['title'] ?? 'Notification',
                        'message' => $data['message'] ?? $notification->data['message'] ?? 'Nouvelle notification',
                        'type' => $data['type'] ?? 'general',
                        'icon' => $data['icon'] ?? '🔔',
                        'appointment_id' => $data['appointment_id'] ?? null,
                        'patient_id' => $data['patient_id'] ?? null,
                        'treatment_id' => $data['treatment_id'] ?? null,
                        'read_at' => $notification->read_at,
                        'created_at' => $notification->created_at,
                        'is_read' => !is_null($notification->read_at),
                    ];
                });

            $unreadCount = $request->user()->unreadNotifications()->count();

            return response()->json($notifications);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications:', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id ?? null
            ]);
            
            // Return empty response instead of crashing
            return response()->json([], 200);
        }
    }

    public function markAsRead(Request $request, $id): JsonResponse
    {
        try {
            $notification = $request->user()->notifications()
                ->where('id', $id)
                ->first();

            if (!$notification) {
                return response()->json(['message' => 'Notification not found'], 404);
            }

            $notification->markAsRead();

            return response()->json(['message' => 'Notification marked as read']);
        } catch (\Exception $e) {
            Log::error('Error marking notification as read:', [
                'error' => $e->getMessage(),
                'notification_id' => $id,
                'user_id' => $request->user()->id ?? null
            ]);
            
            return response()->json(['message' => 'Failed to mark notification as read'], 500);
        }
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $updated = $request->user()->unreadNotifications()->update(['read_at' => now()]);

            return response()->json(['message' => "All notifications marked as read ({$updated} updated)"]);
        } catch (\Exception $e) {
            Log::error('Error marking all notifications as read:', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id ?? null
            ]);
            
            return response()->json(['message' => 'Failed to mark all notifications as read'], 500);
        }
    }
}
