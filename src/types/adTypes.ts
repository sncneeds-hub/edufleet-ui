export type AdType = 'image' | 'video' | 'html';
export type AdPlacement = 'LP_TOP_BANNER' | 'LP_INLINE_1' | 'LP_INLINE_2' | 'LIST_SIDEBAR' | 'DASH_TOP';
export type AdStatus = 'draft' | 'pending' | 'active' | 'paused' | 'expired' | 'rejected';

export interface Ad {
  id: string;
  title: string;
  advertiser: string;
  type: AdType;
  mediaUrl?: string; // For image/video
  htmlContent?: string; // For HTML ads
  targetUrl: string;
  placement: AdPlacement;
  priority: number; // 1-10
  startDate: string;
  endDate: string;
  status: AdStatus;
  rejectionReason?: string;
  createdAt: string;
  
  // Analytics stats
  impressions: number;
  clicks: number;
}

export interface AdRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  adType: string;
  message: string;
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  createdAt: string;
}

export interface AdAnalyticsData {
  date: string;
  impressions: number;
  clicks: number;
}
