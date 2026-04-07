<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminNotificationController extends Controller
{
    /**
     * Get all admin notifications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $notifications = AdminNotification::orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'message' => $notification->message,
                        'type' => $notification->type,
                        'is_read' => $notification->is_read,
                        'read_at' => $notification->is_read ? $notification->updated_at : null,
                        'created_at' => $notification->created_at,
                        'data' => $notification->data,
                    ];
                });

            $unreadCount = AdminNotification::unread()->count();

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching admin notifications:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ], 200);
        }
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        try {
            $notification = AdminNotification::findOrFail($id);
            $notification->markAsRead();

            return response()->json(['message' => 'Notification marked as read']);
        } catch (\Exception $e) {
            \Log::error('Error marking admin notification as read:', [
                'error' => $e->getMessage(),
                'notification_id' => $id
            ]);
            
            return response()->json(['message' => 'Failed to mark notification as read'], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $updated = AdminNotification::unread()->update(['is_read' => true]);

            return response()->json(['message' => "All notifications marked as read ({$updated} updated)"]);
        } catch (\Exception $e) {
            \Log::error('Error marking all admin notifications as read:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['message' => 'Failed to mark all notifications as read'], 500);
        }
    }

    /**
     * Get unread count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        try {
            $count = AdminNotification::unread()->count();
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            \Log::error('Error fetching admin notification unread count:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['count' => 0], 200);
        }
    }
}
