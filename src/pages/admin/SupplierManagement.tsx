import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Plus, Building2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { SupplierCard } from '@/components/SupplierCard';
import { SupplierForm } from '@/components/SupplierForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Supplier, CreateSupplierDto } from '@/api/types';
import {
  getSuppliers,
  getSupplierStats,
  createSupplier,
  toggleVerification,
  rejectSupplier
} from '@/api/services/supplierService';
import { adminService } from '@/api/services/adminService';
import * as subscriptionService from '@/api/services/subscriptionService';

export function SupplierManagement() {
  const { type } = useParams<{ type: 'pending' | 'all' }>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [supplierStats, setSupplierStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 });
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    supplier: Supplier | null;
    planId: string;
  }>({
    open: false,
    supplier: null,
    planId: '',
  });

  const isPendingView = type === 'pending';

  useEffect(() => {
    loadSuppliers();
    loadSupplierStats();
    loadPlans();
  }, [type]);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const filters = isPendingView ? { status: 'pending' as const } : undefined;
      const response = await getSuppliers({ ...filters, pageSize: 100 });
      setSuppliers(response.data?.items || []);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupplierStats = async () => {
    try {
      const response = await getSupplierStats();
      setSupplierStats(response.data || { total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 });
    } catch (error) {
      console.error('Failed to load supplier stats');
    }
  };

  const loadPlans = async () => {
    try {
      const response = await subscriptionService.getAllSubscriptionPlans();
      if (response.success && Array.isArray(response.data)) {
        setPlans(response.data.filter((p: any) => p.planType === 'vendor' || p.planType === 'institute'));
      }
    } catch (error) {
      console.error('Failed to load plans');
    }
  };

  const handleAddSupplier = async (data: CreateSupplierDto) => {
    try {
      setIsLoading(true);
      await createSupplier(data);
      toast.success('Supplier added successfully');
      setShowAddSupplier(false);
      loadSuppliers();
      loadSupplierStats();
    } catch (error) {
      toast.error('Failed to add supplier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSupplier = async () => {
    if (!approvalDialog.supplier) return;
    try {
      setIsLoading(true);
      await adminService.approveSupplierStatus(approvalDialog.supplier.id, {
        status: 'approved',
        planId: approvalDialog.planId || undefined,
      });
      toast.success('Supplier approved');
      setApprovalDialog({ open: false, supplier: null, planId: '' });
      loadSuppliers();
      loadSupplierStats();
    } catch (error) {
      toast.error('Failed to approve supplier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectSupplier = async (id: string) => {
    try {
      await adminService.approveSupplierStatus(id, { status: 'rejected' });
      toast.error('Supplier rejected');
      loadSuppliers();
      loadSupplierStats();
    } catch (error) {
      toast.error('Failed to reject supplier');
    }
  };

  const handleToggleVerification = async (id: string) => {
    try {
      await toggleVerification(id);
      toast.success('Verification status updated');
      loadSuppliers();
      loadSupplierStats();
    } catch (error) {
      toast.error('Failed to update verification');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isPendingView ? 'Pending Supplier Approvals' : 'All Suppliers'}
          </h1>
          <p className="text-muted-foreground">
            {isPendingView 
              ? 'Review and approve new supplier registrations' 
              : 'Manage all suppliers and verification status'}
          </p>
        </div>
        <Button onClick={() => setShowAddSupplier(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Suppliers</p>
          <div className="text-3xl font-bold text-primary">{supplierStats.total}</div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending</p>
          <div className="text-3xl font-bold text-accent">{supplierStats.pending}</div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Approved</p>
          <div className="text-3xl font-bold text-secondary">{supplierStats.approved}</div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Verified</p>
          <div className="text-3xl font-bold text-green-600">{supplierStats.verified}</div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Rejected</p>
          <div className="text-3xl font-bold text-red-600">{supplierStats.rejected}</div>
        </Card>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading suppliers...</p>
        </Card>
      ) : !suppliers?.length ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No {isPendingView ? 'pending' : ''} suppliers found</p>
          <p className="text-xs text-muted-foreground mb-4">
            {isPendingView 
              ? 'Pending suppliers will appear here' 
              : 'Add suppliers to help institutes find service providers'}
          </p>
          {!isPendingView && (
            <Button onClick={() => setShowAddSupplier(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Supplier
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers?.map(supplier => (
            <div key={supplier.id} className="relative">
              <SupplierCard supplier={supplier} showStatus />
              <div className="absolute top-3 right-3 flex gap-2">
                {supplier.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setApprovalDialog({ open: true, supplier, planId: '' })}
                      className="bg-white shadow-sm hover:bg-green-50 text-green-600"
                      title="Approve"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRejectSupplier(supplier.id)}
                      className="bg-white shadow-sm hover:bg-red-50 text-red-600"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {supplier.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleVerification(supplier.id)}
                    className={`bg-white shadow-sm ${
                      supplier.isVerified
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={supplier.isVerified ? 'Remove Verification' : 'Mark as Verified'}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Onboard New Supplier
            </DialogTitle>
          </DialogHeader>
          <SupplierForm onSubmit={handleAddSupplier} isLoading={isLoading} />
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog.open} onOpenChange={(open) => !open && setApprovalDialog({ open: false, supplier: null, planId: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Supplier Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              You are approving the supplier profile for <strong>{approvalDialog.supplier?.name}</strong>.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Subscription Plan (Optional)</label>
              <Select value={approvalDialog.planId} onValueChange={(val) => setApprovalDialog(prev => ({ ...prev, planId: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No plan change (keep current)</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={String(plan.id)}>
                      {plan.displayName} (₹{plan.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Upgrading the plan will give the supplier more features and visibility.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setApprovalDialog({ open: false, supplier: null, planId: '' })}>
              Cancel
            </Button>
            <Button onClick={handleApproveSupplier} disabled={isLoading}>
              {isLoading ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
