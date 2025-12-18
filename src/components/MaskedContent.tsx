import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MaskedContentProps {
  variant?: 'text' | 'image' | 'button' | 'block';
  label?: string; // e.g. "Login to view"
  className?: string;
  children?: React.ReactNode; // The content to mask (optional, might not be available)
  onClick?: () => void;
}

export function MaskedContent({ 
  variant = 'text', 
  label = 'Login to view', 
  className,
  children,
  onClick
}: MaskedContentProps) {
  const navigate = useNavigate();

  const handleLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      navigate('/login');
    }
  };

  if (variant === 'image') {
    return (
      <div 
        className={cn("relative overflow-hidden cursor-pointer group", className)} 
        onClick={handleLogin}
      >
        {children && <div className="blur-md select-none pointer-events-none">{children}</div>}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
            <Lock className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className={cn("gap-2 border-dashed border-primary/50 text-muted-foreground hover:text-primary hover:border-primary", className)}
        onClick={handleLogin}
      >
        <Lock className="w-3.5 h-3.5" />
        {label}
      </Button>
    );
  }

  if (variant === 'block') {
    return (
      <div 
        className={cn("rounded-lg border border-dashed border-border p-4 bg-muted/30 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors", className)}
        onClick={handleLogin}
      >
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">Click to login</p>
      </div>
    );
  }

  // Default: text
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={cn("inline-flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-primary transition-colors select-none", className)}
            onClick={handleLogin}
          >
            <Lock className="w-3 h-3" />
            <span className="blur-[2px]">Hidden Content</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
