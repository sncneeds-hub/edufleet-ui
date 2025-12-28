import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMyListings, useJobs } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VehicleCard } from '@/components/VehicleCard';
import { JobCard } from '@/components/JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit2, Trash2, Eye, User, Mail, Phone, MapPin, Building2, UserCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ListingForm } from '@/components/ListingForm';
import { JobListingForm } from '@/components/JobListingForm';
import { DashboardSuggestion } from '@/components/DashboardSuggestion';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

import { AdSlot } from '@/components/ads/AdSlot';

interface DashboardProps {
  initialTab?: string;
}

export function Dashboard({ initialTab = 'listings' }: DashboardProps) {
  const { user, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryTab = queryParams.get('tab');

  const [activeTab, setActiveTab] = useState(queryTab || initialTab);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    instituteName: user?.instituteName || '',
    contactPerson: user?.contactPerson || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        instituteName: user.instituteName || '',
        contactPerson: user.contactPerson || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const { listings: userListings, loading: listingsLoading } = useMyListings(user?.id);
  const { jobs: userJobs, loading: jobsLoading } = useJobs();
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const stats = {
    totalListings: userListings.length,
    activeListings: userListings.filter(v => v.status === 'approved').length,
    pendingApprovals: userListings.filter(v => v.status === 'pending').length,
    totalViews: userListings.reduce((acc, _) => acc + Math.floor(Math.random() * 500), 0),
    totalJobs: userJobs.length,
    activeJobs: userJobs.filter(j => j.status === 'approved').length,
    totalApplicants: userJobs.reduce((acc, j) => acc + (j.applicants || 0), 0),
  };

  const plan = user.subscription?.planId as any;
  const canAdvertise = plan?.features?.canAdvertiseVehicles ?? false;
  const maxListings = plan?.features?.maxListings ?? 0;
  const maxJobs = plan?.features?.maxJobPosts ?? 1;

  const listingLimitReached = maxListings !== -1 && userListings.length >= maxListings;
  const jobLimitReached = maxJobs !== -1 && userJobs.length >= maxJobs;

  const getSuggestedAction = () => {
    if (userListings.length === 0) {
      return {
        title: "Create Your First Listing",
        description: "Start selling your used transport vehicles by creating a listing on EduFleet Exchange.",
        action: "Create Listing",
        onClick: () => setActiveTab('create'),
        variant: 'default' as const
      };
    }
    if (stats.pendingApprovals > 0) {
      return {
        title: "Track Approval Status",
        description: `You have ${stats.pendingApprovals} listing(s) waiting for admin approval. Check their status here.`,
        action: "View Status",
        onClick: () => setActiveTab('listings'),
        variant: 'secondary' as const
      };
    }
    return {
      title: "Optimize Your Listings",
      description: "Review your active listings to ensure they have up-to-date information and photos.",
      action: "Manage Listings",
      onClick: () => setActiveTab('listings'),
      variant: 'outline' as const
    };
  };

  const suggestion = getSuggestedAction();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to access dashboard</h1>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  if (listingsLoading || jobsLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="w-64 h-10 mb-4" />
          <Skeleton className="w-32 h-6 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Ad Placement */}
        <div className="mb-8">
          <AdSlot placement="DASH_TOP" variant="banner" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">{user.instituteName}</p>
        </div>

        {/* Suggested Action */}
        <DashboardSuggestion {...suggestion} />

        {/* Subscription Status */}
        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Listings</p>
            <div className="text-3xl font-bold text-primary">{stats.totalListings}</div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Active Listings</p>
            <div className="text-3xl font-bold text-secondary">{stats.activeListings}</div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Pending Approval</p>
            <div className="text-3xl font-bold text-accent">{stats.pendingApprovals}</div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Views</p>
            <div className="text-3xl font-bold">{stats.totalViews}</div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Job Openings</p>
            <div className="text-3xl font-bold text-primary">{stats.totalJobs}</div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Active Jobs</p>
            <div className="text-3xl font-bold text-secondary">{stats.activeJobs}</div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Applicants</p>
            <div className="text-3xl font-bold text-accent">{stats.totalApplicants}</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
              activeTab === 'listings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Listing
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            My Jobs
          </button>
          <button
            onClick={() => setActiveTab('create-job')}
            className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
              activeTab === 'create-job'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Job
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium border-b-2 smooth-transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => navigate('/suppliers')}
            className="px-4 py-2 font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground smooth-transition whitespace-nowrap"
          >
            Browse Vendors
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'jobs' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Job Openings</h2>
              <Button onClick={() => setActiveTab('create-job')} className="gap-2">
                <Plus className="w-4 h-4" />
                New Job
              </Button>
            </div>

            {userJobs.length > 0 ? (
              <>
                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {userJobs.map((job) => (
                    <JobCard key={job.id || (job as any)._id} job={job} isListing={true} />
                  ))}
                </div>

                {/* Table View */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Job Management</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userJobs.map((job) => (
                          <TableRow key={job.id || (job as any)._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium line-clamp-1">{job.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {typeof job.location === 'string' ? job.location : job.location?.city || 'Location not specified'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{job.department}</TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  job.status === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : job.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{job.applicants || 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/job/${job.id || (job as any)._id}`)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/institute/job/${job.id || (job as any)._id}/applications`)}
                                  title="View Applications"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No job openings yet</p>
                <Button onClick={() => setActiveTab('create-job')}>Create First Job</Button>
              </Card>
            )}
          </div>
        ) : activeTab === 'create-job' ? (
          <div>
            {jobLimitReached ? (
              <Card className="p-12 text-center bg-amber-50 border-amber-200">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">Job Post Limit Reached</h3>
                  <p className="text-amber-800 mb-6">
                    You have reached the maximum number of job posts ({maxJobs}) allowed on your current plan.
                    Please upgrade to a Professional or higher plan to post more jobs.
                  </p>
                  <Button onClick={() => setActiveTab('profile')} className="bg-amber-600 hover:bg-amber-700">
                    Upgrade Plan
                  </Button>
                </div>
              </Card>
            ) : (
              <JobListingForm />
            )}
          </div>
        ) : activeTab === 'listings' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Listings</h2>
              <Button onClick={() => setActiveTab('create')} className="gap-2">
                <Plus className="w-4 h-4" />
                New Listing
              </Button>
            </div>

            {userListings.length > 0 ? (
              <>
                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {userListings.map((vehicle) => (
                    <VehicleCard key={vehicle.id || (vehicle as any)._id} vehicle={vehicle} isListing={true} />
                  ))}
                </div>

                {/* Table View */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Listings Management</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userListings.map((vehicle) => (
                          <TableRow key={vehicle.id || (vehicle as any)._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium line-clamp-1">{vehicle.title}</p>
                                <p className="text-xs text-muted-foreground">{vehicle.manufacturer} {vehicle.model}</p>
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
                            <TableCell>245</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/vehicle/${vehicle.id || (vehicle as any)._id}`)}
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No listings yet</p>
                <Button onClick={() => setActiveTab('create')}>Create First Listing</Button>
              </Card>
            )}
          </div>
        ) : activeTab === 'create' ? (
          <div>
            {!canAdvertise ? (
              <Card className="p-12 text-center bg-blue-50 border-blue-200">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Upgrade Required</h3>
                  <p className="text-blue-800 mb-6">
                    Your current plan does not allow advertising vehicles. 
                    Please upgrade to a Professional or higher plan to start listing your vehicles.
                  </p>
                  <Button onClick={() => setActiveTab('profile')} className="bg-blue-600 hover:bg-blue-700">
                    View Upgrade Options
                  </Button>
                </div>
              </Card>
            ) : listingLimitReached ? (
              <Card className="p-12 text-center bg-amber-50 border-amber-200">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">Listing Limit Reached</h3>
                  <p className="text-amber-800 mb-6">
                    You have reached the maximum number of vehicle listings ({maxListings}) allowed on your current plan.
                    Please upgrade to a Business or higher plan to list more vehicles.
                  </p>
                  <Button onClick={() => setActiveTab('profile')} className="bg-amber-600 hover:bg-amber-700">
                    Upgrade Plan
                  </Button>
                </div>
              </Card>
            ) : (
              <ListingForm />
            )}
          </div>
        ) : activeTab === 'profile' ? (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Institute Profile</CardTitle>
                  <CardDescription>Manage your institute's details and contact information</CardDescription>
                </div>
                {!isEditingProfile && (
                  <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Avatar & Role */}
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-2xl bg-primary text-white">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-semibold text-lg">{user.name}</p>
                      <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full uppercase">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Right: Form */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Full Name</Label>
                        <div className="relative">
                          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-institute">Institute Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-institute"
                            value={profileData.instituteName}
                            onChange={(e) => setProfileData({ ...profileData, instituteName: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-email"
                            value={user.email}
                            disabled
                            className="pl-10 bg-muted"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-contact">Contact Person</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-contact"
                            value={profileData.contactPerson}
                            onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="profile-location"
                            value={profileData.location}
                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            disabled={!isEditingProfile}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    {isEditingProfile && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 border-red-100 bg-red-50/10">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="gap-2">
                  Deactivate Account
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ListingForm />
        )}
      </div>
    </div>
  );
}
