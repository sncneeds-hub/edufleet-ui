import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/context/NotificationContext';
import { toast } from 'sonner';
import {
  Check,
  Trash2,
  CheckCheck,
  AlertCircle,
  Info,
  Zap,
  Bell,
  Clock,
  XCircle,
  Star,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { Notification } from '@/types/subscriptionTypes';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
  } = useNotifications();

  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approval':
      case 'listing_approved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'rejection':
      case 'listing_rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'priority':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'system':
      case 'system_alert':
        return <Shield className="w-4 h-4 text-gray-700" />;
      case 'new_feature':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'subscription_expiring':
      case 'subscription_expired':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'browse_limit_warning':
      case 'listing_limit_reached':
        return <Zap className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    return type
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose?.();
    }

    setExpandedId(expandedId === notification.id ? null : notification.id);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete notification';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="w-full border-t">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </h3>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 border-b border-red-200 bg-red-50 text-red-700 text-sm flex items-start justify-between">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    getPriorityColor(notification.priority)
                  } ${notification.isRead ? 'opacity-60' : 'opacity-100'} hover:shadow-sm`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTypeLabel(notification.type)}
                          </p>
                        </div>

                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-sm mt-2 text-gray-700">
                        {notification.message}
                      </p>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="text-muted-foreground hover:text-red-600 transition p-1 flex-shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t space-y-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                navigate('/notifications');
                onClose?.();
              }}
            >
              View All Notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
