import React from 'react';
import { useAds } from '../../../context/AdContext';
import { AdStatsCard } from '../../../components/ads/AdStatsCard';
import { AnalyticsChart } from '../../../components/ads/AnalyticsChart';
import { BarChart3, MousePointerClick, Eye, TrendingUp, Users } from 'lucide-react';

const AdDashboard: React.FC = () => {
  const { ads } = useAds();

  // Calculate totals
  const totalAds = ads.length;
  const activeAds = ads.filter(a => a.status === 'active').length;
  const pendingAds = ads.filter(a => a.status === 'pending').length;
  const totalImpressions = ads.reduce((acc, curr) => acc + curr.impressions, 0);
  const totalClicks = ads.reduce((acc, curr) => acc + curr.clicks, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Chart data
  const chartData = [
    { date: 'Mon', impressions: 4000, clicks: 240 },
    { date: 'Tue', impressions: 3000, clicks: 139 },
    { date: 'Wed', impressions: 2000, clicks: 980 },
    { date: 'Thu', impressions: 2780, clicks: 390 },
    { date: 'Fri', impressions: 1890, clicks: 480 },
    { date: 'Sat', impressions: 2390, clicks: 380 },
    { date: 'Sun', impressions: 3490, clicks: 430 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ad Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdStatsCard
          title="Total Ads"
          value={totalAds}
          icon={BarChart3}
          description={`${activeAds} active`}
        />
        <AdStatsCard
          title="Impressions"
          value={totalImpressions.toLocaleString()}
          icon={Eye}
          trend="up"
          trendValue="+20.1%"
          description="from last month"
        />
        <AdStatsCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={MousePointerClick}
          trend="up"
          trendValue="+12.5%"
          description="from last month"
        />
        <AdStatsCard
          title="Average CTR"
          value={`${avgCtr.toFixed(2)}%`}
          icon={TrendingUp}
          trend="down"
          trendValue="-4.1%"
          description="from last month"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
           <AnalyticsChart data={chartData} title="Weekly Performance" />
        </div>
        <div className="col-span-3 space-y-4">
          {/* Quick Pending Approvals Widget */}
          <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Pending Approvals</h3>
            {pendingAds === 0 ? (
               <p className="text-muted-foreground text-sm">No ads pending approval.</p>
            ) : (
               <div className="space-y-4">
                 {ads.filter(a => a.status === 'pending').slice(0, 5).map(ad => (
                   <div key={ad.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                     <div>
                       <p className="text-sm font-medium">{ad.title}</p>
                       <p className="text-xs text-muted-foreground">{ad.advertiser}</p>
                     </div>
                     <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDashboard;
