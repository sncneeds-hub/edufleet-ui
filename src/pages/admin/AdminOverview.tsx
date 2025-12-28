import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { api } from '@/api';
import { useAds } from '@/context/AdContext';
import { Car, Building2, Megaphone, TrendingUp } from 'lucide-react';
import { DashboardSuggestion } from '@/components/DashboardSuggestion';
import { useNavigate } from 'react-router-dom';

export function AdminOverview() {
  const navigate = useNavigate();
  const { ads } = useAds();
  const [supplierStats, setSupplierStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 });
  const [vehicleStats, setVehicleStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, priorityListings: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [supplierResponse, vehicleResponse] = await Promise.all([
        api.suppliers.getSupplierStats(),
        api.admin.getStats()
      ]);
      setSupplierStats(supplierResponse.data);
      setVehicleStats(vehicleResponse.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const activeAds = ads.filter(a => a.status === 'active').length;
  const pendingAds = ads.filter(a => a.status === 'pending').length;

  const getSuggestedAction = () => {
    if (supplierStats.pending > 0) {
      return {
        title: "Review Pending Suppliers",
        description: `There are ${supplierStats.pending} new supplier(s) waiting for your approval.`,
        action: "Review Suppliers",
        onClick: () => navigate('/admin/suppliers/pending'),
        variant: 'default' as const
      };
    }
    if (vehicleStats.pending > 0) {
      return {
        title: "Review Pending Vehicle Listings",
        description: `There are ${vehicleStats.pending} new listings waiting for your approval.`,
        action: "Review Now",
        onClick: () => navigate('/admin/vehicles/pending'),
        variant: 'default' as const
      };
    }
    if (pendingAds > 0) {
      return {
        title: "Review Pending Ads",
        description: `There are ${pendingAds} ads waiting for approval.`,
        action: "Review Ads",
        onClick: () => navigate('/admin/ads/approvals'),
        variant: 'default' as const
      };
    }
    return {
      title: "Platform Performance",
      description: "All pending approvals are up to date. Monitor platform activity and manage content.",
      action: "View Analytics",
      onClick: () => navigate('/admin/ads/analytics'),
      variant: 'outline' as const
    };
  };

  const suggestion = getSuggestedAction();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening on your platform.</p>
      </div>

      {/* Suggested Action */}
      {suggestion && <DashboardSuggestion {...suggestion} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Vehicle Listings</p>
          <div className="text-3xl font-bold text-primary mb-2">{vehicleStats.total}</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-600">✓ {vehicleStats.approved} Approved</span>
            <span className="text-amber-600">⏳ {vehicleStats.pending} Pending</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-secondary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Suppliers</p>
          <div className="text-3xl font-bold text-secondary mb-2">{supplierStats.total}</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-600">✓ {supplierStats.approved} Approved</span>
            <span className="text-amber-600">⏳ {supplierStats.pending} Pending</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Megaphone className="w-6 h-6 text-accent" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Active Ads</p>
          <div className="text-3xl font-bold text-accent mb-2">{activeAds}</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-blue-600">📊 {ads.length} Total</span>
            <span className="text-amber-600">⏳ {pendingAds} Pending</span>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Platform Growth</p>
          <div className="text-3xl font-bold mb-2">24.5K</div>
          <div className="text-xs text-muted-foreground">Total interactions this month</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/vehicles/pending')}
            className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <Car className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Review Vehicles</h3>
            <p className="text-sm text-muted-foreground">{vehicleStats.pending} pending approval</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/suppliers/pending')}
            className="p-4 border border-border rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all text-left"
          >
            <Building2 className="w-8 h-8 text-secondary mb-2" />
            <h3 className="font-semibold mb-1">Review Suppliers</h3>
            <p className="text-sm text-muted-foreground">{supplierStats.pending} pending approval</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/ads')}
            className="p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left"
          >
            <Megaphone className="w-8 h-8 text-accent mb-2" />
            <h3 className="font-semibold mb-1">Manage Ads</h3>
            <p className="text-sm text-muted-foreground">View analytics & approvals</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
