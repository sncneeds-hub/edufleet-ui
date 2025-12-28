import { Alert } from '@/components/ui/alert';
import {
  AlertCircle,
  Clock,
  AlertTriangle,
  Zap,
  Ban,
  CreditCard,
} from 'lucide-react';
import { UserSubscription, SubscriptionUsageStats } from '@/types/subscriptionTypes';

interface SubscriptionAlertProps {
  subscription: UserSubscription | null;
  stats: SubscriptionUsageStats | null;
}

export function SubscriptionAlert({ subscription, stats }: SubscriptionAlertProps) {
  if (!subscription || !stats) return null;

  const alerts = [];

  // Check for pending payment
  if (subscription.paymentStatus === 'pending') {
    alerts.push({
      id: 'pending-payment',
      variant: 'default' as const,
      icon: CreditCard,
      title: 'Payment Verification Pending',
      message: 'Your payment for this subscription is being verified by our team. Some features may be limited until verification is complete.',
      color: 'amber',
    });
  }

  // Check for expired subscription
  if (stats.isExpired) {
    alerts.push({
      id: 'expired',
      variant: 'destructive' as const,
      icon: AlertTriangle,
      title: 'Subscription Expired',
      message: `Your subscription ended on ${new Date(subscription.endDate).toLocaleDateString()}. Contact your administrator to renew.`,
      color: 'red',
    });
  }

  // Check for expiring soon
  if (stats.isExpiringSoon && !stats.isExpired) {
    alerts.push({
      id: 'expiring',
      variant: 'default' as const,
      icon: Clock,
      title: 'Subscription Expiring Soon',
      message: `Your subscription expires in ${stats.daysRemaining} day${stats.daysRemaining !== 1 ? 's' : ''}. Contact your administrator to extend it.`,
      color: 'amber',
    });
  }

  // Check for browse limit reached
  if (stats.browseCount.limitReached) {
    alerts.push({
      id: 'browse-limit',
      variant: 'default' as const,
      icon: Zap,
      title: 'Browse Limit Reached',
      message: 'You have reached your monthly browse limit. Contact your administrator to increase your plan.',
      color: 'red',
    });
  }

  // Check for listing limit reached
  if (stats.listingCount.limitReached) {
    alerts.push({
      id: 'listing-limit',
      variant: 'default' as const,
      icon: Ban,
      title: 'Listing Limit Reached',
      message: 'You have reached your listing limit. Contact your administrator to increase your plan.',
      color: 'red',
    });
  }

  // Check for suspended subscription
  if (subscription.status === 'suspended') {
    alerts.push({
      id: 'suspended',
      variant: 'destructive' as const,
      icon: Ban,
      title: 'Subscription Suspended',
      message: `Your subscription has been suspended. Reason: ${subscription.notes || 'Not specified'}. Contact your administrator.`,
      color: 'red',
    });
  }

  // Render alerts
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        const bgColor = alert.color === 'red' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
        const textColor = alert.color === 'red' ? 'text-red-700' : 'text-amber-700';
        const iconColor = alert.color === 'red' ? 'text-red-600' : 'text-amber-600';

        return (
          <Alert
            key={alert.id}
            variant="default"
            className={`border ${bgColor}`}
          >
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <div className="ml-4">
              <p className={`font-semibold ${textColor}`}>{alert.title}</p>
              <p className={`text-sm mt-1 ${textColor}`}>{alert.message}</p>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}
