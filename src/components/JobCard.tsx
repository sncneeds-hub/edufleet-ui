import { Job } from '@/api/services/jobService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Building2, Clock, DollarSign } from 'lucide-react';
import { MaskedContent } from '@/components/MaskedContent';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ShareButton';

// Helper function to safely format dates
const formatDate = (dateValue: string | undefined | null): string => {
  if (!dateValue) return 'Not specified';
  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Not specified';
    return date.toLocaleDateString();
  } catch {
    return 'Not specified';
  }
};

// Helper function to format location
const formatLocation = (location: any): string => {
  if (!location) return 'Location not specified';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }
  return String(location);
};

// Helper function to format salary
const formatSalary = (salary: any): { min: number; max: number } => {
  if (!salary) return { min: 0, max: 0 };
  if (typeof salary === 'object' && salary !== null) {
    return { 
      min: salary.min || salary.salaryMin || 0, 
      max: salary.max || salary.salaryMax || 0 
    };
  }
  // Handle string salary like "50000-70000"
  if (typeof salary === 'string') {
    const parts = salary.split('-').map(s => parseInt(s.replace(/[^0-9]/g, '')) || 0);
    return { min: parts[0] || 0, max: parts[1] || parts[0] || 0 };
  }
  return { min: 0, max: 0 };
};

// Helper function to format experience
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

interface JobCardProps {
  job: Job;
  isListing?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function JobCard({ job, isListing = false, className, style }: JobCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isUnmasked = !!user;

  const handleClick = () => {
    navigate(`/job/${job.id || (job as any)._id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer relative group flex-shrink-0 w-[192px] h-[192px] ${className || ''}`}
      style={style}
    >
      <Card className="overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg w-full h-full flex flex-col p-2 bg-card group-hover:border-primary/40 border-beam">
        {/* Compact Header */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="bg-primary/10 p-1.5 rounded-md">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col items-end">
            <Badge variant="secondary" className="text-[8px] h-4 px-1 leading-none">
              {job.type}
            </Badge>
            {job.isPriority && (
              <div className="mt-0.5 scale-50 origin-top-right">
                <PriorityBadge />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow min-h-0">
          {!isUnmasked && !isListing ? (
            <MaskedContent variant="text" label="Login" className="h-4 w-full mb-0.5">
              <h3 className="font-bold text-[13px] leading-tight line-clamp-2 text-foreground mb-0.5 group-hover:text-primary transition-colors">
                {job.title}
              </h3>
            </MaskedContent>
          ) : (
            <h3 className="font-bold text-[13px] leading-tight line-clamp-2 text-foreground mb-0.5 group-hover:text-primary transition-colors" title={job.title}>
              {job.title}
            </h3>
          )}
          
          <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{job.instituteName}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{formatLocation(job.location)}</span>
            </div>
          </div>

          <div className="mt-auto pt-1.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 text-[11px] font-bold text-primary">
                <DollarSign className="w-3 h-3" />
                {isUnmasked || isListing ? (
                  <span className="truncate">
                    {(() => {
                      const salary = formatSalary(job.salary);
                      return `${(salary.min / 1000).toFixed(0)}k-${(salary.max / 1000).toFixed(0)}k`;
                    })()}
                  </span>
                ) : (
                  <MaskedContent variant="text" label="Login" className="w-10 h-3" />
                )}
              </div>
              <div className="text-[8px] text-muted-foreground">
                {formatDate(job.postedAt || job.postedDate || job.createdAt)}
              </div>
            </div>
            
            <Button 
              size="sm" 
              className="w-full text-[10px] h-6 bg-primary hover:bg-primary/90 text-white border-none shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              View & Apply
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}