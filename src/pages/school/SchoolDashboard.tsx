import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { SessionManager, FILTER_KEYS } from '@/lib/session';
import { useScrollRestoration } from '@/hooks/useStateRestoration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Car, Plus, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Institute {
  id: string;
  instituteName: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

interface DashboardStats {
  totalVehicles: number;
  pendingVehicles: number;
  approvedVehicles: number;
  rejectedVehicles: number;
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  useScrollRestoration(FILTER_KEYS.SCHOOL_DASHBOARD);
  
  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    pendingVehicles: 0,
    approvedVehicles: 0,
    rejectedVehicles: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await api.auth.me();

      // Load institute profile
      const institute = await api.institutes.getByUserId(user.id);

      if (institute) {
        setInstitute(institute);

        // Load vehicle statistics - handle network errors gracefully
        try {
          const vehicles = await api.vehicles.getAll({ instituteId: institute.id });

          const statsData: DashboardStats = {
            totalVehicles: vehicles.length,
            pendingVehicles: vehicles.filter(v => v.approvalStatus === 'pending').length,
            approvedVehicles: vehicles.filter(v => v.approvalStatus === 'approved').length,
            rejectedVehicles: vehicles.filter(v => v.approvalStatus === 'rejected').length,
          };

          setStats(statsData);
        } catch (apiError: any) {
          // Network error - use default stats (0)
          if (apiError?.code === 'ERR_NETWORK' || apiError?.message?.includes('Network')) {
            console.log('Backend not available - showing default stats');
          } else {
            console.error('Error loading vehicle statistics:', apiError);
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // No institute profile
  if (!institute) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Please create your institute profile to start using EduFleet</span>
            <Button onClick={() => navigate('/school/profile')} size="sm">
              Create Profile
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Institute rejected
  if (institute.approvalStatus === 'rejected') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Your institute profile has been rejected</p>
              <p>Reason: {institute.rejectionReason || 'No reason provided'}</p>
              <Button
                onClick={() => navigate('/school/profile')}
                size="sm"
                variant="outline"
                className="mt-2"
              >
                Update Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Institute pending
  if (institute.approvalStatus === 'pending') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Your institute profile is pending approval</p>
              <p>Admin will review your profile shortly. You'll be able to post vehicles once approved.</p>
              <Button
                onClick={() => navigate('/school/profile')}
                size="sm"
                variant="outline"
                className="mt-2"
              >
                View Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Institute approved - show dashboard
  return (
    <DashboardLayout activeTab="dashboard">
      <div className="container mx-auto px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Badge variant="default">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        </div>
        <p className="text-muted-foreground">Welcome back, {institute.instituteName}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/school/post-vehicle')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Post New Vehicle</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">List a vehicle for sale</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/school/my-vehicles')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Manage your listings</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/school/profile')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institute Profile</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Update your information</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vehicle Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVehicles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedVehicles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejectedVehicles}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick tips to make the most of EduFleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Post Your Vehicles</h4>
                <p className="text-sm text-muted-foreground">
                  Add detailed information and clear photos to attract buyers
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Wait for Approval</h4>
                <p className="text-sm text-muted-foreground">
                  Admin will review and approve your listings within 24-48 hours
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Manage Listings</h4>
                <p className="text-sm text-muted-foreground">
                  Track inquiries and update vehicle information as needed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
