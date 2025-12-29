import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  createSubscriptionRequest,
  getMySubscriptionRequests
} from '@/api/services/subscriptionService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  CreditCard, 
  Banknote, 
  Info, 
  Star,
  History,
  Send
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { SubscriptionRequest } from '@/types/subscriptionTypes';

interface SubscriptionStatusProps {
  subscriptionData?: any;
  availablePlans?: any[];
  subscriptionStats?: any;
  isLoading?: boolean;
  loading?: boolean; // Alias for compatibility
}

export function SubscriptionStatus({ 
  subscriptionData: propSubscription, 
  availablePlans: propPlans, 
  subscriptionStats: propStats,
  isLoading: propIsLoading,
  loading: propLoading
}: SubscriptionStatusProps = {}) {
  const { user, subscription: authSubscription, ensureSubscription } = useAuth();
  
  // Use props if provided, otherwise use data from AuthContext
  const subscription = propSubscription !== undefined ? propSubscription : authSubscription.data;
  const stats = propStats !== undefined ? propStats : authSubscription.stats;
  const plans = propPlans !== undefined && propPlans.length > 0 ? propPlans : authSubscription.plans;
  const loading = propIsLoading ?? propLoading ?? authSubscription.loading;

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [continuing, setContinuing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [requestDialog, setRequestDialog] = useState<{
    open: boolean;
    plan: any | null;
    notes: string;
  }>({
    open: false,
    plan: null,
    notes: '',
  });

  // Update state when props change
  useEffect(() => {
    if (propSubscription !== undefined) {
      // setSubscription(propSubscription); // No longer needed as we use propSubscription directly
    }
  }, [propSubscription]);

  useEffect(() => {
    if (propStats !== undefined) {
      // setStats(propStats); // No longer needed as we use propStats directly
    }
  }, [propStats]);

  useEffect(() => {
    if (propPlans !== undefined && propPlans.length > 0) {
      // setPlans(propPlans); // No longer needed as we use propPlans directly
    }
  }, [propPlans]);

  useEffect(() => {
    if (propIsLoading !== undefined || propLoading !== undefined) {
      // setLoading(propIsLoading ?? propLoading ?? false); // No longer needed as we use propIsLoading/propLoading directly
    }
  }, [propIsLoading, propLoading]);

  useEffect(() => {
    if (user?.id) {
      ensureSubscription();
      loadRequests();
    }
  }, [user?.id, ensureSubscription]);

  const loadRequests = async () => {
    try {
      const requestsResponse = await getMySubscriptionRequests();
      if (requestsResponse.success && requestsResponse.data) {
        setRequests(requestsResponse.data);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  };

  const handleContinueSubscription = async () => {
    if (!subscription) return;
    
    try {
      setContinuing(true);
      setError(null);
      
      const currentPlanId = subscription?.subscriptionPlanId;
      
      if (!currentPlanId) {
        toast.error('Unable to determine current plan. Please refresh and try again.');
        return;
      }
      
      const response = await createSubscriptionRequest({
        requestedPlanId: currentPlanId,
        requestType: 'renewal',
        userNotes: 'Requesting subscription renewal'
      });

      if (response.success) {
        toast.success('Renewal request submitted successfully! Our team will verify and approve your renewal shortly.');
        await loadRequests();
      }
    } catch (err: any) {
      toast.error(err.error || 'Failed to submit renewal request');
      console.error(err);
    } finally {
      setContinuing(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!requestDialog.plan || !user) return;

    try {
      setRequesting(true);
      
      // Determine request type
      const currentPlanId = subscription?.subscriptionPlanId;
      const currentPlanObj = plans.find((p: any) => String(p.id) === String(currentPlanId));
      
      let requestType: 'upgrade' | 'downgrade' | 'renewal' = 'upgrade';
      if (currentPlanObj) {
        if (requestDialog.plan.price < currentPlanObj.price) {
          requestType = 'downgrade';
        } else if (String(requestDialog.plan.id) === String(currentPlanId)) {
          requestType = 'renewal';
        }
      }

      const response = await createSubscriptionRequest({
        requestedPlanId: requestDialog.plan.id,
        requestType,
        userNotes: requestDialog.notes
      });

      if (response.success) {
        toast.success(response.message);
        setRequestDialog({ open: false, plan: null, notes: '' });
        await loadRequests();
      }
    } catch (err: any) {
      toast.error(err.error || 'Failed to submit request');
    } finally {
      setRequesting(false);
    }
  };

  // Loading state while checking auth (shouldn't normally show due to ProtectedRoute)
  if (loading && !subscription) {
    return (
      <Card className="p-6 bg-muted/50 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </Card>
    );
  }

  // Helper to check if plan is current
  const isCurrentPlan = (planId: string) => {
    const currentPlanId = subscription?.subscriptionPlanId;
    return currentPlanId && String(currentPlanId) === String(planId);
  };

  const hasPendingRequest = (planId: string) => {
    return requests.some(r => String(r.requestedPlanId) === String(planId) && r.status === 'pending');
  };

  const daysRemaining = stats?.daysRemaining ?? 0;
  const isExpiringSoon = stats?.isExpiringSoon ?? false;
  const isExpired = stats?.isExpired ?? false;

  // Filter plans based on user role to show only relevant plans
  const filteredPlans = plans.filter((plan: any) => {
    if (!user) return true;
    
    // Map user roles to plan types
    const roleToPlanType: Record<string, string> = {
      'institute': 'institute',
      'teacher': 'teacher',
      'supplier': 'vendor',
      'vendor': 'vendor'
    };
    
    const userPlanType = roleToPlanType[user.role] || 'institute';
    return plan.planType === userPlanType;
  });

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </Alert>
      )}

      {/* Active Subscription Card */}
      {!subscription ? (
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <div className="ml-4">
            <p className="font-semibold text-blue-900">No Active Subscription</p>
            <p className="text-sm text-blue-800 mt-1">
              You don't have an active subscription yet. Choose a plan below and submit a request to get started. 
              Our admin team will review and activate your subscription within 24 hours.
            </p>
          </div>
        </Alert>
      ) : (
        <Card className={`p-6 border-2 ${
          isExpired
            ? 'border-red-200 bg-red-50'
            : subscription.paymentStatus === 'pending'
            ? 'border-amber-200 bg-amber-50'
            : isExpiringSoon
            ? 'border-amber-200 bg-amber-50'
            : 'border-green-200 bg-green-50'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              {isExpired ? (
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              ) : subscription.paymentStatus === 'pending' ? (
                <CreditCard className="h-6 w-6 text-amber-600 mt-1" />
              ) : isExpiringSoon ? (
                <Clock className="h-6 w-6 text-amber-600 mt-1" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              )}
              <div>
                <h3 className={`font-semibold text-lg ${
                  isExpired
                    ? 'text-red-900'
                    : subscription.paymentStatus === 'pending'
                    ? 'text-amber-900'
                    : isExpiringSoon
                    ? 'text-amber-900'
                    : 'text-green-900'
                }`}>
                  {subscription.planName}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <p className={`text-sm ${
                    isExpired
                      ? 'text-red-700'
                      : subscription.paymentStatus === 'pending'
                      ? 'text-amber-700'
                      : 'text-green-700'
                  }`}>
                    Status: <span className="font-medium capitalize">{subscription.status}</span>
                  </p>
                  <Badge variant="outline" className={
                    subscription.paymentStatus === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                    subscription.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse' :
                    'bg-red-100 text-red-700 border-red-200'
                  }>
                    Payment: {subscription.paymentStatus?.toUpperCase() || 'PENDING'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {subscription.paymentStatus === 'pending' && (
            <Alert className="mb-4 border-amber-200 bg-amber-100/50">
              <Banknote className="h-4 w-4 text-amber-600" />
              <div className="ml-4">
                <p className="font-semibold text-amber-900">Payment Verification Pending</p>
                <p className="text-sm mt-1 text-amber-800">
                  Your payment for this subscription is being verified. Please contact support if you have already completed the transfer.
                </p>
              </div>
            </Alert>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Days Remaining</p>
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
              <p className="text-xs font-medium text-muted-foreground uppercase">Browse Used</p>
              <p className="text-2xl font-bold mt-1">{stats?.browseCount?.used ?? 0} / {stats?.browseCount?.allowed ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Listings Used</p>
              <p className="text-2xl font-bold mt-1">{stats?.listingCount?.used ?? 0} / {stats?.listingCount?.allowed ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Valid Until</p>
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
                  Request Renewal
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={loadRequests} // Changed from loadSubscription to loadRequests
              disabled={loading || continuing}
              size="lg"
            >
              Refresh
            </Button>
          </div>
        </Card>
      )}

      {/* Pending Requests */}
      {requests.length > 0 && requests.some(r => r.status === 'pending') && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h4 className="font-semibold text-amber-900">Pending Requests</h4>
          </div>
          <div className="space-y-2">
            {requests.filter(r => r.status === 'pending').map(request => (
              <div key={request.id} className="text-sm flex justify-between items-center bg-white/50 p-2 rounded border border-amber-100">
                <div>
                  <span className="font-medium capitalize">{request.requestType}</span> to <span className="font-bold">{request.requestedPlan?.displayName}</span>
                  <p className="text-xs text-muted-foreground">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-700">Pending Admin Approval</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Plans Section */}
      {filteredPlans.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Plan Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const current = isCurrentPlan(plan.id);
              const pending = hasPendingRequest(plan.id);
              
              const currentPlanObj = plans.find(p => isCurrentPlan(p.id));
              const isUpgrade = currentPlanObj ? plan.price > currentPlanObj.price : true;
              
              return (
                <Card key={plan.id} className={`p-6 flex flex-col ${current ? 'border-primary ring-1 ring-primary' : ''}`}>
                  <div className="mb-4">
                    <h4 className="font-bold text-lg">{plan.displayName}</h4>
                    <p className="text-2xl font-bold mt-2">
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/{plan.duration} days</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{plan.features.maxListings === 0 ? 'No listings' : `${plan.features.maxListings} Listings`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{plan.features.maxBrowsesPerMonth} Browse Views</span>
                    </div>
                    {plan.features.priorityListings && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>Priority Listings</span>
                      </div>
                    )}
                  </div>

                  {current ? (
                    <Button disabled className="w-full" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : pending ? (
                    <Button disabled className="w-full bg-amber-50 text-amber-600 border-amber-200" variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Request Pending
                    </Button>
                  ) : (
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => {
                        setRequestDialog({ open: true, plan, notes: '' });
                      }}
                      variant={isUpgrade ? "default" : "outline"}
                    >
                      <Send className="w-4 h-4" />
                      {!subscription 
                        ? 'Request Plan' 
                        : isUpgrade 
                        ? 'Request Upgrade' 
                        : 'Request Downgrade'}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Subscription Request History */}
      {requests.length > 0 && requests.some(r => r.status !== 'pending') && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Request History
          </h3>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground border-b">
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Requested Plan</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.filter(r => r.status !== 'pending').slice(0, 5).map(request => (
                    <tr key={request.id}>
                      <td className="p-3 capitalize">{request.requestType}</td>
                      <td className="p-3 font-medium">{request.requestedPlan?.displayName}</td>
                      <td className="p-3 text-muted-foreground">{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={
                          request.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate" title={request.adminNotes}>
                        {request.adminNotes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Request Dialog */}
      <Dialog open={requestDialog.open} onOpenChange={(open) => setRequestDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Subscription Change</DialogTitle>
            <DialogDescription>
              Submit a request to {requestDialog.plan?.price > (plans.find(p => isCurrentPlan(p.id))?.price || 0) ? 'upgrade' : 'downgrade'} your plan to <strong>{requestDialog.plan?.displayName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes (Optional)</label>
              <Textarea 
                placeholder="Explain why you'd like to change your plan..." 
                value={requestDialog.notes}
                onChange={(e) => setRequestDialog(prev => ({ ...prev, notes: e.target.value }))}
                className="h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialog({ open: false, plan: null, notes: '' })}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} disabled={requesting} className="gap-2">
              {requesting ? 'Submitting...' : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card id="payment-instructions" className="p-6 border-blue-200 bg-blue-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Banknote className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Payment Instructions</h3>
            <p className="text-sm text-blue-700">How to pay for your subscription</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/50 rounded-lg border border-blue-100 space-y-2">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Bank Transfer Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase">Account Name</p>
                <p className="font-medium">EduFleet Exchange Pvt Ltd</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase">Bank Name</p>
                <p className="font-medium">HDFC Bank</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase">Account Number</p>
                <p className="font-mono font-bold text-lg tracking-wider">50200012345678</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase">IFSC Code</p>
                <p className="font-mono font-bold text-lg tracking-wider">HDFC0001234</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg border border-blue-100">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm space-y-2">
              <p className="font-medium text-blue-900">Important Note:</p>
              <ul className="list-disc ml-4 space-y-1 text-blue-800">
                <li>Make the payment to the above account.</li>
                <li>Take a screenshot of the transaction.</li>
                <li>Send the screenshot along with your <strong>User ID</strong> to <span className="font-bold underline">payments@edufleet.com</span> or WhatsApp at <span className="font-bold underline">+91 9876543210</span>.</li>
                <li>Admin will verify and update your subscription within 24 hours.</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
