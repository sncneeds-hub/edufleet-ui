import { Job } from '@/api/services/jobService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Building2, Clock, DollarSign, Share2 } from 'lucide-react';
import { MaskedContent } from '@/components/MaskedContent';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ShareButton';

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
      className={`cursor-pointer relative group flex-shrink-0 w-full h-full ${className || ''}`}
      style={style}
    >
      <Card className="overflow-hidden border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl w-full h-full flex flex-col p-0 bg-card group-hover:border-primary/20">
        {/* Top: Icon/Logo Section (Hero) */}
        <div className="relative overflow-hidden bg-muted aspect-[4/3] flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors duration-500">
          <Briefcase className="w-16 h-16 text-primary/40 group-hover:text-primary/60 transition-colors duration-500 group-hover:scale-110 transform" />
          
          {job.isPriority && (
            <div className="absolute top-1 left-1 z-10 scale-75 origin-top-left pointer-events-none">
              <PriorityBadge />
            </div>
          )}

          <div className="absolute bottom-2 right-2 flex gap-1">
             <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/50">
               {job.type}
             </Badge>
          </div>

          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShareButton
              title={job.title}
              text={`Check out this ${job.title} position at ${job.instituteName} on EduFleet Exchange!`}
              url={`/job/${job.id || (job as any)._id}`}
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-none shadow-sm hover:bg-background"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow justify-between gap-3">
          <div className="min-h-0 space-y-2">
            <div>
              {!isUnmasked && !isListing ? (
                <MaskedContent variant="text" label="Login to view" className="mb-1">
                  <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground mb-1 group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                </MaskedContent>
              ) : (
                <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground mb-1 group-hover:text-primary transition-colors" title={job.title}>
                  {job.title}
                </h3>
              )}
              
              <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{job.instituteName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatLocation(job.location)}</span>
                </div>
              </div>
            </div>

            {/* Description/Requirements Preview */}
            <div className="flex flex-wrap gap-1.5">
              {job.requirements.slice(0, 2).map((req, idx) => (
                <span key={idx} className="text-[10px] bg-secondary/50 text-secondary-foreground px-1.5 py-0.5 rounded truncate max-w-[100px]">
                  {req}
                </span>
              ))}
              {job.requirements.length > 2 && (
                <span className="text-[10px] text-muted-foreground px-1 py-0.5">
                  +{job.requirements.length - 2}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
             <div className="min-w-0 flex items-center gap-1 text-sm font-semibold text-primary">
              <DollarSign className="w-4 h-4" />
              {isUnmasked || isListing ? (
                <span className="truncate">
                  {(() => {
                    const salary = formatSalary(job.salary);
                    return `${(salary.min / 1000).toFixed(0)}k - ${(salary.max / 1000).toFixed(0)}k`;
                  })()}
                  <span className="text-muted-foreground font-normal text-xs ml-1">/yr</span>
                </span>
              ) : (
                <MaskedContent variant="text" label="Login" className="w-20 h-5" />
              )}
            </div>
            
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button 
              size="sm" 
              variant="outline"
              className="w-full text-xs h-8 border-primary text-primary hover:bg-primary hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              View Details
            </Button>
            <Button 
              size="sm" 
              className="w-full text-xs h-8 bg-accent hover:bg-accent/90 text-white border-none shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}