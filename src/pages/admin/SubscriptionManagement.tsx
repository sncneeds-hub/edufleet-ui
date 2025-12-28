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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PlanManagement } from './PlanManagement';
import { 
  getFilteredUserSubscriptions,
  getAllSubscriptionPlans,
  extendUserSubscription,
  resetBrowseCount,
  suspendUserSubscription,
  reactivateUserSubscription,
  getGlobalSubscriptionStats,
  continueSubscription,
  getAllSubscriptionRequests,
  updateSubscriptionRequest,
  changeUserSubscriptionPlan,
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
  CreditCard,
  DollarSign,
  Search,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Layout,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/apiClient';

export function SubscriptionManagement() {
  const [activeTab, setActiveTab] = useState('users');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'extend' | 'reset' | 'suspend' | 'reactivate' | 'continue' | 'markPaid' | 'changePlan' | 'approveRequest' | 'rejectRequest' | null;
    subscription: any;
    request?: any;
  }>({
    open: false,
    type: null,
    subscription: null,
  });
  
  const [extendMonths, setExtendMonths] = useState(1);
  const [adminNotes, setAdminNotes] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, planFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (planFilter !== 'all') filters.planId = planFilter;
      if (searchTerm) filters.search = searchTerm;
      
      const [subsResponse, plansResponse, statsResponse, requestsResponse] = await Promise.all([
        getFilteredUserSubscriptions(filters),
        getAllSubscriptionPlans(),
        getGlobalSubscriptionStats(),
        getAllSubscriptionRequests({ status: 'pending' }),
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

      if (requestsResponse.success && requestsResponse.data) {
        setRequests(requestsResponse.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.subscription && !actionDialog.request) return;

    try {
      const subId = actionDialog.subscription?.id;
      const userId = actionDialog.subscription?.userId;

      switch (actionDialog.type) {
        case 'approveRequest':
          await updateSubscriptionRequest(actionDialog.request.id, {
            status: 'approved',
            adminNotes: adminNotes || 'Approved by admin',
          });
          toast.success('Subscription request approved');
          break;

        case 'rejectRequest':
          await updateSubscriptionRequest(actionDialog.request.id, {
            status: 'rejected',
            adminNotes: adminNotes || 'Rejected by admin',
          });
          toast.success('Subscription request rejected');
          break;

        case 'changePlan':
          if (!selectedPlanId) {
            toast.error('Please select a plan');
            return;
          }
          if (selectedPlanId === actionDialog.subscription.planId) {
            toast.error('Please select a different plan');
            return;
          }
          await changeUserSubscriptionPlan(
            actionDialog.subscription.id, 
            selectedPlanId,
            `Plan changed by admin to ${plans.find(p => p.id === selectedPlanId)?.displayName}`
          );
          toast.success('Subscription plan updated successfully');
          break;

        case 'extend':
          const currentEndDate = new Date(actionDialog.subscription.endDate);
          const newEndDate = new Date(currentEndDate);
          newEndDate.setMonth(newEndDate.getMonth() + extendMonths);
          await extendUserSubscription({
            userSubscriptionId: actionDialog.subscription.id,
            newEndDate: newEndDate.toISOString(),
            notes: `Extended by ${extendMonths} month(s)`,
          });
          toast.success(`Subscription extended by ${extendMonths} month(s)`);
          break;

        case 'continue':
          const contEndDate = new Date(actionDialog.subscription.endDate);
          const newContEndDate = new Date(contEndDate);
          newContEndDate.setMonth(newContEndDate.getMonth() + extendMonths);
          await extendUserSubscription({
            userSubscriptionId: actionDialog.subscription.id,
            newEndDate: newContEndDate.toISOString(),
            notes: `Continued by ${extendMonths} month(s)`,
          });
          toast.success(`Subscription continued for ${extendMonths} month(s)`);
          break;

        case 'reset':
          await resetBrowseCount({ userSubscriptionId: actionDialog.subscription.id });
          toast.success('Browse count reset successfully');
          break;

        case 'suspend':
          await suspendUserSubscription({
            userSubscriptionId: actionDialog.subscription.id,
            reason: suspendReason || 'Suspended by admin',
          });
          toast.success('Subscription suspended');
          break;

        case 'reactivate':
          await reactivateUserSubscription(actionDialog.subscription.id);
          toast.success('Subscription reactivated');
          break;
          
        case 'markPaid':
          await extendUserSubscription({
            userSubscriptionId: actionDialog.subscription.id,
            newEndDate: actionDialog.subscription.endDate, // Just updating status
            notes: 'Payment verified by admin',
            paymentStatus: 'completed'
          } as any);
          toast.success('Payment marked as completed');
          break;
      }

      setActionDialog({ open: false, type: null, subscription: null, request: null });
      setExtendMonths(1);
      setSuspendReason('');
      setSelectedPlanId('');
      setAdminNotes('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const openActionDialog = (type: any, subscription: any) => {
    setActionDialog({ open: true, type, subscription });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          <p className="text-muted-foreground mt-1">Manage user subscriptions and plans</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold mt-1">{stats.subscriptions?.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.subscriptions?.active || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">{stats.subscriptions?.expiringSoon || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600 opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (Monthly)</p>
                <p className="text-2xl font-bold mt-1">₹{(stats.revenue?.total || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-20" />
            </div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> User Subscriptions
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Layout className="w-4 h-4" /> Manage Plans
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Change Requests
            {requests.length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white border-none">{requests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-[2]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by user name or email..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
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
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                          <TableCell>
                            <div>
                              <p className="font-medium">{sub.userName}</p>
                              <p className="text-xs text-muted-foreground">{sub.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sub.planName}</p>
                              <Badge variant="outline" className="text-[10px] h-4">
                                {sub.userRole}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getPaymentStatusBadge(sub.paymentStatus || 'pending')}
                              {sub.transactionId && (
                                <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
                                  ID: {sub.transactionId}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              <p>Browse: {sub.browseCountUsed}</p>
                              <p>Listing: {sub.listingCountUsed}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{new Date(sub.endDate).toLocaleDateString()}</p>
                              <p className={
                                isExpired ? 'text-red-600 font-medium text-xs' :
                                isExpiringSoon ? 'text-amber-600 font-medium text-xs' :
                                'text-green-600 text-xs'
                              }>
                                {isExpired ? 'Expired' : `${daysRemaining} days left`}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPlanId('');
                                  openActionDialog('changePlan', sub);
                                }}
                                title="Change Plan"
                                className="text-primary"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </Button>
                              {sub.paymentStatus === 'pending' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white animate-pulse"
                                  onClick={() => openActionDialog('markPaid', sub)}
                                  title="Verify Payment"
                                >
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  Pay
                                </Button>
                              )}
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
        </TabsContent>

        <TabsContent value="plans">
          <PlanManagement />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="p-4 bg-white shadow-sm border-amber-100">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{request.userId?.name}</p>
                        <Badge variant="outline" className="text-[10px] h-4 uppercase">
                          {request.userId?.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{request.userId?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={
                          request.requestType === 'upgrade' ? 'bg-green-100 text-green-700' : 
                          request.requestType === 'renewal' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {request.requestType.toUpperCase()}
                        </Badge>
                        <p className="text-sm">
                          <span className="text-muted-foreground">From</span> {request.currentPlanId?.displayName} 
                          <ArrowRight className="inline w-3 h-3 mx-1" />
                          <span className="font-bold">{request.requestedPlanId?.displayName}</span>
                        </p>
                      </div>
                      {request.userNotes && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded italic text-muted-foreground">
                          "{request.userNotes}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => setActionDialog({ open: true, type: 'rejectRequest', subscription: null, request })}
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setActionDialog({ open: true, type: 'approveRequest', subscription: null, request })}
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No pending change requests</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, subscription: null, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'extend' && 'Extend Subscription'}
              {actionDialog.type === 'continue' && 'Continue Subscription'}
              {actionDialog.type === 'reset' && 'Reset Browse Count'}
              {actionDialog.type === 'suspend' && 'Suspend Subscription'}
              {actionDialog.type === 'reactivate' && 'Reactivate Subscription'}
              {actionDialog.type === 'changePlan' && 'Change Subscription Plan'}
              {actionDialog.type === 'markPaid' && 'Verify Payment'}
              {actionDialog.type === 'approveRequest' && 'Approve Change Request'}
              {actionDialog.type === 'rejectRequest' && 'Reject Change Request'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'approveRequest' && `Are you sure you want to approve the ${actionDialog.request?.requestType} request for ${actionDialog.request?.userId?.name}? This will update their plan and set their payment status to pending.`}
              {actionDialog.type === 'rejectRequest' && `Are you sure you want to reject the ${actionDialog.request?.requestType} request for ${actionDialog.request?.userId?.name}?`}
              {actionDialog.type === 'extend' && 'Extend the subscription end date by the specified number of months.'}
              {actionDialog.type === 'continue' && 'Continue the subscription for additional months.'}
              {actionDialog.type === 'reset' && 'Reset the browse count to zero for this user.'}
              {actionDialog.type === 'suspend' && 'Suspend this subscription. The user will lose access until reactivated.'}
              {actionDialog.type === 'reactivate' && 'Reactivate this subscription and restore user access.'}
              {actionDialog.type === 'markPaid' && 'Confirm that the bank transfer for this subscription has been received and verified. This will grant the user full access to their plan features.'}
              {actionDialog.type === 'changePlan' && 'Select a new subscription plan for this user. This will reset the cycle and limits.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {actionDialog.type === 'markPaid' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-800 text-sm">
                <p className="font-bold mb-1">Verify Payment Receipt</p>
                <p>Ensure you have verified the transaction ID or receipt before marking as completed. This action cannot be easily undone.</p>
              </div>
            )}
            
            {(actionDialog.type === 'approveRequest' || actionDialog.type === 'rejectRequest') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (Optional)</label>
                <Input 
                  placeholder="Reason for approval/rejection..." 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            )}
            
            {actionDialog.type === 'changePlan' && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                  <p className="font-medium">{actionDialog.subscription?.planName || 'Not assigned'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select New Plan</label>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a new plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans
                        .filter(p => p.planType === actionDialog.subscription?.userRole || (actionDialog.subscription?.userRole === 'institute' && p.planType === 'institute'))
                        .filter(p => p.id !== actionDialog.subscription?.planId)
                        .map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.displayName} (₹{plan.price})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Only plans matching the user's role ({actionDialog.subscription?.userRole}) are shown.
                  </p>
                </div>
              </div>
            )}
            
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: null, subscription: null, request: null })}
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
