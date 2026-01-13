import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Ad, AdPlacement, AdRequest } from '../types/adTypes';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import adService, { AdRequestPayload, CreateAdPayload } from '../api/services/adService';

interface AdContextType {
  ads: Ad[];
  adRequests: AdRequest[];
  isLoading: boolean;
  // Admin operations
  fetchAllAds: (params?: { status?: string; placement?: string }) => Promise<void>;
  fetchAdRequests: (params?: { status?: string }) => Promise<void>;
  addAd: (ad: CreateAdPayload) => Promise<void>;
  updateAd: (id: string, updates: Partial<CreateAdPayload>) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  updateAdRequestStatus: (id: string, status: AdRequest['status']) => Promise<void>;
  // Public operations
  getAdsByPlacement: (placement: AdPlacement) => Promise<Ad[]>;
  recordImpression: (id: string) => void;
  recordClick: (id: string) => void;
  submitAdRequest: (request: AdRequestPayload) => Promise<void>;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [adRequests, setAdRequests] = useState<AdRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all ads (admin)
  const fetchAllAds = useCallback(async (params?: { status?: string; placement?: string }) => {
    if (user?.role !== 'admin') return;
    
    setIsLoading(true);
    try {
      const response = await adService.getAllAds(params);
      setAds(response.data);
    } catch (error: any) {
      console.error('Failed to fetch ads:', error);
      toast.error('Failed to fetch ads');
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  // Fetch ad requests (admin)
  const fetchAdRequests = useCallback(async (params?: { status?: string }) => {
    if (user?.role !== 'admin') return;
    
    setIsLoading(true);
    try {
      const response = await adService.getAllAdRequests(params);
      setAdRequests(response.data);
    } catch (error: any) {
      console.error('Failed to fetch ad requests:', error);
      toast.error('Failed to fetch ad requests');
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  // Create ad (admin)
  const addAd = useCallback(async (newAd: CreateAdPayload) => {
    if (user?.role !== 'admin') {
      toast.error("Unauthorized: Only admins can create ads");
      return;
    }

    setIsLoading(true);
    try {
      const createdAd = await adService.createAd(newAd);
      setAds(prev => [createdAd, ...prev]);
      toast.success('Ad created successfully');
    } catch (error: any) {
      console.error('Failed to create ad:', error);
      toast.error(error?.response?.data?.error || 'Failed to create ad');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  // Update ad (admin)
  const updateAd = useCallback(async (id: string, updates: Partial<CreateAdPayload>) => {
    if (user?.role !== 'admin') {
      toast.error("Unauthorized: Only admins can update ads");
      return;
    }

    setIsLoading(true);
    try {
      const updatedAd = await adService.updateAd(id, updates);
      setAds(prev => prev.map(ad => ad.id === id ? updatedAd : ad));
      toast.success('Ad updated successfully');
    } catch (error: any) {
      console.error('Failed to update ad:', error);
      toast.error(error?.response?.data?.error || 'Failed to update ad');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  // Delete ad (admin)
  const deleteAd = useCallback(async (id: string) => {
    if (user?.role !== 'admin') {
      toast.error("Unauthorized: Only admins can delete ads");
      return;
    }

    setIsLoading(true);
    try {
      await adService.deleteAd(id);
      setAds(prev => prev.filter(ad => ad.id !== id));
      toast.success('Ad deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete ad:', error);
      toast.error(error?.response?.data?.error || 'Failed to delete ad');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  // Get ads by placement (public - for displaying ads)
  const getAdsByPlacement = useCallback(async (placement: AdPlacement): Promise<Ad[]> => {
    try {
      const placementAds = await adService.getAdsByPlacement(placement);
      return placementAds;
    } catch (error: any) {
      console.error(`[AdContext] Failed to fetch ads for ${placement}:`, error);
      return [];
    }
  }, []);

  // Record impression (public)
  const recordImpression = useCallback((id: string) => {
    // Fire and forget - don't wait for response
    adService.recordImpression(id).catch(console.error);
  }, []);

  // Record click (public)
  const recordClick = useCallback((id: string) => {
    // Fire and forget - don't wait for response
    adService.recordClick(id).catch(console.error);
  }, []);

  // Submit ad request (public - contact form from Advertise page)
  const submitAdRequest = useCallback(async (request: AdRequestPayload) => {
    setIsLoading(true);
    try {
      const newRequest = await adService.submitAdRequest(request);
      setAdRequests(prev => [newRequest, ...prev]);
      toast.success('Ad request submitted successfully! Our team will contact you within 24 hours.');
    } catch (error: any) {
      console.error('Failed to submit ad request:', error);
      toast.error(error?.response?.data?.error || 'Failed to submit ad request');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update ad request status (admin)
  const updateAdRequestStatus = useCallback(async (id: string, status: AdRequest['status']) => {
    if (user?.role !== 'admin') {
      toast.error("Unauthorized: Only admins can update request status");
      return;
    }

    setIsLoading(true);
    try {
      const updatedRequest = await adService.updateAdRequestStatus(id, status);
      setAdRequests(prev => prev.map(req => req.id === id ? updatedRequest : req));
      toast.success('Ad request status updated');
    } catch (error: any) {
      console.error('Failed to update ad request status:', error);
      toast.error(error?.response?.data?.error || 'Failed to update status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  // Auto-fetch ads for admin users
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllAds();
      fetchAdRequests();
    }
  }, [user?.role, fetchAllAds, fetchAdRequests]);

  return (
    <AdContext.Provider value={{ 
      ads, 
      adRequests,
      isLoading,
      fetchAllAds,
      fetchAdRequests,
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
