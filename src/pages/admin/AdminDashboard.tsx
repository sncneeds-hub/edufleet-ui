import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Car, CheckCircle, Clock, TrendingUp, AlertCircle, IndianRupee } from 'lucide-react'
import { blink } from '@/lib/blink'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalInstitutes: 0,
    pendingInstitutes: 0,
    approvedInstitutes: 0,
    rejectedInstitutes: 0,
    totalVehicles: 0,
    pendingVehicles: 0,
    approvedVehicles: 0,
    rejectedVehicles: 0,
    totalValue: 0,
    recentVehicles: [] as any[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const institutes = await api.institutes.getAll()
      const allVehicles = await api.vehicles.getAll()
      const recentVehicles = allVehicles.slice(0, 5)
      
      const totalValue = allVehicles.reduce((sum: number, v: any) => sum + (v.price || 0), 0)
      
      setStats({
        totalInstitutes: institutes.length,
        pendingInstitutes: institutes.filter((i: any) => i.approvalStatus === 'pending').length,
        approvedInstitutes: institutes.filter((i: any) => i.approvalStatus === 'approved').length,
        rejectedInstitutes: institutes.filter((i: any) => i.approvalStatus === 'rejected').length,
        totalVehicles: allVehicles.length,
        pendingVehicles: allVehicles.filter((v: any) => v.approvalStatus === 'pending').length,
        approvedVehicles: allVehicles.filter((v: any) => v.approvalStatus === 'approved').length,
        rejectedVehicles: allVehicles.filter((v: any) => v.approvalStatus === 'rejected').length,
        totalValue,
        recentVehicles
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
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
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome, Admin</h2>
            <p className="text-muted-foreground">Manage institutes and vehicle listings</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadStats}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

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
                <Badge variant="outline" className="text-xs">{stats.rejectedInstitutes} rejected</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Institutes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingInstitutes}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
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
                <Badge variant="secondary" className="text-xs">{stats.approvedVehicles} approved</Badge>
                <Badge variant="outline" className="text-xs">{stats.rejectedVehicles} rejected</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Vehicles</CardTitle>
              <CheckCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingVehicles}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Listed Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{(stats.totalValue / 100000).toFixed(2)} Lakhs</div>
            <p className="text-xs text-muted-foreground mt-1">Across {stats.totalVehicles} vehicles</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
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
                className="w-full justify-start" 
                variant="outline" 
                onClick={() => navigate('/dashboard/vehicles')}
              >
                <Car className="h-4 w-4 mr-2" />
                Review Vehicle Listings
                {stats.pendingVehicles > 0 && (
                  <Badge variant="destructive" className="ml-auto">{stats.pendingVehicles}</Badge>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Vehicle Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent vehicles</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentVehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className="flex items-start justify-between text-sm border-b pb-2 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.instituteName}</p>
                      </div>
                      <Badge variant={
                        vehicle.approvalStatus === 'approved' ? 'default' :
                        vehicle.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {vehicle.approvalStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
