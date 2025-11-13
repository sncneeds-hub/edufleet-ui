import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, Car, CheckCircle, Clock, TrendingUp, AlertCircle, 
  IndianRupee, Users, BarChart3, PieChart, MapPin, Award 
} from 'lucide-react'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function AdminDashboard() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '365d'>('30d')
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await api.analytics.getDashboard(dateRange)
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load analytics data</p>
          <Button variant="outline" className="mt-4" onClick={loadAnalytics}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const { stats, instituteTrends, vehicleTrends, approvalRates, vehicleTypeDistribution, geographicDistribution, topInstitutes, adMetrics } = analytics

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Comprehensive platform insights and metrics</p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="365d">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadAnalytics}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {(stats.pendingInstitutes > 0 || stats.pendingVehicles > 0) && (
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Action Required</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.pendingInstitutes > 0 && `${stats.pendingInstitutes} institute${stats.pendingInstitutes > 1 ? 's' : ''} awaiting approval. `}
                    {stats.pendingVehicles > 0 && `${stats.pendingVehicles} vehicle${stats.pendingVehicles > 1 ? 's' : ''} awaiting review.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Institutes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInstitutes}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">{stats.approvedInstitutes} approved</Badge>
                {stats.pendingInstitutes > 0 && (
                  <Badge variant="outline" className="text-xs text-yellow-600">{stats.pendingInstitutes} pending</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">{stats.activeVehicles} active</Badge>
                <Badge variant="outline" className="text-xs">{stats.soldVehicles} sold</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Listed Value</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.totalValue / 100000).toFixed(2)}L</div>
              <p className="text-xs text-muted-foreground mt-1">Across {stats.totalVehicles} vehicles</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ad Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(adMetrics.totalRevenue / 100000).toFixed(2)}L</div>
              <p className="text-xs text-muted-foreground mt-1">
                {adMetrics.promotedVehicles} promoted • {adMetrics.ctr}% CTR
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration & Posting Trends */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Institute Registration Trends</CardTitle>
              <CardDescription>New institute registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={instituteTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Registrations" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Posting Trends</CardTitle>
              <CardDescription>New vehicle listings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={vehicleTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="New Listings" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Approval Rates & Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Institute Approval Metrics</CardTitle>
              <CardDescription>Registration approval statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Approval Rate</span>
                  <Badge variant="secondary" className="text-base">{approvalRates.institutes.approvalRate}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg. Approval Time</span>
                  <span className="text-sm text-muted-foreground">{approvalRates.institutes.avgApprovalTime} hours</span>
                </div>
                <div className="pt-4">
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={[
                      { status: 'Approved', count: approvalRates.institutes.approved },
                      { status: 'Pending', count: approvalRates.institutes.pending },
                      { status: 'Rejected', count: approvalRates.institutes.rejected },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Approval Metrics</CardTitle>
              <CardDescription>Listing approval statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Approval Rate</span>
                  <Badge variant="secondary" className="text-base">{approvalRates.vehicles.approvalRate}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg. Approval Time</span>
                  <span className="text-sm text-muted-foreground">{approvalRates.vehicles.avgApprovalTime} hours</span>
                </div>
                <div className="pt-4">
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={[
                      { status: 'Approved', count: approvalRates.vehicles.approved },
                      { status: 'Pending', count: approvalRates.vehicles.pending },
                      { status: 'Rejected', count: approvalRates.vehicles.rejected },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Type Distribution & Geographic Distribution */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Vehicle Type Distribution
              </CardTitle>
              <CardDescription>Breakdown by vehicle category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={vehicleTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {vehicleTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Top 10 cities by institutes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geographicDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="city" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Institutes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Institutes
            </CardTitle>
            <CardDescription>Institutes with most approved vehicle listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topInstitutes.slice(0, 10).map((inst, index) => (
                <div key={inst.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{inst.name}</p>
                      <p className="text-xs text-muted-foreground">{inst.city}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{inst.count} vehicles</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <Button 
              className="justify-start" 
              variant="outline" 
              onClick={() => navigate('/dashboard/institutes')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Review Institute Registrations
              {stats.pendingInstitutes > 0 && (
                <Badge variant="destructive" className="ml-auto">{stats.pendingInstitutes}</Badge>
              )}
            </Button>
            <Button 
              className="justify-start" 
              variant="outline" 
              onClick={() => navigate('/dashboard/vehicles')}
            >
              <Car className="h-4 w-4 mr-2" />
              Review Vehicle Listings
              {stats.pendingVehicles > 0 && (
                <Badge variant="destructive" className="ml-auto">{stats.pendingVehicles}</Badge>
              )}
            </Button>
            <Button 
              className="justify-start" 
              variant="outline" 
              onClick={() => navigate('/tasks')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Pick Revenue Task
            </Button>
            <Button 
              className="justify-start" 
              variant="outline" 
              onClick={() => navigate('/dashboard/revenue')}
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              View Revenue Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
