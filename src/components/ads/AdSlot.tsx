import React, { useEffect, useRef, useState } from 'react';
import { useAds } from '../../context/AdContext';
import { AdPlacement } from '../../types/adTypes';
import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
  variant?: 'banner' | 'card' | 'sidebar';
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className, variant = 'card' }) => {
  const { getAdsByPlacement, recordImpression, recordClick } = useAds();
  const [currentAd, setCurrentAd] = useState<ReturnType<typeof getAdsByPlacement>[0] | null>(null);
  const [loading, setLoading] = useState(true);
  const adRef = useRef<HTMLDivElement>(null);
  const hasRecordedImpression = useRef(false);

  useEffect(() => {
    // Simulate lazy loading delay
    const timer = setTimeout(() => {
      const ads = getAdsByPlacement(placement);
      if (ads.length > 0) {
        // Simple rotation or priority pick
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        setCurrentAd(randomAd);
      }
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
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

  if (loading) {
    return (
      <div className={cn("w-full overflow-hidden rounded-lg", className)}>
         <Skeleton className={cn("w-full", variant === 'banner' ? 'h-32' : 'h-64')} />
      </div>
    );
  }

  if (!currentAd) {
    // Optional: Render nothing or a placeholder if no ad
    return null;
  }

  return (
    <div 
      ref={adRef}
      className={cn(
        "relative w-full overflow-hidden rounded-lg group cursor-pointer transition-all hover:shadow-md border border-border/50",
        className
      )}
      onClick={handleClick}
    >
      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/50 text-[10px] text-white rounded uppercase tracking-wider z-10">
        Ad
      </div>
      
      {currentAd.type === 'image' && (
        <img 
          src={currentAd.mediaUrl} 
          alt={currentAd.title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
        />
      )}

      {currentAd.type === 'video' && (
        <video 
          src={currentAd.mediaUrl} 
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
