import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { SessionManager, FILTER_KEYS } from '@/lib/session';
import { useStateRestoration } from '@/hooks/useStateRestoration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Search, Trash2, Edit, Eye, Tag, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UpgradeBanner } from '@/components/subscription/UpgradeBanner';
import { UpgradePromptModal } from '@/components/subscription/UpgradePromptModal';
import { SoldConfirmationDialog } from '@/components/payments/SoldConfirmationDialog';
import { FeaturedAdCheckout } from '@/components/payments/FeaturedAdCheckout';

interface Vehicle {
  _id: string;
  id?: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  seatingCapacity: number;
  mileage: number;
  fuelType: string;
  price: number;
  description: string;
  condition: string;
  images: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  soldStatus?: 'available' | 'sold';
  isPromotedAd?: boolean;
  listingExpiresAt?: string | Date;
  adPlacements?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MyVehicles() {
  const navigate = useNavigate();
  const { saveFilters, restoreFilters } = useStateRestoration({
    filterKey: FILTER_KEYS.MY_VEHICLES,
  });

  const savedFilters = restoreFilters();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(savedFilters?.searchQuery || '');
  const [statusFilter, setStatusFilter] = useState<string>(savedFilters?.statusFilter || 'all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [vehicleToMarkSold, setVehicleToMarkSold] = useState<Vehicle | null>(null);
  
  // Featured Ad state
  const [featuredAdDialogOpen, setFeaturedAdDialogOpen] = useState(false);
  const [vehicleToPromote, setVehicleToPromote] = useState<string | null>(null);
  
  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const loadVehicles = useCallback(async () => {
    try {
      const user = await api.auth.me();
      
      // Get institute ID
      const institute = await api.institutes.getByUserId(user._id || user.id);

      if (!institute) {
        setLoading(false);
        return;
      }

      // Fetch subscription info
      try {
        const response = await fetch(`/api/subscriptions/status`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (response.ok) {
          const subData = await response.json();
          setSubscription(subData.data);
        }
      } catch (subError) {
        console.error('Failed to fetch subscription:', subError);
      }

      // Fetch vehicles for this institute
      const instituteId = institute._id || institute.id;
      const vehiclesData = await api.vehicles.getAll({ instituteId });

      setVehicles(vehiclesData);
      setFilteredVehicles(vehiclesData);

      // Check if limit reached
      if (subscription?.limits?.maxVehicles && subscription.limits.maxVehicles !== -1) {
        const approvedCount = vehiclesData.filter(v => v.status === 'approved' && v.soldStatus !== 'sold').length;
        if (approvedCount >= subscription.limits.maxVehicles) {
          setLimitReached(true);
        }
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const filterVehicles = useCallback(() => {
    let filtered = vehicles;

    if (searchQuery) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, statusFilter]);

  useEffect(() => {
    filterVehicles();
  }, [filterVehicles]);

  useEffect(() => {
    saveFilters({
      searchQuery,
      statusFilter,
      timestamp: Date.now(),
    });
  }, [searchQuery, statusFilter, saveFilters]);

  const handleDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      await api.vehicles.delete(vehicleToDelete);
      toast.success('Vehicle deleted successfully');
      setVehicles(prev => prev.filter(v => (v._id || v.id) !== vehicleToDelete));
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const handleMarkAsSoldClick = (vehicle: Vehicle) => {
    setVehicleToMarkSold(vehicle);
    setSoldDialogOpen(true);
  };

  const handleSoldSuccess = () => {
    if (vehicleToMarkSold) {
      const vehicleId = vehicleToMarkSold._id || vehicleToMarkSold.id;
      setVehicles(prev => 
        prev.map(v => (v._id || v.id) === vehicleId ? { ...v, soldStatus: 'sold' } : v)
      );
      loadVehicles(); // Reload to get latest data
    }
  };

  const handlePromoteClick = (vehicleId: string) => {
    setVehicleToPromote(vehicleId);
    setFeaturedAdDialogOpen(true);
  };

  const handlePromoteSuccess = () => {
    loadVehicles(); // Reload to show updated promotion status
    toast.success('Vehicle promoted successfully!');
  };

  const isVehiclePromoted = (vehicle: Vehicle): boolean => {
    if (!vehicle.isPromotedAd) return false;
    if (!vehicle.listingExpiresAt) return false;
    
    // Check if promotion is still active
    const expiresAt = new Date(vehicle.listingExpiresAt);
    const now = new Date();
    return expiresAt > now;
  };

  const getPromotionExpiryText = (vehicle: Vehicle): string => {
    if (!vehicle.listingExpiresAt) return '';
    
    const expiresAt = new Date(vehicle.listingExpiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `${daysLeft} days left`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="my-vehicles">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading vehicles...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="my-vehicles">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Vehicles</h1>
            <p className="text-muted-foreground">Manage your vehicle listings</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button onClick={() => navigate('/school/post-vehicle')}>
              <Plus className="mr-2 h-4 w-4" />
              Post Vehicle
            </Button>
            {subscription && (
              <Badge variant="outline" className="text-xs">
                Plan: {subscription.subscriptionPlan || 'Silver'} • {filteredVehicles.length}/{subscription.limits?.maxVehicles === -1 ? '∞' : subscription.limits?.maxVehicles || 10}
              </Badge>
            )}
          </div>
        </div>

        {/* Upgrade Banner if limit reached */}
        {limitReached && subscription && (
          <div className="mb-6">
            <UpgradeBanner
              message={`You've reached your ${subscription.subscriptionPlan} plan limit of ${subscription.limits?.maxVehicles} listings.`}
              reason="limitReached"
              currentPlan={subscription.subscriptionPlan}
              onUpgrade={() => setUpgradeModalOpen(true)}
            />
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by make, model, or registration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles List */}
        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {vehicles.length === 0
                  ? 'No vehicles posted yet'
                  : 'No vehicles match your filters'}
              </p>
              {vehicles.length === 0 && (
                <Button onClick={() => navigate('/school/post-vehicle')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Vehicle
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredVehicles.map((vehicle) => {
              const vehicleId = vehicle._id || vehicle.id;
              const images = JSON.parse(vehicle.images || '[]');
              const firstImage = images[0] || 'https://storage.googleapis.com/blink-core-storage/projects/edufleetphase30-3-sma0i152/images/generated-image-1762623375424-0.webp';

              const isPromoted = isVehiclePromoted(vehicle);
              const promotionExpiry = isPromoted ? getPromotionExpiryText(vehicle) : '';

              return (
                <Card key={vehicleId} className={`overflow-hidden ${isPromoted ? 'border-2 border-yellow-400 shadow-lg' : ''}`}>
                  <div className="aspect-[4/3] bg-muted relative">
                    <img
                      src={firstImage}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2">
                      {isPromoted && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge
                        className="text-xs ml-auto"
                        variant={getStatusBadgeVariant(vehicle.status)}
                      >
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm line-clamp-1">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {vehicle.registrationNumber} • {vehicle.seatingCapacity} seats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Price</span>
                        <span className="font-semibold text-sm">₹{vehicle.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Mileage</span>
                        <span className="text-xs">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Condition</span>
                        <span className="text-xs capitalize">{vehicle.condition.replace('-', ' ')}</span>
                      </div>

                      {vehicle.status === 'rejected' && vehicle.rejectionReason && (
                        <div className="p-2 bg-destructive/10 rounded-lg">
                          <p className="text-xs font-medium text-destructive mb-1">Rejection Reason:</p>
                          <p className="text-xs text-destructive/90 line-clamp-2">{vehicle.rejectionReason}</p>
                        </div>
                      )}

                      {isPromoted && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs font-medium text-yellow-700 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Promoted: {promotionExpiry}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs px-2 py-1 h-7"
                            onClick={() => navigate(`/vehicles/${vehicleId}`)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-7"
                            onClick={() => navigate(`/school/edit-vehicle/${vehicleId}`)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-7"
                            onClick={() => {
                              setVehicleToDelete(vehicleId);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {vehicle.status === 'approved' && vehicle.soldStatus !== 'sold' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full text-xs px-2 py-1 h-7"
                              onClick={() => handleMarkAsSoldClick(vehicle)}
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              Mark as Sold
                            </Button>
                            {!isPromoted && (
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full text-xs px-2 py-1 h-7 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                                onClick={() => handlePromoteClick(vehicleId)}
                              >
                                <Sparkles className="mr-1 h-3 w-3" />
                                Promote Vehicle
                              </Button>
                            )}
                          </>
                        )}
                        {vehicle.soldStatus === 'sold' && (
                          <Badge variant="outline" className="w-full justify-center text-xs">
                            Sold
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this vehicle listing? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setVehicleToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Upgrade Modal */}
        <UpgradePromptModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          onUpgrade={() => {
            navigate('/pricing');
            setUpgradeModalOpen(false);
          }}
          title="Reach More Buyers"
          description="Upgrade your plan to post more vehicle listings and reach more buyers"
          currentPlan={subscription?.subscriptionPlan || 'Silver'}
          recommendedPlan="Gold"
          features={[
            'Post up to 30 vehicle listings (vs 10 with Silver)',
            'Listings active for 60 days (vs 7 days)',
            'Featured badges on all listings',
            'Homepage promotion for your vehicles',
            'Priority customer support',
          ]}
        />

        {/* Sold Confirmation Dialog */}
        {vehicleToMarkSold && (
          <SoldConfirmationDialog
            open={soldDialogOpen}
            onClose={() => {
              setSoldDialogOpen(false);
              setVehicleToMarkSold(null);
            }}
            vehicleId={vehicleToMarkSold._id || vehicleToMarkSold.id || ''}
            vehicleTitle={`${vehicleToMarkSold.make} ${vehicleToMarkSold.model} (${vehicleToMarkSold.year})`}
            listedPrice={vehicleToMarkSold.price}
            onSuccess={handleSoldSuccess}
          />
        )}

        {/* Featured Ad Checkout Dialog */}
        {vehicleToPromote && (
          <FeaturedAdCheckout
            open={featuredAdDialogOpen}
            onClose={() => {
              setFeaturedAdDialogOpen(false);
              setVehicleToPromote(null);
            }}
            vehicleId={vehicleToPromote}
            onSuccess={handlePromoteSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
