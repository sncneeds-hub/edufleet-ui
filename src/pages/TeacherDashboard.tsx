import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api';
import { useMyApplications } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  BookOpen, 
  Clock,
  Video,
  MapPinned,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  Search,
  SearchCheck,
  SearchX
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { Switch } from '@/components/ui/switch';
import { SubscriptionStatus } from '@/components/SubscriptionStatus'; // Assuming this component exists
import { SubscriptionAlert } from '@/components/SubscriptionAlert';
import { SubscriptionUsageCard } from '@/components/SubscriptionUsageCard';

export function TeacherDashboard() {
  const { user, updateProfile, refreshProfile, subscription, ensureSubscription } = useAuth();
  const { applications, loading: appsLoading, refetch: refetchApps } = useMyApplications();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'profile';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    experience: user?.experience || 0,
    qualifications: user?.qualifications || [],
    subjects: user?.subjects || [],
    isAvailable: user?.isAvailable ?? true,
  });
  const [newQual, setNewQual] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // Refresh profile and data when user is available
  useEffect(() => {
    if (user?.id) {
      refreshProfile();
      ensureSubscription();
      refetchApps();
    }
  }, [user?.id, refreshProfile, ensureSubscription, refetchApps]);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        experience: user.experience || 0,
        qualifications: user.qualifications || [],
        subjects: user.subjects || [],
        isAvailable: user.isAvailable ?? true,
      });
    }
  }, [user]);

  // Separate interviews from applications that have interviews scheduled
  const interviews = applications.filter(app => app.interviewScheduled);

  const handleSaveProfile = () => {
    if (user) {
      updateProfile(editData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    }
  };

  const addQualification = () => {
    if (newQual.trim() && !editData.qualifications.includes(newQual.trim())) {
      setEditData({
        ...editData,
        qualifications: [...editData.qualifications, newQual.trim()]
      });
      setNewQual('');
    }
  };

  const removeQualification = (qual: string) => {
    setEditData({
      ...editData,
      qualifications: editData.qualifications.filter(q => q !== qual)
    });
  };

  const addSubject = () => {
    if (newSubject.trim() && !editData.subjects.includes(newSubject.trim())) {
      setEditData({
        ...editData,
        subjects: [...editData.subjects, newSubject.trim()]
      });
      setNewSubject('');
    }
  };

  const removeSubject = (subj: string) => {
    setEditData({
      ...editData,
      subjects: editData.subjects.filter(s => s !== subj)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'reviewed': return 'bg-blue-500';
      case 'shortlisted': return 'bg-purple-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'shortlisted': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getInterviewModeIcon = (mode: string) => {
    switch (mode) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPinned className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const subscriptionData = subscription.data;
  const availablePlans = subscription.plans;
  const subscriptionStats = subscription.stats;
  const subscriptionLoading = subscription.loading;

  // Loading state while checking auth or loading data
  if (!user || appsLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role !== 'teacher') {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="DASH_TOP" variant="banner" />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile, applications, and interviews</p>
        </div>

        {/* Subscription Alerts & Usage Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SubscriptionAlert 
              subscription={subscriptionData} 
              stats={subscriptionStats} 
            />
          </div>
          <div className="lg:col-span-1">
            <SubscriptionUsageCard 
              stats={subscriptionStats} 
              loading={subscriptionLoading} 
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="interviews">
              Interviews ({interviews.length})
            </TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Subscription Management</h2>
              </div>
              <SubscriptionStatus 
                subscriptionData={subscriptionData} 
                availablePlans={availablePlans} 
                subscriptionStats={subscriptionStats} 
                isLoading={subscriptionLoading} 
              />
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      {isEditing ? (
                        <div className="space-y-1">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="text-2xl font-bold h-auto py-1"
                          />
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-2xl">{user.name}</CardTitle>
                          <CardDescription>{user.email}</CardDescription>
                        </>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    variant={isEditing ? 'default' : 'outline'}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Searchability Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${editData.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {editData.isAvailable ? <SearchCheck className="h-5 w-5" /> : <SearchX className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">Institute Searchability</p>
                      <p className="text-sm text-muted-foreground">
                        {editData.isAvailable 
                          ? 'Your profile is visible to institutes looking for teachers' 
                          : 'Your profile is hidden from institute searches'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isAvailable" className="sr-only">Toggle Searchability</Label>
                    <Switch
                      id="isAvailable"
                      checked={editData.isAvailable}
                      onCheckedChange={(checked) => setEditData({ ...editData, isAvailable: checked })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    {isEditing ? (
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone || 'Not provided'}</span>
                      </div>
                    )}
                    {isEditing ? (
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{user.location || 'Not provided'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={editData.experience}
                            onChange={(e) => setEditData({ ...editData, experience: parseInt(e.target.value) || 0 })}
                            className="w-20"
                          />
                          <span>years experience</span>
                        </div>
                      ) : (
                        <span>{user.experience || 0} years experience</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Qualifications
                  </h3>
                  {isEditing ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {editData.qualifications?.map((qual) => (
                          <Badge key={qual} variant="secondary" className="flex items-center gap-1">
                            {qual}
                            <button onClick={() => removeQualification(qual)} className="ml-1 text-red-500 hover:text-red-700">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add new qualification"
                          value={newQual}
                          onChange={(e) => setNewQual(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addQualification()}
                          className="max-w-sm"
                        />
                        <Button onClick={addQualification} size="sm">Add</Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.qualifications?.map((qual) => (
                        <Badge key={qual} variant="secondary">
                          {qual}
                        </Badge>
                      ))}
                      {user.qualifications?.length === 0 && <p className="text-muted-foreground">No qualifications added yet</p>}
                    </div>
                  )}
                </div>

                {/* Subjects */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subjects
                  </h3>
                  {isEditing ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {editData.subjects?.map((subj) => (
                          <Badge key={subj} variant="outline" className="flex items-center gap-1">
                            {subj}
                            <button onClick={() => removeSubject(subj)} className="ml-1 text-red-500 hover:text-red-700">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add new subject"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                          className="max-w-sm"
                        />
                        <Button onClick={addSubject} size="sm">Add</Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.subjects?.map((subj) => (
                        <Badge key={subj} variant="outline">
                          {subj}
                        </Badge>
                      ))}
                      {user.subjects?.length === 0 && <p className="text-muted-foreground">No subjects added yet</p>}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Bio</h3>
                  {isEditing ? (
                    <Textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-muted-foreground">{user.bio || 'No bio added yet'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="space-y-4">
              {applications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No applications yet</p>
                    <Link to="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                applications.map((app) => {
                  const job = app.jobId; // Populated job data
                  return (
                  <Card key={app._id || app.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{job?.title || 'Job'}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3" />
                            {app.instituteName}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(app.status)} text-white flex items-center gap-1`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Applied on {new Date(app.appliedDate).toLocaleDateString()}
                        </div>

                        {app.interviewScheduled && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Interview Scheduled
                            </p>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {new Date(app.interviewScheduled.scheduledDate).toLocaleDateString()} at {app.interviewScheduled.scheduledTime}
                              </div>
                              <div className="flex items-center gap-2">
                                {getInterviewModeIcon(app.interviewScheduled.mode)}
                                {app.interviewScheduled.mode}
                                {app.interviewScheduled.location && ` - ${app.interviewScheduled.location}`}
                                {app.interviewScheduled.meetingLink && (
                                  <a 
                                    href={app.interviewScheduled.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Join Meeting
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Link to={`/job/${job?._id || job?.id || (typeof app.jobId === 'string' ? app.jobId : app.jobId?._id || app.jobId?.id)}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Job
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No interviews scheduled</p>
                  </CardContent>
                </Card>
              ) : (
                interviews.map((app) => {
                  const interview = app.interviewScheduled;
                  return (
                  <Card key={app._id || app.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getInterviewModeIcon(interview.mode)}
                            Interview - {app.instituteName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Job: {app.jobId?.title || 'N/A'}
                          </CardDescription>
                        </div>
                        <Badge variant="default">
                          Scheduled
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(interview.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {interview.scheduledTime} ({interview.duration} mins)
                        </div>
                      </div>

                      {interview.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPinned className="h-4 w-4 text-muted-foreground" />
                          {interview.location}
                        </div>
                      )}

                      {interview.meetingLink && (
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={interview.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {interview.meetingLink}
                          </a>
                        </div>
                      )}

                      {interview.notes && (
                        <div className="p-3 bg-muted rounded text-sm">
                          <p className="font-semibold mb-1">Notes:</p>
                          <p>{interview.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
