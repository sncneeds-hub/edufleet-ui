import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getAllUserSubscriptions,
  getAllSubscriptionPlans,
  extendUserSubscription,
  resetBrowseCount,
  suspendUserSubscription,
  reactivateUserSubscription,
  getGlobalSubscriptionStats,
} from '@/api/services/subscriptionService';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Calendar,
  RotateCcw,
  Ban,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'extend' | 'reset' | 'suspend' | 'reactivate' | 'continue' | null;
    subscription: any;
  }>({
    open: false,
    type: null,
    subscription: null,
  });
  
  const [extendMonths, setExtendMonths] = useState(1);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, planFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (planFilter !== 'all') filters.planId = planFilter;
      
      const [subsResponse, plansResponse, statsResponse] = await Promise.all([
        getAllUserSubscriptions(filters),
        getAllSubscriptionPlans(),
        getSubscriptionStats(),
      ]);

      if (subsResponse.success && subsResponse.data) {
        setSubscriptions(subsResponse.data.items);
      }

      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.subscription) return;

    try {
      const subId = actionDialog.subscription.id;

      switch (actionDialog.type) {
        case 'extend':
          const currentEndDate = new Date(actionDialog.subscription.endDate);
          const newEndDate = new Date(currentEndDate);
          newEndDate.setMonth(newEndDate.getMonth() + extendMonths);
          await extendSubscription({
            userSubscriptionId: subId,
            newEndDate: newEndDate.toISOString(),
            notes: `Extended by ${extendMonths} month(s)`,
          });
          toast.success(`Subscription extended by ${extendMonths} month(s)`);
          break;

        case 'continue':
          await continueSubscription(subId, extendMonths);
          toast.success(`Subscription continued for ${extendMonths} month(s)`);
          break;

        case 'reset':
          await resetBrowseCount({ userSubscriptionId: subId });
          toast.success('Browse count reset successfully');
          break;

        case 'suspend':
          await suspendSubscription({
            userSubscriptionId: subId,
            reason: suspendReason || 'Suspended by admin',
          });
          toast.success('Subscription suspended');
          break;

        case 'reactivate':
          await reactivateSubscription(subId);
          toast.success('Subscription reactivated');
          break;
      }

      setActionDialog({ open: false, type: null, subscription: null });
      setExtendMonths(1);
      setSuspendReason('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const openActionDialog = (type: any, subscription: any) => {
    setActionDialog({ open: true, type, subscription });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-100 text-gray-700">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted mt-1">Manage user subscriptions and plans</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">Total Subscriptions</p>
                <p className="text-2xl font-bold mt-1">{stats.totalSubscriptions}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.activeSubscriptions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">Expiring Soon</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">{stats.expiringSoon}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">Revenue (Monthly)</p>
                <p className="text-2xl font-bold mt-1">₹{stats.revenueProjection.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-20" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={loadData}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">User Subscriptions</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Browse Used</TableHead>
                <TableHead>Listings Used</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted py-8">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => {
                  const daysRemaining = getDaysRemaining(sub.endDate);
                  const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 7;
                  const isExpired = daysRemaining < 0;

                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-mono text-sm">{sub.userId.slice(0, 8)}...</TableCell>
                      <TableCell>{sub.planName}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>{sub.browseCountUsed}</TableCell>
                      <TableCell>{sub.listingCountUsed}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={
                          isExpired ? 'text-red-600 font-medium' :
                          isExpiringSoon ? 'text-amber-600 font-medium' :
                          'text-green-600'
                        }>
                          {isExpired ? 'Expired' : `${daysRemaining}d`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openActionDialog('continue', sub)}
                            title="Continue Subscription"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openActionDialog('extend', sub)}
                            title="Extend Subscription"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openActionDialog('reset', sub)}
                            title="Reset Browse Count"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          {sub.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => openActionDialog('suspend', sub)}
                              title="Suspend Subscription"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : sub.status === 'suspended' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => openActionDialog('reactivate', sub)}
                              title="Reactivate Subscription"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, subscription: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'extend' && 'Extend Subscription'}
              {actionDialog.type === 'continue' && 'Continue Subscription'}
              {actionDialog.type === 'reset' && 'Reset Browse Count'}
              {actionDialog.type === 'suspend' && 'Suspend Subscription'}
              {actionDialog.type === 'reactivate' && 'Reactivate Subscription'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'extend' && 'Extend the subscription end date by the specified number of months.'}
              {actionDialog.type === 'continue' && 'Continue the subscription for additional months.'}
              {actionDialog.type === 'reset' && 'Reset the browse count to zero for this user.'}
              {actionDialog.type === 'suspend' && 'Suspend this subscription. The user will lose access until reactivated.'}
              {actionDialog.type === 'reactivate' && 'Reactivate this subscription and restore user access.'}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.subscription && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted font-mono">{actionDialog.subscription.userId}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Plan</p>
                <p className="text-sm text-muted">{actionDialog.subscription.planName}</p>
              </div>

              {(actionDialog.type === 'extend' || actionDialog.type === 'continue') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Number of Months</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={extendMonths}
                    onChange={(e) => setExtendMonths(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}

              {actionDialog.type === 'suspend' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Reason (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Enter suspension reason..."
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: null, subscription: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
