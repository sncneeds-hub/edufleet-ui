import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Video,
  MapPinned,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Define valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['reviewed', 'shortlisted', 'rejected', 'accepted'],
  reviewed: ['shortlisted', 'rejected', 'accepted', 'pending'],
  shortlisted: ['interview_scheduled', 'accepted', 'rejected', 'reviewed', 'pending'],
  interview_scheduled: ['accepted', 'rejected', 'shortlisted', 'reviewed', 'pending'],
  accepted: ['rejected'], // Limited transitions from accepted
  rejected: ['pending', 'reviewed', 'shortlisted', 'interview_scheduled'], // Can reconsider
};

// Get allowed transitions for current status
const getAllowedTransitions = (currentStatus: string): string[] => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};

export function InstituteJobApplications() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusChangeTarget, setStatusChangeTarget] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    duration: '60',
    mode: 'video' as 'video' | 'phone' | 'in-person',
    location: '',
    meetingLink: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load job details
      const jobResponse = await api.jobs.getJobById(jobId!);
      setJob(jobResponse.data);
      
      // Load applications
      const appsResponse = await api.jobs.getApplications({ jobId });
      setApplications(appsResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await api.jobs.updateApplicationStatus(applicationId, { status: newStatus });
      const statusMessages: Record<string, string> = {
        reviewed: 'Application marked as reviewed',
        shortlisted: 'Candidate shortlisted',
        accepted: 'Candidate accepted! 🎉',
        rejected: 'Application rejected',
        pending: 'Application moved back to pending',
        interview_scheduled: 'Interview scheduled',
      };
      toast.success(statusMessages[newStatus] || `Status updated to ${newStatus}`);
      setShowStatusDialog(false);
      setStatusChangeTarget(null);
      loadData(); // Reload data
    } catch (error: any) {
      console.error('Failed to update status:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to update application status';
      toast.error(errorMessage);
    }
  };

  const openStatusChangeDialog = (application: any, newStatus: string) => {
    setSelectedApplication(application);
    setStatusChangeTarget(newStatus);
    setShowStatusDialog(true);
  };

  const handleScheduleInterview = (application: any, reschedule = false) => {
    setSelectedApplication(application);
    setIsRescheduling(reschedule);
    
    // Pre-fill if rescheduling
    if (reschedule && application.interviewScheduled) {
      setInterviewData({
        date: application.interviewScheduled.scheduledDate,
        time: application.interviewScheduled.scheduledTime,
        duration: application.interviewScheduled.duration,
        mode: application.interviewScheduled.mode,
        location: application.interviewScheduled.location || '',
        meetingLink: application.interviewScheduled.meetingLink || '',
        notes: application.interviewScheduled.notes || '',
      });
    } else {
      setInterviewData({
        date: '',
        time: '',
        duration: '60',
        mode: 'video',
        location: '',
        meetingLink: '',
        notes: '',
      });
    }
    
    setShowScheduleDialog(true);
  };

  const submitScheduleInterview = async () => {
    if (!interviewData.date || !interviewData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (interviewData.mode === 'video' && !interviewData.meetingLink) {
      toast.error('Please provide a meeting link for video interviews');
      return;
    }

    if (interviewData.mode === 'in-person' && !interviewData.location) {
      toast.error('Please provide a location for in-person interviews');
      return;
    }

    const appId = selectedApplication?._id || selectedApplication?.id;
    if (!appId) {
      toast.error('Invalid application ID');
      return;
    }

    try {
      const interviewDetails = {
        scheduledDate: interviewData.date,
        scheduledTime: interviewData.time,
        duration: interviewData.duration,
        mode: interviewData.mode,
        location: interviewData.location,
        meetingLink: interviewData.meetingLink,
        notes: interviewData.notes,
      };

      if (isRescheduling) {
        await api.jobs.rescheduleInterview(appId, interviewDetails);
        toast.success('Interview rescheduled successfully!');
      } else {
        await api.jobs.updateApplicationStatus(appId, {
          interviewScheduled: interviewDetails
        });
        toast.success('Interview scheduled successfully!');
      }

      setShowScheduleDialog(false);
      setIsRescheduling(false);
      setInterviewData({
        date: '',
        time: '',
        duration: '60',
        mode: 'video',
        location: '',
        meetingLink: '',
        notes: '',
      });
      loadData(); // Reload data
    } catch (error: any) {
      console.error('Failed to schedule interview:', error);
      toast.error(error?.response?.data?.error || 'Failed to schedule interview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Applications for {job.title}</h1>
          <p className="text-muted-foreground">{applications.length} total applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold">{applications.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-500">
              {getApplicationsByStatus('pending').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Reviewed</p>
            <p className="text-2xl font-bold text-blue-500">
              {getApplicationsByStatus('reviewed').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Shortlisted</p>
            <p className="text-2xl font-bold text-purple-500">
              {getApplicationsByStatus('shortlisted').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Interviews</p>
            <p className="text-2xl font-bold text-orange-500">
              {getApplicationsByStatus('interview_scheduled').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Accepted</p>
            <p className="text-2xl font-bold text-green-500">
              {getApplicationsByStatus('accepted').length}
            </p>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getApplicationsByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({getApplicationsByStatus('reviewed').length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({getApplicationsByStatus('shortlisted').length})</TabsTrigger>
            <TabsTrigger value="interview_scheduled">Interviews ({getApplicationsByStatus('interview_scheduled').length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({getApplicationsByStatus('accepted').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({getApplicationsByStatus('rejected').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ApplicationsList 
              applications={applications} 
              onStatusChange={handleStatusChange}
              onOpenStatusDialog={openStatusChangeDialog}
              onScheduleInterview={handleScheduleInterview}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('pending')} 
              onStatusChange={handleStatusChange}
              onOpenStatusDialog={openStatusChangeDialog}
              onScheduleInterview={handleScheduleInterview}
            />
          </TabsContent>

          <TabsContent value="reviewed" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('reviewed')} 
              onStatusChange={handleStatusChange}
              onOpenStatusDialog={openStatusChangeDialog}
              onScheduleInterview={handleScheduleInterview}
            />
          </TabsContent>

          <TabsContent value="shortlisted" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('shortlisted')} 
              onStatusChange={handleStatusChange}
              onOpenStatusDialog={openStatusChangeDialog}
              onScheduleInterview={handleScheduleInterview}
            />
          </TabsContent>

          <TabsContent value="interview_scheduled" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('interview_scheduled')} 
              onStatusChange={handleStatusChange}
              onOpenStatusDialog={openStatusChangeDialog}
              onScheduleInterview={handleScheduleInterview}
            />
          </TabsContent>

          <TabsContent value="accepted" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('accepted')} 
              onStatusChange={handleStatusChange}
              onOpenStatusDialog={openStatusChangeDialog}
              onScheduleInterview={handleScheduleInterview}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('rejected')} 
              onStatusChange={handleStatusChange}
              onOpenStatusDialog={openStatusChangeDialog}
              onScheduleInterview={handleScheduleInterview}
            />
          </TabsContent>
        </Tabs>

        {/* Status Change Confirmation Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Status Change</DialogTitle>
              <DialogDescription>
                Change application status for {selectedApplication?.teacherName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Change status from <strong>{selectedApplication?.status}</strong> to <strong>{statusChangeTarget}</strong>?
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowStatusDialog(false);
                    setStatusChangeTarget(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (selectedApplication && statusChangeTarget) {
                      handleStatusChange(selectedApplication._id || selectedApplication.id, statusChangeTarget);
                    }
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Interview Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isRescheduling ? 'Reschedule Interview' : 'Schedule Interview'}</DialogTitle>
              <DialogDescription>
                {isRescheduling ? 'Update interview details for' : 'Schedule an interview with'} {selectedApplication?.teacherName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={interviewData.date}
                    onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={interviewData.time}
                    onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={interviewData.duration}
                    onChange={(e) => setInterviewData({ ...interviewData, duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mode">Mode *</Label>
                  <Select 
                    value={interviewData.mode} 
                    onValueChange={(value: any) => setInterviewData({ ...interviewData, mode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {interviewData.mode === 'video' && (
                <div>
                  <Label htmlFor="meetingLink">Meeting Link *</Label>
                  <Input
                    id="meetingLink"
                    placeholder="https://meet.google.com/..."
                    value={interviewData.meetingLink}
                    onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                  />
                </div>
              )}

              {interviewData.mode === 'in-person' && (
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Institute address"
                    value={interviewData.location}
                    onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any additional information..."
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowScheduleDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={submitScheduleInterview}
                >
                  {isRescheduling ? 'Reschedule Interview' : 'Schedule Interview'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ApplicationsList({ 
  applications, 
  onStatusChange,
  onOpenStatusDialog,
  onScheduleInterview
}: any) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No applications in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application: any) => {
        const teacher = application.teacherId; // Already populated from API
        
        return (
          <Card key={application._id || application.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={teacher?.avatar} />
                    <AvatarFallback>{application.teacherName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{application.teacherName}</CardTitle>
                    <CardDescription className="mt-1">
                      Applied on {new Date(application.appliedDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={`${
                  application.status === 'accepted' ? 'bg-green-500' :
                  application.status === 'shortlisted' ? 'bg-purple-500' :
                  application.status === 'reviewed' ? 'bg-blue-500' :
                  application.status === 'rejected' ? 'bg-red-500' :
                  'bg-yellow-500'
                } text-white`}>
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teacher Info */}
              {teacher && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.experience || 0} years exp</span>
                  </div>
                </div>
              )}

              {/* Qualifications & Subjects */}
              {teacher && (teacher.qualifications?.length > 0 || teacher.subjects?.length > 0) && (
                <div className="space-y-2">
                  {teacher.qualifications?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex flex-wrap gap-1">
                        {teacher.qualifications.map((qual: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {teacher.subjects?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subj: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {subj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cover Letter */}
              <div className="p-3 bg-muted rounded text-sm">
                <p className="font-semibold mb-1">Cover Letter:</p>
                <p>{application.coverLetter}</p>
              </div>

              {/* Interview Info */}
              {application.interviewScheduled && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Interview Scheduled
                  </p>
                  <div className="space-y-1">
                    <p>{new Date(application.interviewScheduled.scheduledDate).toLocaleDateString()} at {application.interviewScheduled.scheduledTime}</p>
                    <p className="flex items-center gap-2">
                      {application.interviewScheduled.mode === 'video' && <Video className="h-3 w-3" />}
                      {application.interviewScheduled.mode === 'phone' && <Phone className="h-3 w-3" />}
                      {application.interviewScheduled.mode === 'in-person' && <MapPinned className="h-3 w-3" />}
                      {application.interviewScheduled.mode}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions - Show relevant actions based on current status */}
              <div className="space-y-4">
                {/* Quick action buttons with smart logic */}
                <div className="flex gap-2 flex-wrap">
                  {/* Primary workflow buttons */}
                  {application.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenStatusDialog(application, 'reviewed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Reviewed
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onOpenStatusDialog(application, 'shortlisted')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Shortlist
                      </Button>
                    </>
                  )}
                  
                  {application.status === 'reviewed' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onOpenStatusDialog(application, 'shortlisted')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenStatusDialog(application, 'pending')}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Back to Pending
                      </Button>
                    </>
                  )}
                  
                  {application.status === 'shortlisted' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onScheduleInterview(application)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenStatusDialog(application, 'reviewed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Move to Reviewed
                      </Button>
                    </>
                  )}
                  
                  {application.status === 'interview_scheduled' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onScheduleInterview(application, true)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule Interview
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onOpenStatusDialog(application, 'accepted')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                    </>
                  )}
                  
                  {application.status === 'accepted' && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-semibold">Candidate Accepted</span>
                    </div>
                  )}
                  
                  {application.status === 'rejected' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenStatusDialog(application, 'pending')}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Reconsider
                      </Button>
                      <div className="flex items-center gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-semibold">Rejected</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Universal action buttons */}
                <div className="flex gap-2 flex-wrap border-t pt-3">
                  {/* Accept button - always available except when already accepted */}
                  {application.status !== 'accepted' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => onOpenStatusDialog(application, 'accepted')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Candidate
                    </Button>
                  )}
                  
                  {/* Reject button - always available except when already rejected */}
                  {application.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onOpenStatusDialog(application, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}