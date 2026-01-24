import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Plus, Building2, ShieldCheck, Eye, Pencil, Trash2, AlertTriangle, Clock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { Supplier, CreateSupplierDto } from '@/api/types';
import {
  getSuppliers,
  getSupplierStats,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleVerification,
  rejectSupplier
} from '@/api/services/supplierService';
import { adminService } from '@/api/services/adminService';
import * as subscriptionService from '@/api/services/subscriptionService';
import { categoryLabels } from '@/constants/categories';

export function SupplierManagement() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: 'pending' | 'all' }>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [supplierStats, setSupplierStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 });
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
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
      // Normalize items to ensure id exists (fallback to _id if id is missing)
      const items = response.data?.items || [];
      const normalizedItems = items.map((item: any) => ({
        ...item,
        id: item.id || item._id
      }));
      setSuppliers(normalizedItems);
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

  const handleAddSupplier = async (data: any) => {
    try {
      setIsLoading(true);
      if (editSupplier) {
        await updateSupplier({ ...data, id: editSupplier.id });
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(data);
        toast.success('Supplier added successfully');
      }
      setShowAddSupplier(false);
      setEditSupplier(null);
      loadSuppliers();
      loadSupplierStats();
    } catch (error) {
      toast.error(editSupplier ? 'Failed to update supplier' : 'Failed to add supplier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      return;
    }
    try {
      setIsLoading(true);
      await deleteSupplier(id);
      toast.success('Supplier deleted successfully');
      loadSuppliers();
      loadSupplierStats();
    } catch (error) {
      toast.error('Failed to delete supplier');
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
          {suppliers?.map(supplier => (
            <div key={supplier.id} className="relative group/card max-w-[240px] mx-auto md:mx-0">
              <SupplierCard supplier={supplier} showStatus />
              <div className="absolute top-2 right-2 flex flex-wrap justify-end gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 w-[calc(100%-16px)]">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 shadow-md hover:bg-blue-50 text-blue-600 bg-white/90 backdrop-blur-sm"
                  onClick={() => setViewSupplier(supplier)}
                  title="Review Details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
                {/* Admin CRUD Actions */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 shadow-md hover:bg-amber-50 text-amber-600 bg-white/90 backdrop-blur-sm"
                  onClick={() => {
                    setEditSupplier(supplier);
                    setShowAddSupplier(true);
                  }}
                  title="Edit Supplier"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 shadow-md hover:bg-red-50 text-red-600 bg-white/90 backdrop-blur-sm"
                  onClick={() => handleDeleteSupplier(supplier.id)}
                  title="Delete Supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                {supplier.status === 'pending' && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 shadow-md hover:bg-green-50 text-green-600 bg-white/90 backdrop-blur-sm"
                      onClick={() => setApprovalDialog({ open: true, supplier, planId: '' })}
                      title="Approve"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => handleRejectSupplier(supplier.id)}
                      className="h-8 w-8 shadow-md hover:bg-red-50 text-red-600 bg-white/90 backdrop-blur-sm"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {supplier.status === 'approved' && (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleToggleVerification(supplier.id)}
                    className={`h-8 w-8 shadow-md bg-white/90 backdrop-blur-sm ${
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

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={(open) => {
        setShowAddSupplier(open);
        if (!open) setEditSupplier(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {editSupplier ? 'Edit Supplier Details' : 'Onboard New Supplier'}
            </DialogTitle>
          </DialogHeader>
          <SupplierForm 
            key={editSupplier?.id || 'new'}
            onSubmit={handleAddSupplier} 
            isLoading={isLoading} 
            initialData={editSupplier || undefined} 
          />
        </DialogContent>
      </Dialog>

      {/* View Supplier Details Dialog */}
      <Dialog open={!!viewSupplier} onOpenChange={() => setViewSupplier(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewSupplier && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {viewSupplier.logo ? (
                    <img
                      src={viewSupplier.logo}
                      alt={viewSupplier.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {viewSupplier.name}
                      {viewSupplier.isVerified && (
                        <ShieldCheck className="w-5 h-5 text-green-500" title="Verified" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {categoryLabels[viewSupplier.category] || viewSupplier.category}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Experience
                    </p>
                    <p className="font-semibold">{viewSupplier.yearsInBusiness || 0} Years</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Clients
                    </p>
                    <p className="font-semibold">{viewSupplier.clientCount || 0}+ Institutions</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">About Company</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewSupplier.description}</p>
                </div>

                {/* Services */}
                {viewSupplier.services && viewSupplier.services.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Services & Solutions</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewSupplier.services.map((service, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {viewSupplier.certifications && viewSupplier.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewSupplier.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="border-primary/30 text-primary">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-xl bg-card/50">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contact Info</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Contact Person</p>
                        <p className="text-sm font-medium">{viewSupplier.contactPerson}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <span className="truncate">{viewSupplier.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Eye className="w-4 h-4 text-primary" />
                        </div>
                        <span>{viewSupplier.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Location</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{viewSupplier.address.street}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        <span>{viewSupplier.address.city}, {viewSupplier.address.state}</span>
                      </div>
                      <div className="text-sm pl-6 text-muted-foreground">
                        {viewSupplier.address.pincode}, {viewSupplier.address.country}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setViewSupplier(null)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setViewSupplier(null);
                    setEditSupplier(viewSupplier);
                    setShowAddSupplier(true);
                  }}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </div>
            </>
          )}
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
