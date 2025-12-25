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

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { job, loading } = useJobById(id || '');

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
    toast.success('Application submitted!');
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
                  <p className="text-muted mb-4">{job.instituteName}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted" />
                      <span>{job.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted" />
                      <span>{job.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted" />
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
                    <span className="text-sm font-normal text-muted ml-2">/month</span>
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
              <p className="text-muted leading-relaxed">{job.description}</p>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted">{req}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Responsibilities */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-muted">{resp}</span>
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
                      <span className="text-muted">{benefit}</span>
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
                  <Building className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-sm text-muted">Department</p>
                    <p className="font-medium">{job.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-sm text-muted">Deadline</p>
                    <p className="font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                {isUnmasked && job.applicants !== undefined && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted" />
                    <div>
                      <p className="text-sm text-muted">Applicants</p>
                      <p className="font-medium">{job.applicants} applied</p>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                className="w-full mb-4" 
                size="lg"
                onClick={handleApply}
              >
                {user ? 'Apply Now' : 'Login to Apply'}
              </Button>

              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-medium text-sm">Contact Information</h4>
                {isUnmasked ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${job.instituteEmail}`} className="hover:text-primary">
                        {job.instituteEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
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
    </div>
  );
}
