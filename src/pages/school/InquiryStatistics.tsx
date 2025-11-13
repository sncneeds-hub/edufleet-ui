import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MessageSquare, TrendingUp, Clock, CheckCircle2, Download, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface InquiryStats {
  totalInquiries: number;
  totalReplied: number;
  responseRate: number;
  averageResponseTime: number;
  topPerformingVehicles: {
    vehicleId: string;
    brand: string;
    model: string;
    totalInquiries: number;
    repliedInquiries: number;
    responseRate: number;
    averageResponseTime: number;
  }[];
  leastPerformingVehicles: {
    vehicleId: string;
    brand: string;
    model: string;
    totalInquiries: number;
    repliedInquiries: number;
    responseRate: number;
    averageResponseTime: number;
  }[];
  inquiryTrend: { date: string; count: number }[];
  responseTrend: { date: string; responded: number; pending: number }[];
  statusBreakdown: {
    pending: number;
    responded: number;
    contacted: number;
  };
}

export function InquiryStatistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30d');

  // Fetch statistics
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.inquiryAnalytics.getSchoolStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching inquiry statistics:', err);
      setError(err.response?.data?.error || 'Failed to load inquiry statistics');
      toast.error('Failed to load inquiry statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Export as CSV
  const handleExportCSV = async () => {
    try {
      const blob = await api.inquiryAnalytics.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inquiry-statistics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Statistics exported successfully');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast.error('Failed to export statistics');
    }
  };

  // Check permissions
  if (!user || user.role !== 'school') {
    return <div className="p-4 text-center text-red-600">Access Denied. Only schools can view inquiry statistics.</div>;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Error Loading Statistics</CardTitle>
            </CardHeader>
            <CardContent className="text-red-800">
              {error || 'Failed to load inquiry statistics. Please try again.'}
              <Button onClick={fetchStats} variant="outline" className="mt-4 ml-auto">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inquiry Statistics</h1>
            <p className="text-muted-foreground mt-1">Track vehicle inquiries and response metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={fetchStats} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Inquiries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInquiries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.statusBreakdown.pending} pending
              </p>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalReplied} replied
              </p>
            </CardContent>
          </Card>

          {/* Avg Response Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageResponseTime < 24
                  ? `${stats.averageResponseTime.toFixed(1)}h`
                  : `${(stats.averageResponseTime / 24).toFixed(1)}d`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per inquiry
              </p>
            </CardContent>
          </Card>

          {/* Contacted After Reply */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.statusBreakdown.contacted}</div>
              <p className="text-xs text-muted-foreground mt-1">
                After reply
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Inquiry Trends</TabsTrigger>
            <TabsTrigger value="response">Response Metrics</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicle Performance</TabsTrigger>
          </TabsList>

          {/* Inquiry Trends */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Daily Inquiry Trend</CardTitle>
                <CardDescription>
                  Inquiries received over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.inquiryTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={stats.inquiryTrend}>
                      <defs>
                        <linearGradient id="colorInquiry" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorInquiry)"
                        name="Inquiries"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Response Metrics */}
          <TabsContent value="response">
            <Card>
              <CardHeader>
                <CardTitle>Response Status Trend</CardTitle>
                <CardDescription>
                  Replied vs pending inquiries over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.responseTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={stats.responseTrend}>
                      <defs>
                        <linearGradient id="colorResponded" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="responded"
                        stackId="1"
                        stroke="#10b981"
                        fill="url(#colorResponded)"
                        name="Responded"
                      />
                      <Area
                        type="monotone"
                        dataKey="pending"
                        stackId="1"
                        stroke="#f59e0b"
                        fill="url(#colorPending)"
                        name="Pending"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicle Performance */}
          <TabsContent value="vehicles" className="space-y-4">
            {/* Top Performing Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vehicles</CardTitle>
                <CardDescription>
                  Vehicles with the most inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topPerformingVehicles.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topPerformingVehicles.map((vehicle) => (
                      <div
                        key={vehicle.vehicleId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{vehicle.totalInquiries} inquiries</span>
                            <span>{vehicle.responseRate.toFixed(1)}% response rate</span>
                            <span>{vehicle.averageResponseTime.toFixed(1)}h avg time</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {vehicle.repliedInquiries} replied
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No vehicle data available</p>
                )}
              </CardContent>
            </Card>

            {/* Least Performing Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle>Least Performing Vehicles</CardTitle>
                <CardDescription>
                  Vehicles that may need optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.leastPerformingVehicles.length > 0 ? (
                  <div className="space-y-4">
                    {stats.leastPerformingVehicles.map((vehicle) => (
                      <div
                        key={vehicle.vehicleId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{vehicle.totalInquiries} inquiries</span>
                            <span>{vehicle.responseRate.toFixed(1)}% response rate</span>
                            <span>{vehicle.averageResponseTime.toFixed(1)}h avg time</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {vehicle.repliedInquiries} replied
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No vehicle data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiry Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {stats.statusBreakdown.pending}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Awaiting response
                </p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Responded</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {stats.statusBreakdown.responded}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Replied to inquiry
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Contacted</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {stats.statusBreakdown.contacted}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Buyer contacted after reply
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default InquiryStatistics;
