import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { SessionManager, FILTER_KEYS } from '@/lib/session';
import { useScrollRestoration } from '@/hooks/useStateRestoration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Car, Plus, AlertCircle, CheckCircle, Clock, XCircle, CreditCard, TrendingUp, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UpgradeBanner } from '@/components/subscription/UpgradeBanner';

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

interface SubscriptionInfo {
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  limits: {
    maxVehicles: number;
    listingDuration: number;
    searchBoost: number;
    featuredBadge: boolean;
    homepagePromotion: boolean;
  };
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  useScrollRestoration(FILTER_KEYS.SCHOOL_DASHBOARD);
  
  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
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

        // Load subscription info
        try {
          const subscription = await api.subscriptions.getStatus();
          setSubscriptionInfo(subscription);
        } catch (error) {
          console.error('Error loading subscription info:', error);
        }

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

  // Calculate upgrade prompts based on subscription limits
  const getUpgradeBanner = () => {
    if (!subscriptionInfo) return null;

    const currentPlan = subscriptionInfo.subscriptionPlan || 'Silver';
    const maxVehicles = subscriptionInfo.limits.maxVehicles;
    const approvedCount = stats.approvedVehicles;

    // Check if subscription is expiring soon (within 7 days)
    if (subscriptionInfo.subscriptionEndDate) {
      const endDate = new Date(subscriptionInfo.subscriptionEndDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        return (
          <UpgradeBanner
            message={`Your ${currentPlan} subscription expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}. Renew now to avoid service interruption.`}
            reason="expiring"
            currentPlan={currentPlan}
            onUpgrade={() => navigate('/pricing')}
            dismissible={true}
          />
        );
      }
    }

    // Check if at vehicle limit (unlimited = -1)
    if (maxVehicles !== -1) {
      const usagePercent = Math.round((approvedCount / maxVehicles) * 100);

      if (approvedCount >= maxVehicles) {
        return (
          <UpgradeBanner
            message="You've reached your vehicle listing limit! Upgrade to post more vehicles and grow your sales."
            reason="limitReached"
            currentPlan={currentPlan}
            recommendedPlan={currentPlan === 'Silver' ? 'Gold' : 'Platinum'}
            progress={100}
            onUpgrade={() => navigate('/pricing')}
            dismissible={false}
          />
        );
      }

      if (usagePercent >= 80) {
        return (
          <UpgradeBanner
            message={`You're using ${usagePercent}% of your vehicle listing capacity. Upgrade now to ensure you never hit your limit.`}
            reason="nearLimit"
            currentPlan={currentPlan}
            recommendedPlan={currentPlan === 'Silver' ? 'Gold' : 'Platinum'}
            progress={usagePercent}
            onUpgrade={() => navigate('/pricing')}
            dismissible={true}
          />
        );
      }
    }

    // Promote upgrade for Silver plan users
    if (currentPlan === 'Silver' && approvedCount >= 3) {
      return (
        <UpgradeBanner
          message="Unlock advanced features! Get featured badges, homepage promotion, and 2x search ranking boost with Gold plan."
          reason="upgrade"
          currentPlan={currentPlan}
          recommendedPlan="Gold"
          onUpgrade={() => navigate('/pricing')}
          dismissible={true}
        />
      );
    }

    // Promote Platinum for Gold users
    if (currentPlan === 'Gold' && approvedCount >= 20) {
      return (
        <UpgradeBanner
          message="Ready for unlimited listings? Upgrade to Platinum for unlimited vehicles, 5x search boost, and dedicated support."
          reason="feature"
          currentPlan={currentPlan}
          recommendedPlan="Platinum"
          onUpgrade={() => navigate('/pricing')}
          dismissible={true}
        />
      );
    }

    return null;
  };

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

      {/* Upgrade Banner - Show at top of dashboard */}
      {getUpgradeBanner() && (
        <div className="mb-6">
          {getUpgradeBanner()}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/school/statistics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statistics</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">View inquiry analytics</p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" onClick={() => navigate('/school/analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">View inquiry & listing analytics</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20" onClick={() => navigate('/school/analytics-products')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Reports</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Market insights & benchmarks</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Info */}
      {subscriptionInfo && (
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-background to-secondary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Plan
                </CardTitle>
                <CardDescription>Your current subscription details and limits</CardDescription>
              </div>
              <Badge className={`text-white ${
                subscriptionInfo.subscriptionPlan === 'Platinum' 
                  ? 'bg-gradient-to-r from-purple-400 to-purple-600' 
                  : subscriptionInfo.subscriptionPlan === 'Gold'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  : 'bg-gradient-to-r from-slate-400 to-slate-600'
              }`}>
                {subscriptionInfo.subscriptionPlan || 'Silver'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Plan Status & Expiry */}
              {subscriptionInfo.subscriptionEndDate && (
                <div className="bg-secondary/30 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Plan Status</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {subscriptionInfo.subscriptionStatus === 'active' ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Valid Until</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(subscriptionInfo.subscriptionEndDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({Math.ceil((new Date(subscriptionInfo.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Limits & Usage */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Vehicle Limit with Progress */}
                <div className="col-span-2 md:col-span-1">
                  <p className="text-sm text-muted-foreground mb-2">Vehicle Listings</p>
                  <p className="text-2xl font-bold">
                    {subscriptionInfo.limits.maxVehicles === -1 ? 'Unlimited' : (
                      <>
                        {stats.approvedVehicles}
                        <span className="text-base text-muted-foreground font-normal">
                          {' / '}{subscriptionInfo.limits.maxVehicles}
                        </span>
                      </>
                    )}
                  </p>
                  {subscriptionInfo.limits.maxVehicles !== -1 && (
                    <div className="mt-2">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (stats.approvedVehicles / subscriptionInfo.limits.maxVehicles) >= 0.9
                              ? 'bg-red-500'
                              : (stats.approvedVehicles / subscriptionInfo.limits.maxVehicles) >= 0.8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((stats.approvedVehicles / subscriptionInfo.limits.maxVehicles) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round((stats.approvedVehicles / subscriptionInfo.limits.maxVehicles) * 100)}% used
                      </p>
                    </div>
                  )}
                </div>

                {/* Search Boost */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Search Ranking</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {subscriptionInfo.limits.searchBoost}x
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Visibility boost</p>
                </div>

                {/* Listing Duration */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Listing Duration</p>
                  <p className="text-2xl font-bold">{subscriptionInfo.limits.listingDuration}</p>
                  <p className="text-xs text-muted-foreground mt-1">days per listing</p>
                </div>

                {/* Featured Badge */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Featured Badge</p>
                  <p className="text-lg font-semibold">
                    {subscriptionInfo.limits.featuredBadge ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Enabled
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Not included
                      </span>
                    )}
                  </p>
                </div>

                {/* Homepage Promotion */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Homepage Promo</p>
                  <p className="text-lg font-semibold">
                    {subscriptionInfo.limits.homepagePromotion ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Enabled
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Not included
                      </span>
                    )}
                  </p>
                </div>

                {/* Priority Support */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Priority Support</p>
                  <p className="text-lg font-semibold">
                    {subscriptionInfo.limits.prioritySupport ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Enabled
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Not included
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/pricing')}
                  className="flex-1"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/school/transactions')}
                  className="flex-1"
                >
                  View Billing History
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
