import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockVehicles, Vehicle } from '@/mock/vehicleData';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, XCircle, Star, Building2, Plus, ShieldCheck, Settings, Megaphone } from 'lucide-react';
import { useAds } from '@/context/AdContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DashboardSuggestion } from '@/components/DashboardSuggestion';
import { SupplierForm } from '@/components/SupplierForm';
import { SupplierCard } from '@/components/SupplierCard';
import { categoryLabels } from '@/mock/supplierData';
import type { Supplier, CreateSupplierDto } from '@/api/types';
import {
  getSuppliers,
  getSupplierStats,
  createSupplier,
  approveSupplier,
  rejectSupplier,
  toggleVerification
} from '@/api/services/supplierService';
import { AdminSettings } from '@/components/AdminSettings';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vehicles-pending');
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [priorities, setPriorities] = useState<Set<string>>(new Set(mockVehicles.filter(v => v.isPriority).map(v => v.id)));
  
  // Supplier state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierStats, setSupplierStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 });
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  
  // Ads state
  const { ads } = useAds();
  const adStats = {
    total: ads.length,
    active: ads.filter(a => a.status === 'active').length,
    pending: ads.filter(a => a.status === 'pending').length,
    paused: ads.filter(a => a.status === 'paused').length,
    draft: ads.filter(a => a.status === 'draft').length
  };

  useEffect(() => {
    if (activeTab === 'suppliers-all' || activeTab === 'suppliers-pending') {
      loadSuppliers();
      loadSupplierStats();
    }
  }, [activeTab]);

  const loadSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true);
      const filters = activeTab === 'suppliers-pending' ? { status: 'pending' as const } : undefined;
      const response = await getSuppliers(filters);
      setSuppliers(response.data.items);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const loadSupplierStats = async () => {
    try {
      const response = await getSupplierStats();
      setSupplierStats(response.data);
    } catch (error) {
      console.error('Failed to load supplier stats');
    }
  };

  const handleAddSupplier = async (data: CreateSupplierDto) => {
    try {
      setIsLoadingSuppliers(true);
      await createSupplier(data);
      toast.success('Supplier added successfully');
      setShowAddSupplier(false);
      loadSuppliers();
      loadSupplierStats();
    } catch (error) {
      toast.error('Failed to add supplier');
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const handleApproveSupplier = async (id: string) => {
    try {
      await approveSupplier(id);
      toast.success('Supplier approved');
      loadSuppliers();
      loadSupplierStats();
    } catch (error) {
      toast.error('Failed to approve supplier');
    }
  };

  const handleRejectSupplier = async (id: string) => {
    try {
      await rejectSupplier(id);
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted mb-6">Only admins can access this page</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  const pendingListings = vehicles.filter(v => v.status === 'pending');
  const allListings = vehicles;
  const pendingSuppliers = suppliers.filter(s => s.status === 'pending');

  const getSuggestedAction = () => {
    if (pendingSuppliers.length > 0) {
      return {
        title: "Review Pending Suppliers",
        description: `There are ${pendingSuppliers.length} new supplier(s) waiting for your approval.`,
        action: "Review Suppliers",
        onClick: () => setActiveTab('suppliers-pending'),
        variant: 'default' as const
      };
    }
    if (pendingListings.length > 0) {
      return {
        title: "Review Pending Vehicle Listings",
        description: `There are ${pendingListings.length} new listings waiting for your approval.`,
        action: "Review Now",
        onClick: () => setActiveTab('vehicles-pending'),
        variant: 'default' as const
      };
    }
    // Only show suggestion on dashboard main views, not settings
    if (activeTab === 'settings') {
      return null;
    }
    return {
      title: "Manage Priority Listings",
      description: "Review current active listings and update priority status to feature the best vehicles.",
      action: "View All Listings",
      onClick: () => setActiveTab('vehicles-all'),
      variant: 'outline' as const
    };
  };

  const suggestion = getSuggestedAction();

  const handleApprove = (id: string) => {
    setVehicles(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'approved' as const } : v
    ));
    toast.success('Listing approved successfully');
  };

  const handleReject = (id: string) => {
    setVehicles(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'rejected' as const } : v
    ));
    toast.error('Listing rejected');
  };

  const togglePriority = (id: string) => {
    const newPriorities = new Set(priorities);
    if (newPriorities.has(id)) {
      newPriorities.delete(id);
    } else {
      newPriorities.add(id);
    }
    setPriorities(newPriorities);
  };

  const handleApproveAll = () => {
    const pendingIds = pendingListings.map(v => v.id);
    if (pendingIds.length === 0) {
      toast.info('No pending listings to approve');
      return;
    }
    setVehicles(prev => prev.map(v => 
      pendingIds.includes(v.id) ? { ...v, status: 'approved' as const } : v
    ));
    toast.success(`Approved ${pendingIds.length} pending listing(s)`);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted">Manage listings, approvals, and featured items</p>
        </div>

        {/* Suggested Action */}
        {suggestion && <DashboardSuggestion {...suggestion} />}

        {/* Stats */}
        {activeTab.startsWith('vehicles') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Total Listings</p>
              <div className="text-3xl font-bold text-primary">{allListings.length}</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Pending Approval</p>
              <div className="text-3xl font-bold text-accent">{pendingListings.length}</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Approved</p>
              <div className="text-3xl font-bold text-secondary">{allListings.filter(v => v.status === 'approved').length}</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Priority Listings</p>
              <div className="text-3xl font-bold">{priorities.size}</div>
            </Card>
          </div>
        )}
        
        {activeTab.startsWith('suppliers') && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Total Suppliers</p>
              <div className="text-3xl font-bold text-primary">{supplierStats.total}</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Pending</p>
              <div className="text-3xl font-bold text-accent">{supplierStats.pending}</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Approved</p>
              <div className="text-3xl font-bold text-secondary">{supplierStats.approved}</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Verified</p>
              <div className="text-3xl font-bold text-green-600">{supplierStats.verified}</div>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted mb-2">Rejected</p>
              <div className="text-3xl font-bold text-red-600">{supplierStats.rejected}</div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-border flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('vehicles-pending')}
              className={`px-4 py-2 font-medium border-b-2 smooth-transition ${
                activeTab === 'vehicles-pending'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              Vehicle Pending ({pendingListings.length})
            </button>
            <button
              onClick={() => setActiveTab('vehicles-all')}
              className={`px-4 py-2 font-medium border-b-2 smooth-transition ${
                activeTab === 'vehicles-all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              All Vehicles
            </button>
            <button
              onClick={() => setActiveTab('suppliers-pending')}
              className={`px-4 py-2 font-medium border-b-2 smooth-transition flex items-center gap-2 ${
                activeTab === 'suppliers-pending'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Supplier Pending ({supplierStats.pending})
            </button>
            <button
              onClick={() => setActiveTab('suppliers-all')}
              className={`px-4 py-2 font-medium border-b-2 smooth-transition flex items-center gap-2 ${
                activeTab === 'suppliers-all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4" />
              All Suppliers
            </button>
            <button
              onClick={() => navigate('/admin/ads')}
              className={`px-4 py-2 font-medium border-b-2 smooth-transition flex items-center gap-2 border-transparent text-muted hover:text-foreground`}
            >
              <Megaphone className="w-4 h-4" />
              Ads Management
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium border-b-2 smooth-transition flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
          <div className="flex gap-2">
            {activeTab === 'vehicles-pending' && pendingListings.length > 0 && (
              <Button 
                onClick={handleApproveAll}
                variant="default"
                size="sm"
                className="mb-2"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve All Pending
              </Button>
            )}
            {activeTab.startsWith('suppliers') && (
              <Button
                onClick={() => setShowAddSupplier(true)}
                variant="default"
                size="sm"
                className="mb-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'settings' ? (
          <AdminSettings />
        ) : activeTab.startsWith('vehicles') ? (
          <Card className="overflow-hidden">
            {(activeTab === 'vehicles-pending' ? pendingListings : allListings).length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted mb-2">No {activeTab === 'vehicles-pending' ? 'pending' : ''} listings found</p>
                <p className="text-xs text-muted">Listings will appear here as they are submitted</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(activeTab === 'vehicles-pending' ? pendingListings : allListings).map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{vehicle.title}</p>
                            <p className="text-xs text-muted">{vehicle.manufacturer} {vehicle.model}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{vehicle.sellerName}</p>
                            <p className="text-xs text-muted">{vehicle.sellerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">₹{vehicle.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              vehicle.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : vehicle.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => togglePriority(vehicle.id)}
                            className="flex items-center gap-2 hover:text-primary smooth-transition"
                            title="Toggle Priority"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                priorities.has(vehicle.id) ? 'fill-amber-500 text-amber-500' : 'text-muted'
                              }`}
                            />
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {vehicle.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(vehicle.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approve"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(vehicle.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        ) : (
          <div>
            {isLoadingSuppliers ? (
              <Card className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted mt-4">Loading suppliers...</p>
              </Card>
            ) : suppliers.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted mb-2">No suppliers found</p>
                <p className="text-xs text-muted mb-4">Add suppliers to help institutes find service providers</p>
                <Button onClick={() => setShowAddSupplier(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Supplier
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(supplier => (
                  <div key={supplier.id} className="relative">
                    <SupplierCard supplier={supplier} showStatus />
                    <div className="absolute top-3 right-3 flex gap-2">
                      {supplier.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApproveSupplier(supplier.id)}
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
          </div>
        )}
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Onboard New Supplier
            </DialogTitle>
          </DialogHeader>
          <SupplierForm onSubmit={handleAddSupplier} isLoading={isLoadingSuppliers} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
