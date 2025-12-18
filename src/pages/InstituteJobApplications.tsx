import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { mockJobs } from '@/mock/jobData';
import { getJobApplications, mockTeachers } from '@/mock/teacherData';
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
} from 'lucide-react';
import { toast } from 'sonner';

export function InstituteJobApplications() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    duration: '60',
    mode: 'video' as 'video' | 'phone' | 'in-person',
    location: '',
    meetingLink: '',
    notes: '',
  });

  const job = mockJobs.find(j => j.id === jobId);
  const applications = jobId ? getJobApplications(jobId) : [];

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    toast.success(`Application ${newStatus} successfully`);
    // Mock status update
  };

  const handleScheduleInterview = (application: any) => {
    setSelectedApplication(application);
    setShowScheduleDialog(true);
  };

  const submitScheduleInterview = () => {
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

    toast.success('Interview scheduled successfully!');
    setShowScheduleDialog(false);
    setInterviewData({
      date: '',
      time: '',
      duration: '60',
      mode: 'video',
      location: '',
      meetingLink: '',
      notes: '',
    });
  };

  const getTeacherDetails = (teacherId: string) => {
    return mockTeachers.find(t => t.id === teacherId);
  };

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
            <p className="text-sm text-muted-foreground mb-1">Accepted</p>
            <p className="text-2xl font-bold text-green-500">
              {getApplicationsByStatus('accepted').length}
            </p>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getApplicationsByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({getApplicationsByStatus('reviewed').length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({getApplicationsByStatus('shortlisted').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ApplicationsList 
              applications={applications} 
              onStatusChange={handleStatusChange}
              onScheduleInterview={handleScheduleInterview}
              getTeacherDetails={getTeacherDetails}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('pending')} 
              onStatusChange={handleStatusChange}
              onScheduleInterview={handleScheduleInterview}
              getTeacherDetails={getTeacherDetails}
            />
          </TabsContent>

          <TabsContent value="reviewed" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('reviewed')} 
              onStatusChange={handleStatusChange}
              onScheduleInterview={handleScheduleInterview}
              getTeacherDetails={getTeacherDetails}
            />
          </TabsContent>

          <TabsContent value="shortlisted" className="mt-6">
            <ApplicationsList 
              applications={getApplicationsByStatus('shortlisted')} 
              onStatusChange={handleStatusChange}
              onScheduleInterview={handleScheduleInterview}
              getTeacherDetails={getTeacherDetails}
            />
          </TabsContent>
        </Tabs>

        {/* Schedule Interview Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Schedule an interview with {selectedApplication?.teacherName}
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
                  Schedule Interview
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
  onScheduleInterview,
  getTeacherDetails 
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
        const teacher = getTeacherDetails(application.teacherId);
        
        return (
          <Card key={application.id}>
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
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.experience} years exp</span>
                  </div>
                </div>
              )}

              {/* Qualifications & Subjects */}
              {teacher && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex flex-wrap gap-1">
                      {teacher.qualifications.map((qual: string) => (
                        <Badge key={qual} variant="secondary" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subj: string) => (
                        <Badge key={subj} variant="outline" className="text-xs">
                          {subj}
                        </Badge>
                      ))}
                    </div>
                  </div>
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

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(application.id, 'reviewed')}
                  disabled={application.status === 'reviewed'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Reviewed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(application.id, 'shortlisted')}
                  disabled={application.status === 'shortlisted'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  onClick={() => onScheduleInterview(application)}
                  disabled={!!application.interviewScheduled}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {application.interviewScheduled ? 'Interview Scheduled' : 'Schedule Interview'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStatusChange(application.id, 'rejected')}
                  disabled={application.status === 'rejected'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
