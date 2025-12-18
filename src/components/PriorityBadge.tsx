import { Star } from 'lucide-react';

interface PriorityBadgeProps {
  className?: string;
}

export function PriorityBadge({ className = '' }: PriorityBadgeProps) {
  return (
    <div className={`priority-badge flex items-center gap-1 ${className}`}>
      <Star className="w-3 h-3 fill-current" />
      <span>Priority Listing</span>
    </div>
  );
}
