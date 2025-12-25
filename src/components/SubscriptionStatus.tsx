import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserSubscription, extendUserSubscription, getSubscriptionUsageStats } from '@/api/services/subscriptionService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSubscription();
    }
  }, [user?.id]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const subscriptionResponse = await getUserSubscription(user!.id);
      if (subscriptionResponse.success && subscriptionResponse.data) {
        setSubscription(subscriptionResponse.data);
        
        // Also fetch stats
        const statsResponse = await getSubscriptionUsageStats(user!.id);
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      }
    } catch (err) {
      setError('Failed to load subscription details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSubscription = async () => {
    if (!subscription) return;
    
    try {
      setContinuing(true);
      setError(null);
      const response = await extendUserSubscription(subscription.id, { months: 1 });
      if (response.success) {
        setSubscription(response.data);
        await loadSubscription(); // Reload to get fresh stats
      }
    } catch (err) {
      setError('Failed to continue subscription. Please try again.');
      console.error(err);
    } finally {
      setContinuing(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-muted/50 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Alert variant="default" className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <div className="ml-4">
          <p className="font-semibold text-amber-900">No Active Subscription</p>
          <p className="text-sm text-amber-800 mt-1">
            You don't have an active subscription. Contact an administrator to get started.
          </p>
        </div>
      </Alert>
    );
  }

  const daysRemaining = stats?.daysRemaining ?? 0;
  const isExpiringSoon = stats?.isExpiringSoon ?? false;
  const isExpired = stats?.isExpired ?? false;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </Alert>
      )}

      <Card className={`p-6 border-2 ${
        isExpired
          ? 'border-red-200 bg-red-50'
          : isExpiringSoon
          ? 'border-amber-200 bg-amber-50'
          : 'border-green-200 bg-green-50'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {isExpired ? (
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
            ) : isExpiringSoon ? (
              <Clock className="h-6 w-6 text-amber-600 mt-1" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
            )}
            <div>
              <h3 className={`font-semibold text-lg ${
                isExpired
                  ? 'text-red-900'
                  : isExpiringSoon
                  ? 'text-amber-900'
                  : 'text-green-900'
              }`}>
                {subscription.planName}
              </h3>
              <p className={`text-sm mt-1 ${
                isExpired
                  ? 'text-red-700'
                  : isExpiringSoon
                  ? 'text-amber-700'
                  : 'text-green-700'
              }`}>
                Status: <span className="font-medium capitalize">{subscription.status}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-muted uppercase">Days Remaining</p>
            <p className={`text-2xl font-bold mt-1 ${
              isExpired
                ? 'text-red-600'
                : isExpiringSoon
                ? 'text-amber-600'
                : 'text-green-600'
            }`}>
              {Math.max(0, daysRemaining)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase">Browse Used</p>
            <p className="text-2xl font-bold mt-1">{stats?.browseCount?.used ?? 0} / {stats?.browseCount?.allowed ?? 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase">Listings Used</p>
            <p className="text-2xl font-bold mt-1">{stats?.listingCount?.used ?? 0} / {stats?.listingCount?.allowed ?? 0}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase">Valid Until</p>
            <p className="text-sm font-medium mt-1 break-words">
              {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isExpired && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <div className="ml-4">
              <p className="font-semibold">Subscription Expired</p>
              <p className="text-sm mt-1">
                Your subscription ended on {new Date(subscription.endDate).toLocaleDateString()}. 
                Continue your subscription to restore access.
              </p>
            </div>
          </Alert>
        )}

        {isExpiringSoon && !isExpired && (
          <Alert variant="default" className="mb-4 border-amber-200 bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
            <div className="ml-4">
              <p className="font-semibold text-amber-900">Expiring Soon</p>
              <p className="text-sm mt-1 text-amber-800">
                Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
                Continue now to avoid interruption of service.
              </p>
            </div>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleContinueSubscription}
            disabled={continuing}
            className="gap-2 flex-1"
            size="lg"
          >
            {continuing ? 'Processing...' : (
              <>
                <ArrowRight className="w-4 h-4" />
                Continue Subscription
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={loadSubscription}
            disabled={loading || continuing}
            size="lg"
          >
            Refresh
          </Button>
        </div>
      </Card>
    </div>
  );
}
