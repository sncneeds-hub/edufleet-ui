import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/context/NotificationContext';
import { Notification } from '@/types/subscriptionTypes';
import {
  Check,
  Trash2,
  CheckCheck,
  AlertCircle,
  Info,
  Zap,
  Bell,
  Clock,
  ArrowLeft,
  Loader2,
  Filter,
  XCircle,
  Star,
  MessageSquare,
  Shield,
} from 'lucide-react';

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
    loadAllNotifications,
  } = useNotifications();

  const navigate = useNavigate();
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load all notifications on mount
  useEffect(() => {
    loadAllNotifications();
  }, [loadAllNotifications]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...notifications];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        n =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // Status filter
    if (filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Sort
    if (sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, filterType, filterPriority, filterStatus, sortOrder]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approval':
      case 'listing_approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'rejection':
      case 'listing_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'priority':
        return <Star className="w-5 h-5 text-amber-500 fill-amber-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'system':
      case 'system_alert':
        return <Shield className="w-5 h-5 text-gray-700" />;
      case 'new_feature':
        return <Zap className="w-5 h-5 text-purple-600" />;
      case 'subscription_expiring':
      case 'subscription_expired':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'browse_limit_warning':
      case 'listing_limit_reached':
        return <Zap className="w-5 h-5 text-red-600" />;
      case 'system_alert':
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'medium':
        return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      default:
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    }
  };

  const getPriorityBadgeColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    return type
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
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

  const notificationTypes = [
    'approval',
    'rejection',
    'priority',
    'message',
    'system',
    'listing_approved',
    'listing_rejected',
    'subscription_expiring',
    'subscription_expired',
    'browse_limit_warning',
    'listing_limit_reached',
    'system_alert',
    'new_feature',
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterPriority('all');
    setFilterStatus('all');
    setSortOrder('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700 font-bold">
                ×
              </button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {notificationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Action Buttons */}
            {(unreadCount > 0 || notifications.length > 0) && (
              <div className="flex gap-2 pt-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark All as Read
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading && notifications.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 bg-white rounded-lg border">
                <Skeleton className="h-4 w-1/3 mb-3" />
                <Skeleton className="h-3 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h2>
            <p className="text-gray-600 mb-6">
              {notifications.length === 0
                ? 'You have no notifications yet'
                : 'No notifications match your filters'}
            </p>
            {notifications.length > 0 && (
              <Button variant="outline" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 sm:p-5 border rounded-lg cursor-pointer transition-all ${getPriorityColor(
                    notification.priority
                  )} ${notification.isRead ? 'opacity-75' : 'opacity-100 border-l-4'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                            {notification.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 items-center mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityBadgeColor(notification.priority)}`}>
                              {notification.priority.charAt(0).toUpperCase() +
                                notification.priority.slice(1)}{' '}
                              Priority
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Expanded Details */}
                      {expandedId === notification.id && notification.message && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          {notification.actionUrl && (
                            <p className="text-xs text-blue-600 mt-2">Click to view details</p>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={e => handleDelete(e, notification.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2 flex-shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Loading indicator */}
      {loading && notifications.length > 0 && (
        <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Updating...
        </div>
      )}
    </div>
  );
}
