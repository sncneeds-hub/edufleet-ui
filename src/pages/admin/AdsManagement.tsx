import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sparkles, Eye, MousePointerClick, TrendingUp, Edit, IndianRupee, Calendar, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Vehicle } from '@/types'

interface AdStats {
  vehicleId: string
  brand: string
  model: string
  impressions: number
  clicks: number
  ctr: string
  revenue: number
  adPrice: number
  placements: string[]
}

export function AdsManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [promotedVehicles, setPromotedVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [adPrice, setAdPrice] = useState(0)
  const [adBudget, setAdBudget] = useState(0)
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Stats
  const [statsLoading, setStatsLoading] = useState(true)
  const [adStats, setAdStats] = useState<AdStats[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [selectedPage, setSelectedPage] = useState<'all' | 'landing' | 'browse' | 'detail'>('all')

  useEffect(() => {
    loadVehicles()
    loadAdStats()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const allVehicles = await api.vehicles.getAll({ status: 'approved', soldStatus: 'available' })
      setVehicles(allVehicles)
      setPromotedVehicles(allVehicles.filter(v => v.isPromotedAd))
    } catch (error) {
      console.error('Failed to load vehicles:', error)
      toast.error('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  const loadAdStats = async () => {
    try {
      setStatsLoading(true)
      const revenueData = await api.adTracking.getRevenue()
      setTotalRevenue(revenueData.totalRevenue)
      setAdStats(revenueData.vehicles)
    } catch (error) {
      console.error('Failed to load ad stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleEditAd = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setAdPrice(vehicle.adPrice || 0)
    setAdBudget(vehicle.adBudget || 0)
    setSelectedPlacements(vehicle.adPlacements || [])
  }

  const handleTogglePlacement = (placement: string) => {
    setSelectedPlacements(prev =>
      prev.includes(placement)
        ? prev.filter(p => p !== placement)
        : [...prev, placement]
    )
  }

  const handleSaveAd = async () => {
    if (!editingVehicle) return

    if (selectedPlacements.length === 0) {
      toast.error('⚠️ Select at least one placement')
      return
    }

    try {
      setSubmitting(true)
      const loadingToast = toast.loading('Saving ad settings...')
      const vehicleId = editingVehicle._id || editingVehicle.id || ''
      
      await api.vehicles.promote(vehicleId, {
        isPromoted: true,
        adPrice,
        adBudget,
        adPlacements: selectedPlacements as ('landing' | 'browse' | 'detail')[]
      })

      toast.dismiss(loadingToast)
      toast.success('✅ Ad settings saved successfully! Your vehicle is now promoted.')
      setEditingVehicle(null)
      await loadVehicles()
      await loadAdStats()
    } catch (error) {
      console.error('Failed to save ad:', error)
      toast.error('❌ Failed to save ad settings. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveAd = async (vehicleId: string) => {
    const loadingToast = toast.loading('Removing ad...')
    try {
      await api.vehicles.promote(vehicleId, {
        isPromoted: false,
        adPrice: 0,
        adBudget: 0,
        adPlacements: []
      })

      toast.dismiss(loadingToast)
      toast.success('✅ Ad removed successfully. Vehicle returned to regular listings.')
      await loadVehicles()
      await loadAdStats()
    } catch (error) {
      console.error('Failed to remove ad:', error)
      toast.dismiss(loadingToast)
      toast.error('❌ Failed to remove ad. Please try again.')
    }
  }

  const handleToggleFeatured = async (vehicleId: string, isFeatured: boolean) => {
    const loadingToast = toast.loading(isFeatured ? 'Featuring vehicle...' : 'Unfeaturing vehicle...')
    try {
      await api.vehicles.toggleFeatured(vehicleId, {
        isFeatured,
        durationDays: 30
      })

      toast.dismiss(loadingToast)
      toast.success(isFeatured ? '⭐ Vehicle featured successfully!' : '✅ Vehicle unfeatured')
      await loadVehicles()
    } catch (error) {
      console.error('Failed to toggle featured:', error)
      toast.dismiss(loadingToast)
      toast.error('❌ Failed to update featured status')
    }
  }

  const filteredStats = selectedPage === 'all'
    ? adStats
    : adStats.filter(stat => stat.placements.includes(selectedPage))

  const pageStats = {
    totalImpressions: filteredStats.reduce((sum, stat) => sum + stat.impressions, 0),
    totalClicks: filteredStats.reduce((sum, stat) => sum + stat.clicks, 0),
    avgCtr: filteredStats.length > 0
      ? (filteredStats.reduce((sum, stat) => sum + parseFloat(stat.ctr), 0) / filteredStats.length).toFixed(2)
      : '0.00',
    totalAds: filteredStats.length
  }

  return (
    <DashboardLayout activeTab="ads">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Ads Management</h2>
            <p className="text-muted-foreground">Manage promoted vehicles and view ad performance</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAdStats}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
        </div>

        {/* Revenue Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">From all promoted ads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Active Ads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promotedVehicles.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently promoted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Total Impressions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pageStats.totalImpressions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all ads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MousePointerClick className="h-4 w-4" />
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pageStats.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Average CTR: {pageStats.avgCtr}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Page Filter Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Page</CardTitle>
            <CardDescription>View ad performance across different pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedPage === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPage('all')}
              >
                All Pages ({adStats.length})
              </Button>
              <Button
                variant={selectedPage === 'landing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPage('landing')}
              >
                Landing ({adStats.filter(s => s.placements.includes('landing')).length})
              </Button>
              <Button
                variant={selectedPage === 'browse' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPage('browse')}
              >
                Browse ({adStats.filter(s => s.placements.includes('browse')).length})
              </Button>
              <Button
                variant={selectedPage === 'detail' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPage('detail')}
              >
                Detail ({adStats.filter(s => s.placements.includes('detail')).length})
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{pageStats.totalAds}</div>
                  <p className="text-sm text-muted-foreground">Active Ads</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{pageStats.totalImpressions.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{pageStats.totalClicks.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Clicks</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{pageStats.avgCtr}%</div>
                  <p className="text-sm text-muted-foreground">Avg CTR</p>
                </CardContent>
              </Card>
            </div>

            {statsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading stats...</p>
              </div>
            ) : filteredStats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No ads on this page yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Placements</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Price/View</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStats.map((stat) => (
                    <TableRow key={stat.vehicleId}>
                      <TableCell className="font-medium">
                        {stat.brand} {stat.model}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {stat.placements.map(placement => (
                            <Badge key={placement} variant="secondary" className="text-xs">
                              {placement}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{stat.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{stat.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{stat.ctr}%</TableCell>
                      <TableCell className="text-right">₹{stat.adPrice}</TableCell>
                      <TableCell className="text-right font-semibold">₹{stat.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Manage Ads */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Promoted Ads</CardTitle>
            <CardDescription>Promote vehicles and configure ad placements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading vehicles...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Currently Promoted */}
                {promotedVehicles.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      Currently Promoted ({promotedVehicles.length})
                    </h4>
                    <div className="space-y-2">
                      {promotedVehicles.map((vehicle) => {
                        const vehicleId = vehicle._id || vehicle.id || ''
                        return (
                          <div key={vehicleId} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50/50">
                            <div className="flex-1">
                              <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle.instituteName} • ₹{vehicle.price?.toLocaleString()}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {vehicle.adPlacements?.map(placement => (
                                  <Badge key={placement} variant="secondary" className="text-xs">
                                    {placement}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={vehicle.isFeatured ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleFeatured(vehicleId, !vehicle.isFeatured)}
                                title={vehicle.isFeatured ? 'Unfeature this vehicle' : 'Feature this vehicle'}
                              >
                                <Star className={`h-3 w-3 mr-1 ${vehicle.isFeatured ? 'fill-current' : ''}`} />
                                {vehicle.isFeatured ? 'Featured' : 'Feature'}
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditAd(vehicle)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Edit Ad Settings</DialogTitle>
                                    <DialogDescription>
                                      Configure ad placements and pricing for {vehicle.brand} {vehicle.model}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingVehicle && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Ad Placements</Label>
                                        <div className="space-y-2">
                                          {['landing', 'browse', 'detail'].map((placement) => (
                                            <div key={placement} className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`placement-${placement}`}
                                                checked={selectedPlacements.includes(placement)}
                                                onCheckedChange={() => handleTogglePlacement(placement)}
                                              />
                                              <label
                                                htmlFor={`placement-${placement}`}
                                                className="text-sm font-medium capitalize cursor-pointer"
                                              >
                                                {placement} Page
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="adPrice">Price per View/Click (₹)</Label>
                                        <Input
                                          id="adPrice"
                                          type="number"
                                          min="0"
                                          step="0.5"
                                          value={adPrice}
                                          onChange={(e) => setAdPrice(parseFloat(e.target.value) || 0)}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="adBudget">Total Budget (₹)</Label>
                                        <Input
                                          id="adBudget"
                                          type="number"
                                          min="0"
                                          step="100"
                                          value={adBudget}
                                          onChange={(e) => setAdBudget(parseFloat(e.target.value) || 0)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Ad will stop when budget is exhausted
                                        </p>
                                      </div>

                                      <div className="flex gap-2 pt-4">
                                        <Button
                                          onClick={handleSaveAd}
                                          disabled={submitting || selectedPlacements.length === 0}
                                          className="flex-1"
                                        >
                                          {submitting ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingVehicle(null)}
                                          disabled={submitting}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveAd(vehicleId)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Available Vehicles */}
                <div>
                  <h4 className="font-semibold mb-3">
                    Available Vehicles ({vehicles.filter(v => !v.isPromotedAd).length})
                  </h4>
                  {vehicles.filter(v => !v.isPromotedAd).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      All approved vehicles are currently promoted
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {vehicles
                        .filter(v => !v.isPromotedAd)
                        .slice(0, 10)
                        .map((vehicle) => {
                          const vehicleId = vehicle._id || vehicle.id || ''
                          return (
                            <div key={vehicleId} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                                <div className="text-sm text-muted-foreground">
                                  {vehicle.instituteName} • ₹{vehicle.price?.toLocaleString()}
                                </div>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingVehicle(vehicle)
                                      setAdPrice(0)
                                      setAdBudget(0)
                                      setSelectedPlacements([])
                                    }}
                                  >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Promote
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Promote Vehicle</DialogTitle>
                                    <DialogDescription>
                                      Configure ad placements and pricing for {vehicle.brand} {vehicle.model}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingVehicle && (
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Ad Placements</Label>
                                        <div className="space-y-2">
                                          {['landing', 'browse', 'detail'].map((placement) => (
                                            <div key={placement} className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`new-placement-${placement}`}
                                                checked={selectedPlacements.includes(placement)}
                                                onCheckedChange={() => handleTogglePlacement(placement)}
                                              />
                                              <label
                                                htmlFor={`new-placement-${placement}`}
                                                className="text-sm font-medium capitalize cursor-pointer"
                                              >
                                                {placement} Page
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="new-adPrice">Price per View/Click (₹)</Label>
                                        <Input
                                          id="new-adPrice"
                                          type="number"
                                          min="0"
                                          step="0.5"
                                          value={adPrice}
                                          onChange={(e) => setAdPrice(parseFloat(e.target.value) || 0)}
                                          placeholder="e.g., 1.5"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="new-adBudget">Total Budget (₹)</Label>
                                        <Input
                                          id="new-adBudget"
                                          type="number"
                                          min="0"
                                          step="100"
                                          value={adBudget}
                                          onChange={(e) => setAdBudget(parseFloat(e.target.value) || 0)}
                                          placeholder="e.g., 5000"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Ad will stop when budget is exhausted
                                        </p>
                                      </div>

                                      <div className="flex gap-2 pt-4">
                                        <Button
                                          onClick={handleSaveAd}
                                          disabled={submitting || selectedPlacements.length === 0}
                                          className="flex-1"
                                        >
                                          {submitting ? 'Creating...' : 'Create Ad'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingVehicle(null)}
                                          disabled={submitting}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
