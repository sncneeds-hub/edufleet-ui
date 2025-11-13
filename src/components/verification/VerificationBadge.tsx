import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface VerificationBadgeProps {
  isVerified?: boolean;
  verificationExpiresAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function VerificationBadge({
  isVerified = false,
  verificationExpiresAt,
  size = 'md',
  showTooltip = true,
}: VerificationBadgeProps) {
  // Check if verification is expired
  const now = new Date();
  const expiresAt = verificationExpiresAt ? new Date(verificationExpiresAt) : null;
  const isExpired = expiresAt && expiresAt < now;
  const isExpiringSoon = expiresAt && expiresAt > now && expiresAt.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days

  // Determine badge variant and icon
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  let icon = <Shield className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />;
  let text = 'Not Verified';
  let tooltipText = 'This institute is not verified';

  if (isVerified && !isExpired) {
    if (isExpiringSoon) {
      variant = 'secondary';
      icon = <Clock className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />;
      text = 'Expiring Soon';
      tooltipText = `Verification expires on ${expiresAt ? format(expiresAt, 'MMM dd, yyyy') : 'unknown date'}`;
    } else {
      variant = 'default';
      icon = <ShieldCheck className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />;
      text = 'Verified';
      tooltipText = expiresAt
        ? `Verified institute. Valid until ${format(expiresAt, 'MMM dd, yyyy')}`
        : 'Verified institute';
    }
  } else if (isExpired) {
    variant = 'destructive';
    icon = <ShieldAlert className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />;
    text = 'Expired';
    tooltipText = 'Verification has expired. Please renew.';
  }

  const badgeContent = (
    <Badge variant={variant} className={`flex items-center gap-1 ${size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-3 py-1.5' : 'text-sm px-2.5 py-1'}`}>
      {icon}
      <span>{text}</span>
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
