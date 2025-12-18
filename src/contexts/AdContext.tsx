import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ad, AdStatus, AdPlacement, AdRequest } from '../types/adTypes';

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

// Mock initial data
const MOCK_AD_REQUESTS: AdRequest[] = [
  {
    id: 'req_1',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'EduTech Inc',
    phone: '555-0123',
    adType: 'Banner Ads on Landing Page',
    message: 'Interested in a monthly subscription for the top banner.',
    status: 'pending',
    createdAt: '2024-05-15T10:30:00Z'
  },
  {
    id: 'req_2',
    name: 'Jane Smith',
    email: 'jane@booksellers.com',
    company: 'BookSellers',
    phone: '555-0456',
    adType: 'Sidebar Ads on Browse Pages',
    message: 'We want to promote our new textbook collection.',
    status: 'contacted',
    createdAt: '2024-05-14T09:15:00Z'
  }
];

const MOCK_ADS: Ad[] = [
  {
    id: '1',
    title: 'Summer Sale Banner',
    advertiser: 'EduSupplies Co.',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=200&fit=crop',
    targetUrl: 'https://example.com',
    placement: 'LP_TOP_BANNER',
    priority: 10,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    createdAt: '2023-12-01',
    impressions: 12500,
    clicks: 450,
  },
  {
    id: '2',
    title: 'School Bus Promo',
    advertiser: 'Transport Masters',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop',
    targetUrl: 'https://example.com',
    placement: 'LP_INLINE_1',
    priority: 5,
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    status: 'active',
    createdAt: '2024-01-15',
    impressions: 8200,
    clicks: 120,
  },
  {
    id: '3',
    title: 'Insurance Ad',
    advertiser: 'SafeRide Insurance',
    type: 'html',
    htmlContent: '<div style="background:#f0f9ff;padding:20px;text-align:center;border:1px solid #bae6fd;border-radius:8px;"><h3 style="color:#0369a1;margin:0">Secure Your Fleet Today</h3><p>Get 20% off for new institutes.</p></div>',
    targetUrl: 'https://example.com',
    placement: 'LIST_SIDEBAR',
    priority: 8,
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    status: 'pending',
    createdAt: '2024-02-28',
    impressions: 0,
    clicks: 0,
  },
  {
    id: '4',
    title: 'Draft Campaign',
    advertiser: 'Tech Solutions',
    type: 'video',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    targetUrl: 'https://example.com',
    placement: 'DASH_TOP',
    priority: 3,
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    status: 'draft',
    createdAt: '2024-04-01',
    impressions: 0,
    clicks: 0,
  }
];

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>(MOCK_ADS);
  const [adRequests, setAdRequests] = useState<AdRequest[]>(MOCK_AD_REQUESTS);

  const addAd = (newAd: Omit<Ad, 'id' | 'createdAt' | 'impressions' | 'clicks'>) => {
    const ad: Ad = {
      ...newAd,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      impressions: 0,
      clicks: 0,
    };
    setAds([...ads, ad]);
  };

  const updateAd = (id: string, updates: Partial<Ad>) => {
    setAds(ads.map(ad => ad.id === id ? { ...ad, ...updates } : ad));
  };

  const deleteAd = (id: string) => {
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
