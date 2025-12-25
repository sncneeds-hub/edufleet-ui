import React, { useState } from 'react';
import { useAds } from '../../../context/AdContext';
import { AnalyticsChart } from '../../../components/ads/AnalyticsChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

const AdAnalytics: React.FC = () => {
  const { ads } = useAds();
  const [timeRange, setTimeRange] = useState('7d');

  // Data generator based on selected range
  const generateData = (days: number) => {
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: Math.floor(Math.random() * 5000) + 1000,
        clicks: Math.floor(Math.random() * 500) + 50,
      };
    });
  };

  const data = generateData(timeRange === '7d' ? 7 : 30);

  // Aggregated stats by placement
  const placementStats = ads.reduce((acc, curr) => {
    if (!acc[curr.placement]) {
      acc[curr.placement] = { impressions: 0, clicks: 0, count: 0 };
    }
    acc[curr.placement].impressions += curr.impressions;
    acc[curr.placement].clicks += curr.clicks;
    acc[curr.placement].count += 1;
    return acc;
  }, {} as Record<string, { impressions: number, clicks: number, count: number }>);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
           <p className="text-muted-foreground">Deep dive into ad performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnalyticsChart data={data} title={`Performance Trends (${timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'})`} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Placement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(placementStats).map(([placement, stats]) => (
                <div key={placement} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{placement}</p>
                    <p className="text-xs text-muted-foreground">{stats.count} active ads</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{stats.impressions.toLocaleString()} imps</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : 0}% CTR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...ads].sort((a, b) => b.clicks - a.clicks).slice(0, 5).map((ad, i) => (
                <div key={ad.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">{ad.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{ad.advertiser}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{ad.clicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdAnalytics;
