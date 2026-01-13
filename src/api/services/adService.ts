import { apiClient } from '@/lib/apiClient';
import { API_CONFIG } from '../config';
import { Ad, AdRequest, AdPlacement } from '@/types/adTypes';

// Use API_CONFIG directly to avoid destructuring issues with HMR or initialization order
// const { ENDPOINTS } = API_CONFIG;

export interface AdRequestPayload {
  name: string;
  email: string;
  company: string;
  phone?: string;
  adType: string;
  message?: string;
}

export interface CreateAdPayload {
  title: string;
  advertiser: string;
  type: 'image' | 'video' | 'html';
  mediaUrl?: string;
  htmlContent?: string;
  targetUrl: string;
  placement: AdPlacement;
  priority: number;
  startDate: string;
  endDate: string;
  status?: string;
  budget?: number;
  pricingModel?: 'cpm' | 'cpc' | 'fixed';
  currency?: string;
  targetLocation?: string;
}

export interface AdAnalytics {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  ctr: string | number;
  totalBudget: number;
  ads: Ad[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Helper to map _id to id
const mapId = <T extends { id: string }>(item: any): T => {
  if (!item) return item;
  return { ...item, id: item._id || item.id };
};

// ============ PUBLIC AD ENDPOINTS ============

/**
 * Get ads by placement (public)
 */
export const getAdsByPlacement = async (placement: AdPlacement): Promise<Ad[]> => {
  const response = await apiClient.get<any[]>(
    API_CONFIG.ENDPOINTS.ADS_BY_PLACEMENT(placement)
  );
  return response.map(item => mapId<Ad>(item));
};

/**
 * Record ad impression (public)
 */
export const recordImpression = async (adId: string): Promise<void> => {
  await apiClient.post(API_CONFIG.ENDPOINTS.AD_IMPRESSION(adId));
};

/**
 * Record ad click (public)
 */
export const recordClick = async (adId: string): Promise<void> => {
  await apiClient.post(API_CONFIG.ENDPOINTS.AD_CLICK(adId));
};

/**
 * Submit ad request (public - contact form)
 */
export const submitAdRequest = async (data: AdRequestPayload): Promise<AdRequest> => {
  const response = await apiClient.post<any>(
    API_CONFIG.ENDPOINTS.AD_REQUESTS,
    data
  );
  return mapId<AdRequest>(response);
};

// ============ ADMIN AD ENDPOINTS ============

/**
 * Get all ads (admin)
 */
export const getAllAds = async (params?: {
  status?: string;
  placement?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Ad>> => {
  const endpoint = API_CONFIG.ENDPOINTS.ADS;
  if (!endpoint) {
    throw new Error('API_CONFIG.ENDPOINTS.ADS is undefined');
  }
  const response = await apiClient.get<any[]>(endpoint, { params });
  const data = response.map(item => mapId<Ad>(item));
  
  // Wrap response to match PaginatedResponse interface since apiClient unwraps data
  return {
    success: true,
    data,
    pagination: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      total: response.length,
      pages: 1
    }
  };
};

/**
 * Get ad by ID (admin)
 */
export const getAdById = async (id: string): Promise<Ad> => {
  const response = await apiClient.get<any>(API_CONFIG.ENDPOINTS.AD_BY_ID(id));
  return mapId<Ad>(response);
};

/**
 * Create new ad (admin)
 */
export const createAd = async (data: CreateAdPayload): Promise<Ad> => {
  const endpoint = API_CONFIG.ENDPOINTS.ADS;
  if (!endpoint) {
    throw new Error('API_CONFIG.ENDPOINTS.ADS is undefined');
  }
  const response = await apiClient.post<any>(endpoint, data);
  return mapId<Ad>(response);
};

/**
 * Update ad (admin)
 */
export const updateAd = async (id: string, data: Partial<CreateAdPayload>): Promise<Ad> => {
  const response = await apiClient.put<any>(API_CONFIG.ENDPOINTS.AD_BY_ID(id), data);
  return mapId<Ad>(response);
};

/**
 * Delete ad (admin)
 */
export const deleteAd = async (id: string): Promise<void> => {
  await apiClient.delete(API_CONFIG.ENDPOINTS.AD_BY_ID(id));
};

/**
 * Get ad analytics (admin)
 */
export const getAdAnalytics = async (): Promise<AdAnalytics> => {
  const response = await apiClient.get<any>(API_CONFIG.ENDPOINTS.AD_ANALYTICS);
  return {
    ...response,
    ads: response.ads.map((ad: any) => mapId<Ad>(ad))
  };
};

// ============ AD REQUEST MANAGEMENT (Admin) ============

/**
 * Get all ad requests (admin)
 */
export const getAllAdRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<AdRequest>> => {
  const response = await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.AD_REQUESTS_ALL, { params });
  const data = response.map(item => mapId<AdRequest>(item));

  // Wrap response to match PaginatedResponse interface
  return {
    success: true,
    data,
    pagination: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      total: response.length,
      pages: 1
    }
  };
};

/**
 * Update ad request status (admin)
 */
export const updateAdRequestStatus = async (
  id: string,
  status: AdRequest['status']
): Promise<AdRequest> => {
  const response = await apiClient.put<any>(
    API_CONFIG.ENDPOINTS.AD_REQUEST_STATUS(id),
    { status }
  );
  return mapId<AdRequest>(response);
};

/**
 * Delete ad request (admin)
 */
export const deleteAdRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_CONFIG.ENDPOINTS.AD_REQUESTS}/${id}`);
};

export default {
  // Public
  getAdsByPlacement,
  recordImpression,
  recordClick,
  submitAdRequest,
  // Admin
  getAllAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getAdAnalytics,
  getAllAdRequests,
  updateAdRequestStatus,
  deleteAdRequest,
};