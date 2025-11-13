import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Search, Eye, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface FeaturedVehicle {
  _id: string;
  id?: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  instituteName: string;
  isPromotedAd: boolean;
  adPlacements: string[];
  adPrice: number;
  totalViews: number;
  totalClicks: number;
  listingExpiresAt?: string | Date;
  images: string[];
}

export default function FeaturedAdsManagement() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<FeaturedVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<FeaturedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    loadFeaturedAds();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchQuery, statusFilter]);

  const loadFeaturedAds = async () => {
    try {
      setLoading(true);
      // Fetch all vehicles with isPromotedAd = true
      const response = await api.vehicles.getAll({ 
        status: 'approved',
        isPromotedAd: true 
      });
      setVehicles(response as FeaturedVehicle[]);
    } catch (error) {
      console.error('Error loading featured ads:', error);
      toast.error('Failed to load featured ads');
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.brand?.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.instituteName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => {
        const isActive = isAdActive(v);
        return statusFilter === 'active' ? isActive : !isActive;
      });
    }

    setFilteredVehicles(filtered);
  };

  const isAdActive = (vehicle: FeaturedVehicle): boolean => {
    if (!vehicle.listingExpiresAt) return false;
    const expiresAt = new Date(vehicle.listingExpiresAt);
    const now = new Date();
    return expiresAt > now;
  };

  const getExpiryText = (vehicle: FeaturedVehicle): string => {
    if (!vehicle.listingExpiresAt) return 'No expiry';
    
    const expiresAt = new Date(vehicle.listingExpiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `${daysLeft} days left`;
  };

  const getTotalRevenue = () => {
    return vehicles.reduce((sum, v) => sum + (v.adPrice || 0), 0);
  };

  const getTotalViews = () => {
    return vehicles.reduce((sum, v) => sum + (v.totalViews || 0), 0);
  };

  const getTotalClicks = () => {
    return vehicles.reduce((sum, v) => sum + (v.totalClicks || 0), 0);
  };

  const getActiveAdsCount = () => {
    return vehicles.filter(v => isAdActive(v)).length;
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="featured-ads">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading featured ads...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="featured-ads">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Featured Ads Management
          </h1>
          <p className="text-muted-foreground">Monitor and manage promoted vehicle listings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Active Ads
              </CardDescription>
              <CardTitle className="text-3xl">{getActiveAdsCount()}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Total Revenue
              </CardDescription>
              <CardTitle className="text-3xl">₹{getTotalRevenue().toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                Total Views
              </CardDescription>
              <CardTitle className="text-3xl">{getTotalViews().toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Total Clicks
              </CardDescription>
              <CardTitle className="text-3xl">{getTotalClicks().toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by brand, model, or institute..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ads</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Ads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Ads ({filteredVehicles.length})</CardTitle>
            <CardDescription>All promoted vehicle listings</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No featured ads found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Institute</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Ad Revenue</TableHead>
                      <TableHead>Placements</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => {
                      const vehicleId = vehicle._id || vehicle.id || '';
                      const isActive = isAdActive(vehicle);
                      const expiryText = getExpiryText(vehicle);

                      return (
                        <TableRow key={vehicleId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {vehicle.brand} {vehicle.model}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle.year}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {vehicle.instituteName}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{vehicle.price.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            ₹{vehicle.adPrice?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {vehicle.adPlacements?.map((placement, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {placement}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {vehicle.totalViews || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {vehicle.totalClicks || 0}
                          </TableCell>
                          <TableCell>
                            {isActive ? (
                              <div>
                                <Badge className="bg-green-500 hover:bg-green-600 mb-1">
                                  Active
                                </Badge>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {expiryText}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="secondary">Expired</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/vehicles/${vehicleId}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
