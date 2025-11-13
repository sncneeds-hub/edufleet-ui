import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Bell, Mail, Eye, BarChart3, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface NotificationStats {
  date: string
  total: number
  read: number
  unread: number
}

interface NotificationTypeStats {
  type: string
  count: number
  sent: number
  opened: number
}

interface NotificationAnalytics {
  totalNotifications: number
  totalRead: number
  totalUnread: number
  totalEmails: number
  emailsSent: number
  emailsFailed: number
  averageReadTime: number
  dailyStats: NotificationStats[]
  typeStats: NotificationTypeStats[]
  topEvents: Array<{ event: string; count: number }>
}

export function NotificationAnalytics() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d

  const handleFetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/notifications/analytics?range=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notification analytics',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleFetchAnalytics()
  }, [timeRange])

  if (!user || user.role !== 'admin') {
    return <div className="p-4 text-center text-red-600">Access Denied</div>
  }

  if (loading) {
    return <div className="p-4 text-center">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="p-4 text-center text-gray-500">No analytics data available</div>
  }

  const readRate = analytics.totalNotifications > 0
    ? ((analytics.totalRead / analytics.totalNotifications) * 100).toFixed(1)
    : '0'

  const emailSuccessRate = analytics.emailsSent > 0
    ? ((
        (analytics.emailsSent - analytics.emailsFailed) / analytics.emailsSent
      ) * 100).toFixed(1)
    : '0'

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notification Analytics</h1>
            <p className="text-gray-500 mt-1">Monitor notification performance and delivery</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalNotifications}</div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.totalRead} read, {analytics.totalUnread} unread
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
              <Eye className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readRate}%</div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.totalRead} of {analytics.totalNotifications}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.emailsSent}</div>
              <p className="text-xs text-gray-500 mt-1">
                {emailSuccessRate}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Read Time</CardTitle>
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(analytics.averageReadTime)}s
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Average time to read
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="types">By Type</TabsTrigger>
            <TabsTrigger value="email">Email Status</TabsTrigger>
          </TabsList>

          {/* Trends Chart */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Daily Notification Trends</CardTitle>
                <CardDescription>
                  Notifications sent and read over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      name="Total Sent"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="read"
                      stroke="#10b981"
                      name="Read"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="unread"
                      stroke="#ef4444"
                      name="Unread"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Types */}
          <TabsContent value="types">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications by Type</CardTitle>
                  <CardDescription>Distribution of notification types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.typeStats}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analytics.typeStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Type Performance</CardTitle>
                  <CardDescription>Open and engagement rates by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.typeStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                      <Bar dataKey="opened" fill="#10b981" name="Opened" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Status */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Notification Status</CardTitle>
                <CardDescription>Email delivery and failure metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600">Total Emails</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {analytics.totalEmails}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600">Successfully Sent</p>
                    <p className="text-2xl font-bold text-green-700">
                      {analytics.emailsSent - analytics.emailsFailed}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600">Failed</p>
                    <p className="text-2xl font-bold text-red-700">
                      {analytics.emailsFailed}
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Successful',
                          value: analytics.emailsSent - analytics.emailsFailed,
                        },
                        { name: 'Failed', value: analytics.emailsFailed },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Events
            </CardTitle>
            <CardDescription>Most common notification events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{event.event}</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {event.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default NotificationAnalytics
