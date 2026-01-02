import React, { createContext, useContext, useState } from 'react';
import { Ad, AdStatus, AdPlacement, AdRequest } from '../types/adTypes';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface AdContextType {
  ads: Ad[];
  adRequests: AdRequest[];
  addAd: (ad: Omit<Ad, 'id' | 'createdAt' | 'impressions' | 'clicks'>) => void;
  updateAd: (id: string, updates: Partial<Ad>) => void;
  deleteAd: (id: string) => void;
  getAdsByPlacement: (placement: AdPlacement) => Ad[];
  recordImpression: (id: string) => void;
  recordClick: (id: string) => void;
  submitAdRequest: (request: Omit<AdRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateAdRequestStatus: (id: string, status: AdRequest['status']) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [adRequests, setAdRequests] = useState<AdRequest[]>([]);

  const addAd = (newAd: Omit<Ad, 'id' | 'createdAt' | 'impressions' | 'clicks'>) => {
    if (user?.role !== 'admin') {
      toast.error("Unauthorized: Only admins can create ads");
      return;
    }

    const ad: Ad = {
      ...newAd,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      impressions: 0,
      clicks: 0,
      budget: newAd.budget || 0,
      pricingModel: newAd.pricingModel || 'fixed',
      currency: newAd.currency || 'USD',
    };
    setAds([...ads, ad]);
  };

  const updateAd = (id: string, updates: Partial<Ad>) => {
    if (user?.role !== 'admin') {
      toast.error("Unauthorized: Only admins can update ads");
      return;
    }
    setAds(ads.map(ad => ad.id === id ? { ...ad, ...updates } : ad));
  };

  const deleteAd = (id: string) => {
    if (user?.role !== 'admin') {
      toast.error("Unauthorized: Only admins can delete ads");
      return;
    }
    setAds(ads.filter(ad => ad.id !== id));
  };

  const getAdsByPlacement = (placement: AdPlacement) => {
    return ads
      .filter(ad => ad.placement === placement && ad.status === 'active')
      .sort((a, b) => b.priority - a.priority);
  };

  const recordImpression = (id: string) => {
    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, impressions: ad.impressions + 1 } : ad
    ));
  };

  const recordClick = (id: string) => {
    setAds(prev => prev.map(ad => 
      ad.id === id ? { ...ad, clicks: ad.clicks + 1 } : ad
    ));
  };

  const submitAdRequest = (request: Omit<AdRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: AdRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setAdRequests([newRequest, ...adRequests]);
  };

  const updateAdRequestStatus = (id: string, status: AdRequest['status']) => {
    if (user?.role !== 'admin') {
      toast.error("Unauthorized: Only admins can update request status");
      return;
    }
    setAdRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  };

  return (
    <AdContext.Provider value={{ 
      ads, 
      adRequests,
      addAd, 
      updateAd, 
      deleteAd, 
      getAdsByPlacement, 
      recordImpression, 
      recordClick,
      submitAdRequest,
      updateAdRequestStatus
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};
