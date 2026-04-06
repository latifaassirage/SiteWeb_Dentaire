<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $notifications = Notification::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'message' => $notification->message,
                        'type' => $notification->type,
                        'read_at' => $notification->read_at,
                        'created_at' => $notification->created_at,
                        'is_read' => !is_null($notification->read_at),
                    ];
                });

            $unreadCount = Notification::where('user_id', $request->user()->id)
                ->whereNull('read_at')
                ->count();

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications:', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id ?? null
            ]);
            
            // Return empty response instead of crashing
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ], 200);
        }
    }

    public function markAsRead(Request $request, $id): JsonResponse
    {
        try {
            $notification = Notification::where('id', $id)
                ->where('user_id', $request->user()->id)
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
            $updated = Notification::where('user_id', $request->user()->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

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
