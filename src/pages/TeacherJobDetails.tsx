import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { mockJobs } from '@/mock/jobData';
import { mockApplications } from '@/mock/teacherData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  Mail,
  Phone,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdSlot } from '@/components/ads/AdSlot';

export function TeacherJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const job = mockJobs.find((j) => j.id === id);

  // Check if user has already applied
  const hasApplied = mockApplications.some(
    app => app.jobId === id && app.teacherId === user?.id
  );

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist.</p>
          <Link to="/teacher/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    if (!isAuthenticated || user?.role !== 'teacher') {
      toast.error('Please login as a teacher to apply');
      navigate('/login');
      return;
    }

    if (hasApplied) {
      toast.info('You have already applied to this job');
      return;
    }

    setShowApplyDialog(true);
  };

  const submitApplication = () => {
    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    // Mock application submission
    toast.success('Application submitted successfully!');
    setShowApplyDialog(false);
    setCoverLetter('');
    
    // Navigate to dashboard after a short delay
    setTimeout(() => {
      navigate('/teacher/dashboard');
    }, 1500);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-500';
      case 'part-time': return 'bg-blue-500';
      case 'contract': return 'bg-purple-500';
      case 'internship': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">{job.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">{job.instituteName}</span>
                    </div>
                  </div>
                  {job.isPriority && (
                    <Badge className="bg-amber-500 text-white">Priority</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <Badge className={`${getTypeColor(job.type)} text-white`}>
                      {job.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()}/month
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{job.experience} experience</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Badge variant="outline">{job.department}</Badge>
                  <Badge variant="outline">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Job</CardTitle>
                <CardDescription>
                  {hasApplied 
                    ? 'You have already applied to this job'
                    : 'Submit your application now'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applicants:</span>
                      <span className="font-semibold">{job.applicants || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posted:</span>
                      <span className="font-semibold">
                        {new Date(job.postedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-semibold text-red-500">
                        {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleApply}
                    disabled={hasApplied}
                  >
                    {hasApplied ? 'Already Applied' : 'Apply Now'}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-muted-foreground text-center">
                      You need to be logged in as a teacher to apply
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Institute Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Email</p>
                    <a 
                      href={`mailto:${job.instituteEmail}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {job.instituteEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Phone</p>
                    <a 
                      href={`tel:${job.institutePhone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {job.institutePhone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Ad */}
            <div className="mt-6">
              <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
            </div>
          </div>
        </div>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply for {job.title}</DialogTitle>
              <DialogDescription>
                Submit your application to {job.instituteName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're a great fit for this position..."
                  rows={8}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Your profile information will be automatically included:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Name: {user?.name}</li>
                  <li>Email: {user?.email}</li>
                  <li>Phone: {user?.phone}</li>
                  <li>Qualifications: {user?.qualifications?.join(', ')}</li>
                  <li>Experience: {user?.experience} years</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowApplyDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={submitApplication}
                >
                  Submit Application
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
