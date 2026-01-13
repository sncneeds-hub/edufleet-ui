import React, { useEffect, useRef, useState } from 'react';
import { useAds } from '../../context/AdContext';
import { AdPlacement, Ad } from '../../types/adTypes';
import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
  variant?: 'banner' | 'card' | 'sidebar';
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className, variant = 'card' }) => {
  const { getAdsByPlacement, recordImpression, recordClick } = useAds();
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const adRef = useRef<HTMLDivElement>(null);
  const hasRecordedImpression = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAd = async () => {
      try {
        setLoading(true);
        const ads = await getAdsByPlacement(placement);
        
        if (isMounted) {
          if (ads && ads.length > 0) {
            // Simple rotation or priority pick
            const randomAd = ads[Math.floor(Math.random() * ads.length)];
            setCurrentAd(randomAd);
          } else {
            setCurrentAd(null);
          }
        }
      } catch (error) {
        console.error(`Error fetching ads for slot ${placement}:`, error);
        if (isMounted) setCurrentAd(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAd();

    return () => {
      isMounted = false;
    };
  }, [placement, getAdsByPlacement]);

  useEffect(() => {
    if (!currentAd || hasRecordedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          recordImpression(currentAd.id);
          hasRecordedImpression.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [currentAd, recordImpression]);

  const handleClick = () => {
    if (currentAd) {
      recordClick(currentAd.id);
      window.open(currentAd.targetUrl, '_blank');
    }
  };

  const getMediaUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/800x400?text=No+Image';
    if (url.startsWith('http')) return url;
    
    // Prefix with backend base URL if it's a relative path
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) {
    return (
      <div className={cn("w-full overflow-hidden rounded-lg", className)}>
         <Skeleton className={cn("w-full", variant === 'banner' ? 'h-32' : 'h-64')} />
      </div>
    );
  }

  if (!currentAd) {
    return null;
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'banner':
        return 'aspect-[4/1] md:aspect-[8/1] min-h-[80px]';
      case 'sidebar':
        return 'aspect-[1/1] min-h-[250px]';
      case 'card':
      default:
        return 'aspect-[16/9] min-h-[180px]';
    }
  };

  return (
    <div 
      ref={adRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl group cursor-pointer transition-all hover:shadow-xl border border-border/50 bg-muted/30",
        getVariantStyles(),
        className
      )}
      onClick={handleClick}
    >
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/50 text-[10px] text-white rounded uppercase tracking-wider z-10">
        Ad
      </div>
      
      {currentAd.type === 'image' && (
        <img 
          src={getMediaUrl(currentAd.mediaUrl)} 
          alt={currentAd.title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
        />
      )}

      {currentAd.type === 'video' && (
        <video 
          src={getMediaUrl(currentAd.mediaUrl)} 
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          loop 
          playsInline
        />
      )}

      {currentAd.type === 'html' && currentAd.htmlContent && (
        <div 
          dangerouslySetInnerHTML={{ __html: currentAd.htmlContent }} 
          className="w-full h-full bg-background"
        />
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
    </div>
  );
};
