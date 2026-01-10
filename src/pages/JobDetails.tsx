import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useJobById } from '@/hooks/useApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Clock, 
  Building, 
  Mail, 
  Phone, 
  Lock,
  ArrowLeft,
  CheckCircle,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { AdSlot } from '@/components/ads/AdSlot';
import { MaskedContent } from '@/components/MaskedContent';
import { jobService } from '@/api/services/jobService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const formatLocation = (location: any): string => {
  if (!location) return 'Location not specified';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }
  return String(location);
};

const formatExperience = (experience: any): string => {
  if (!experience && experience !== 0) return 'Experience not specified';
  if (typeof experience === 'string') return experience;
  if (typeof experience === 'object') {
    const min = experience.min;
    const max = experience.max;
    if (min !== undefined && max !== undefined) {
      if (min === max) return `${min} years`;
      return `${min}-${max} years`;
    }
    return 'Experience not specified';
  }
  return String(experience);
};

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { job, loading } = useJobById(id || '');
  
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || user.role !== 'teacher' || !id) return;
      try {
        const response = await jobService.getMyApplications();
        const applied = response.some((app: any) => app.jobId === id || (app.jobId && app.jobId._id === id));
        setHasApplied(applied);
      } catch (error) {
        console.error('Failed to check application status', error);
      }
    };
    
    checkApplicationStatus();
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="w-32 h-8 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full h-40" />
              <Skeleton className="w-full h-40" />
              <Skeleton className="w-full h-40" />
            </div>
            <Skeleton className="w-full h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
        </div>
      </div>
    );
  }

  const isUnmasked = !!user;

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'teacher') {
      toast.error('Only teachers can apply for jobs. Please login as a teacher.');
      return;
    }
    if (hasApplied) {
      toast.info('You have already applied to this job');
      return;
    }
    setShowApplyDialog(true);
  };

  const submitApplication = async () => {
    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    setSubmitting(true);
    try {
      await jobService.applyToJob(id!, {
        coverLetter,
        applicantName: user?.name || '',
        applicantEmail: user?.email || '',
        status: 'pending',
        appliedAt: new Date().toISOString(),
        jobId: id!,
        applicantId: user?.id || ''
      });
      
      toast.success('Application submitted successfully!');
      setShowApplyDialog(false);
      setCoverLetter('');
      setHasApplied(true);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/teacher/dashboard');
      }, 1500);
    } catch (error: any) {
      toast.error(error.error || 'Failed to submit application');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    {job.isPriority && <PriorityBadge />}
                  </div>
                  <p className="text-muted-foreground mb-4">{job.instituteName}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{formatLocation(job.location)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{job.type ? job.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Full Time'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatExperience(job.experience)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Salary Range</span>
                </div>
                {isUnmasked ? (
                  <div className="text-2xl font-bold text-primary">
                    {job.salary.currency}{(job.salary.min / 1000).toFixed(0)}k - {job.salary.currency}{(job.salary.max / 1000).toFixed(0)}k
                    <span className="text-sm font-normal text-muted-foreground ml-2">/month</span>
                  </div>
                ) : (
                  <MaskedContent 
                    variant="text" 
                    label="Login to view salary" 
                    className="text-2xl font-bold text-primary"
                  >
                    {job.salary.currency}{(job.salary.min / 1000).toFixed(0)}k - {job.salary.currency}{(job.salary.max / 1000).toFixed(0)}k
                  </MaskedContent>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements?.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Responsibilities */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities?.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{resp}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Right Column - Apply Card */}
          <div>
            {/* Sidebar Ad */}
            <div className="mb-6">
              <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
            </div>

            <Card className="p-6 sticky top-20">
              <h3 className="font-semibold mb-4">Apply for this position</h3>
              
              {!isUnmasked && (
                <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg mb-4 text-sm">
                  <Lock className="w-4 h-4 text-yellow-700 inline mr-2" />
                  <span className="text-yellow-700">Login to view full details and apply</span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{job.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                {isUnmasked && job.applicants !== undefined && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Applicants</p>
                      <p className="font-medium">{job.applicants} applied</p>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                className="w-full mb-4" 
                size="lg"
                onClick={handleApply}
                disabled={hasApplied}
              >
                {user ? (hasApplied ? 'Already Applied' : 'Apply Now') : 'Login to Apply'}
              </Button>

              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-medium text-sm">Contact Information</h4>
                {isUnmasked ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${job.instituteEmail}`} className="hover:text-primary">
                        {job.instituteEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${job.institutePhone}`} className="hover:text-primary">
                        {job.institutePhone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <MaskedContent variant="block" label="Login to view contact info" />
                )}
              </div>
            </Card>
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
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={submitApplication}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
