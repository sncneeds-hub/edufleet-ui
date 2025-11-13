import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { DollarSign, TrendingUp, Users, Target, Calendar, Download, TrendingDown, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueOverview {
  totalRevenue: number;
  totalTransactions: number;
  revenueByType: Array<{
    type: string;
    amount: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    year: number;
    month: number;
    revenue: number;
    transactions: number;
  }>;
  activeSubscriptions: number;
  featuredAds: {
    revenue: number;
    count: number;
  };
}

interface SubscriptionData {
  mrr: number;
  arr: number;
  subscriptionsByPlan: Array<{
    plan: string;
    count: number;
    revenue: number;
  }>;
  churnedSubscriptions: number;
  newSubscriptions: number;
  churnRate: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getMonthLabel = (year: number, month: number) => {
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
};

export default function RevenueAnalytics() {
  const [overview, setOverview] = useState<RevenueOverview | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, subscriptionsRes] = await Promise.all([
        api.get('/revenue-analytics/overview', {
          params: dateRange !== 'all' ? { startDate: getStartDate(dateRange) } : {},
        }),
        api.get('/revenue-analytics/subscriptions'),
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
      }

      if (subscriptionsRes.data.success) {
        setSubscriptionData(subscriptionsRes.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const getStartDate = (range: string) => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return undefined;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      inquiry_fee: 'Inquiry Fees',
      success_fee: 'Success Fees',
      featured_ad: 'Featured Ads',
      subscription: 'Subscriptions',
      verification: 'Verifications',
    };
    return labels[type] || type;
  };

  const exportToCSV = () => {
    if (!overview) return;

    const csvData = [
      ['Revenue Analytics Report', `Generated on ${new Date().toLocaleDateString()}`],
      [],
      ['Summary Metrics'],
      ['Total Revenue', formatCurrency(overview.totalRevenue)],
      ['Total Transactions', overview.totalTransactions],
      ['Active Subscriptions', overview.activeSubscriptions],
      ['MRR', formatCurrency(subscriptionData?.mrr || 0)],
      ['ARR', formatCurrency(subscriptionData?.arr || 0)],
      [],
      ['Revenue by Type'],
      ['Type', 'Amount', 'Count', 'Percentage'],
      ...overview.revenueByType.map((item) => [
        getTypeLabel(item.type),
        formatCurrency(item.amount),
        item.count,
        `${((item.amount / (overview.totalRevenue || 1)) * 100).toFixed(1)}%`,
      ]),
      [],
      ['Monthly Trend'],
      ['Month', 'Revenue', 'Transactions'],
      ...overview.monthlyTrend.map((month) => [
        getMonthLabel(month.year, month.month),
        formatCurrency(month.revenue),
        month.transactions,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const chartData = overview?.monthlyTrend
    .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year))
    .map((month) => ({
      month: getMonthLabel(month.year, month.month),
      revenue: month.revenue,
      transactions: month.transactions,
    })) || [];

  const pieData = overview?.revenueByType.map((item) => ({
    name: getTypeLabel(item.type),
    value: item.amount,
  })) || [];

  const subscriptionChartData =
    subscriptionData?.subscriptionsByPlan.map((plan) => ({
      name: plan.plan,
      count: plan.count,
      revenue: plan.revenue,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">Track and analyze platform revenue in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Overview Cards - Enhanced with more metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-5 h-5 opacity-80" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(overview?.totalRevenue || 0)}</div>
            <p className="text-xs text-white/80 mt-2">{overview?.totalTransactions || 0} transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(subscriptionData?.mrr || 0)}</div>
            <p className="text-xs text-white/80 mt-2">
              ARR: {formatCurrency(subscriptionData?.arr || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="w-5 h-5 opacity-80" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.activeSubscriptions || 0}</div>
            <p className="text-xs text-white/80 mt-2">
              Churn: {((subscriptionData?.churnRate || 0) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Featured Ads Revenue</CardTitle>
              <Target className="w-5 h-5 opacity-80" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(overview?.featuredAds.revenue || 0)}</div>
            <p className="text-xs text-white/80 mt-2">{overview?.featuredAds.count || 0} active ads</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Average Transaction Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((overview?.totalRevenue || 0) / Math.max(overview?.totalTransactions || 1, 1))}
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              New Subscriptions (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{subscriptionData?.newSubscriptions || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Churned Subscriptions (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{subscriptionData?.churnedSubscriptions || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics with Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend (Last 12 Months)</CardTitle>
              <CardDescription>Track revenue growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      dot={{ fill: '#3b82f6' }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Transaction Count</CardTitle>
              <CardDescription>Number of transactions processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="transactions" fill="#10b981" name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Type (Pie Chart)</CardTitle>
                <CardDescription>Distribution of revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Type (Detailed)</CardTitle>
                <CardDescription>Breakdown of each revenue source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overview?.revenueByType.map((item, idx) => (
                    <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        ></div>
                        <div>
                          <p className="font-medium text-sm">{getTypeLabel(item.type)}</p>
                          <p className="text-xs text-muted-foreground">{item.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((item.amount / (overview?.totalRevenue || 1)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions by Plan</CardTitle>
                <CardDescription>Distribution across pricing tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subscriptionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Active Subscriptions" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Monthly Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(subscriptionData?.mrr || 0)}
                    </p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                    <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(subscriptionData?.arr || 0)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-muted-foreground">New (30d)</p>
                      <p className="text-xl font-bold text-green-600">+{subscriptionData?.newSubscriptions}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs text-muted-foreground">Churned (30d)</p>
                      <p className="text-xl font-bold text-red-600">-{subscriptionData?.churnedSubscriptions}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-muted-foreground">Churn Rate</p>
                    <p className="text-xl font-bold text-orange-600">
                      {((subscriptionData?.churnRate || 0) * 100).toFixed(1)}%
                    </p>
                  </div>

                  {subscriptionData?.subscriptionsByPlan.map((plan) => (
                    <div key={plan.plan} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{plan.plan}</p>
                        <Badge variant="secondary">{plan.count} active</Badge>
                      </div>
                      <p className="text-sm font-bold text-muted-foreground mt-1">
                        {formatCurrency(plan.revenue)}/month
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Details</CardTitle>
              <CardDescription>Comprehensive breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Month</th>
                      <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold">Transactions</th>
                      <th className="text-right py-3 px-4 font-semibold">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{row.month}</td>
                        <td className="text-right py-3 px-4 font-semibold text-green-600">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="text-right py-3 px-4">{row.transactions}</td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(row.revenue / Math.max(row.transactions, 1))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download your revenue data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={exportToCSV} className="w-full gap-2" variant="outline">
                  <Download className="w-4 h-4" />
                  Download as CSV
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Includes summary metrics, revenue breakdown, and monthly trends
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
