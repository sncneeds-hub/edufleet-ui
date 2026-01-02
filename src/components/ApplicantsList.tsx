import { useState, useEffect } from 'react';
import { api } from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Video,
  MapPinned,
  Filter,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function ApplicantsList() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
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
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch all applications
      const appsResponse = await api.jobs.getApplications({});
      setApplications(appsResponse.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await api.jobs.updateApplicationStatus(applicationId, { status: newStatus });
      toast.success(`Application ${newStatus} successfully`);
      loadData(); // Reload data
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleScheduleInterview = (application: any) => {
    setSelectedApplication(application);
    setShowScheduleDialog(true);
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setShowDetailsDialog(true);
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

    try {
      await api.jobs.updateApplicationStatus(selectedApplication.id || selectedApplication._id, {
        interviewScheduled: {
          scheduledDate: interviewData.date,
          scheduledTime: interviewData.time,
          duration: interviewData.duration,
          mode: interviewData.mode,
          location: interviewData.location,
          meetingLink: interviewData.meetingLink,
          notes: interviewData.notes,
        }
      });

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
      loadData(); // Reload data
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Job Applications</h2>
          <p className="text-muted-foreground">Manage all applications across your job postings</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => {
                  const teacher = application.teacherId || {};
                  const jobTitle = application.jobTitle || 'Job Position'; 
                  
                  return (
                    <TableRow key={application._id || application.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={teacher.avatar} />
                            <AvatarFallback>{application.teacherName?.charAt(0) || 'T'}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{application.teacherName}</span>
                            <span className="text-xs text-muted-foreground">{teacher.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{jobTitle}</TableCell>
                      <TableCell>
                        {teacher.experience ? `${teacher.experience} years` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          application.status === 'accepted' ? 'bg-green-500' :
                          application.status === 'shortlisted' ? 'bg-purple-500' :
                          application.status === 'reviewed' ? 'bg-blue-500' :
                          application.status === 'rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        } text-white hover:text-white`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(application)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleScheduleInterview(application)}>
                              <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(application._id || application.id, 'shortlisted')}>
                              Shortlist
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(application._id || application.id, 'rejected')}>
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(application._id || application.id, 'accepted')}>
                              Accept
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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

      {/* Application Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication?.teacherName} - {selectedApplication?.jobTitle}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedApplication.teacherId?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedApplication.teacherId?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedApplication.teacherId?.location || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedApplication.teacherId?.experience || 0} years exp</span>
                </div>
              </div>

              {selectedApplication.teacherId?.qualifications?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" /> Qualifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.teacherId.qualifications.map((qual: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{qual}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.teacherId?.subjects?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.teacherId.subjects.map((subj: string, idx: number) => (
                      <Badge key={idx} variant="outline">{subj}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.coverLetter && (
                <div className="p-4 bg-muted rounded-lg text-sm">
                  <h4 className="font-medium mb-2">Cover Letter</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              )}

              {selectedApplication.interviewScheduled && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm border border-blue-100 dark:border-blue-900">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Calendar className="h-4 w-4" />
                    Interview Scheduled
                  </h4>
                  <div className="space-y-1 text-blue-900 dark:text-blue-100">
                    <p>{new Date(selectedApplication.interviewScheduled.scheduledDate).toLocaleDateString()} at {selectedApplication.interviewScheduled.scheduledTime} ({selectedApplication.interviewScheduled.duration} min)</p>
                    <p className="flex items-center gap-2 capitalize">
                      {selectedApplication.interviewScheduled.mode === 'video' && <Video className="h-3 w-3" />}
                      {selectedApplication.interviewScheduled.mode} Interview
                    </p>
                    {selectedApplication.interviewScheduled.meetingLink && (
                      <p className="truncate">Link: {selectedApplication.interviewScheduled.meetingLink}</p>
                    )}
                    {selectedApplication.interviewScheduled.location && (
                      <p>Location: {selectedApplication.interviewScheduled.location}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
