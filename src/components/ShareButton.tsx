import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
  variant?: 'outline' | 'default' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'icon';
}

export function ShareButton({ title, text, url, className, variant = 'outline', size = 'sm' }: ShareButtonProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Absolute URL
    const shareUrl = window.location.origin + url;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleShare}
      title="Share"
    >
      <Share2 className={size === 'icon' ? 'w-4 h-4' : 'w-3.5 h-3.5 mr-1.5'} />
      {size !== 'icon' && 'Share'}
    </Button>
  );
}
