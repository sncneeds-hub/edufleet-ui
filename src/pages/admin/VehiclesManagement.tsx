import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, XCircle, Clock, Search, Image as ImageIcon, Download, Filter, RefreshCw } from 'lucide-react'
import { blink } from '@/lib/blink'
import { api } from '@/lib/api'
import { Vehicle } from '@/types'
import toast from 'react-hot-toast'

export function VehiclesManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 5000000 })

  const filterVehicles = useCallback(() => {
    let filtered = vehicles

    // Filter by status
    if (activeTab === 'pending') {
      filtered = filtered.filter(v => v.approvalStatus === 'pending')
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(v => v.approvalStatus === 'approved')
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(v => v.approvalStatus === 'rejected')
    }

    // Filter by vehicle type
    if (vehicleTypeFilter !== 'all') {
      filtered = filtered.filter(v => v.vehicleType === vehicleTypeFilter)
    }

    // Filter by condition
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(v => v.condition === conditionFilter)
    }

    // Filter by price range
    filtered = filtered.filter(v => v.price >= priceRange.min && v.price <= priceRange.max)

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(v =>
        v.brand.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.vehicleType.toLowerCase().includes(query) ||
        v.instituteName.toLowerCase().includes(query) ||
        v.registrationNumber.toLowerCase().includes(query)
      )
    }

    setFilteredVehicles(filtered)
  }, [vehicles, searchQuery, activeTab, vehicleTypeFilter, conditionFilter, priceRange])

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [filterVehicles])

  const loadVehicles = async () => {
    try {
      const data = await api.vehicles.getAll()
      setVehicles(data as Vehicle[])
    } catch (error) {
      toast.error('Failed to load vehicles')
      console.error('Failed to load vehicles:', error)
    }
  }

  const handleApprove = async (vehicle: Vehicle) => {
    setLoading(true)
    try {
      await api.vehicles.approve(vehicle.id)
      toast.success(`${vehicle.brand} ${vehicle.model} has been approved!`)
      loadVehicles()
    } catch (error) {
      toast.error('Failed to approve vehicle')
      console.error('Failed to approve vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedVehicle || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setLoading(true)
    try {
      await api.vehicles.reject(selectedVehicle.id, rejectionReason)
      toast.success('Vehicle has been rejected')
      setShowRejectDialog(false)
      setRejectionReason('')
      setSelectedVehicle(null)
      loadVehicles()
    } catch (error) {
      toast.error('Failed to reject vehicle')
      console.error('Failed to reject vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Institute', 'Type', 'Brand', 'Model', 'Year', 'Registration', 'Price', 'Condition', 'Status', 'Created At']
    const rows = filteredVehicles.map(v => [
      v.id,
      v.instituteName,
      v.vehicleType,
      v.brand,
      v.model,
      v.year,
      v.registrationNumber,
      v.price,
      v.condition,
      v.approvalStatus,
      new Date(v.createdAt).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vehicles-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Exported to CSV')
  }

  const resetFilters = () => {
    setSearchQuery('')
    setVehicleTypeFilter('all')
    setConditionFilter('all')
    setPriceRange({ min: 0, max: 5000000 })
    toast.success('Filters reset')
  }

  const pendingCount = vehicles.filter(v => v.approvalStatus === 'pending').length
  const approvedCount = vehicles.filter(v => v.approvalStatus === 'approved').length
  const rejectedCount = vehicles.filter(v => v.approvalStatus === 'rejected').length

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const imageUrl = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null
    
    return (
      <Card>
        <CardHeader>
          <div className="flex gap-4">
            {imageUrl && (
              <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!imageUrl && (
              <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-lg">{vehicle.brand} {vehicle.model} ({vehicle.year})</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Reg. No: {vehicle.registrationNumber}</p>
                </div>
                <Badge variant={
                  vehicle.approvalStatus === 'approved' ? 'default' :
                  vehicle.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                }>
                  {vehicle.approvalStatus}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Institute: {vehicle.instituteName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{vehicle.vehicleType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fuel</p>
              <p className="font-medium capitalize">{vehicle.fuelType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Seats</p>
              <p className="font-medium">{vehicle.seatingCapacity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mileage</p>
              <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Condition</p>
              <p className="font-medium capitalize">{vehicle.condition}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-medium">₹{vehicle.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{vehicle.soldStatus}</p>
            </div>
          </div>

          {vehicle.description && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Description</p>
              <p className="font-medium line-clamp-2">{vehicle.description}</p>
            </div>
          )}

          {vehicle.features && vehicle.features.length > 0 && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.slice(0, 5).map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {vehicle.features.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{vehicle.features.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {vehicle.rejectionReason && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm">
              <p className="font-medium text-destructive mb-1">Rejection Reason:</p>
              <p className="text-muted-foreground">{vehicle.rejectionReason}</p>
            </div>
          )}

          {vehicle.approvalStatus === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => handleApprove(vehicle)}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => {
                  setSelectedVehicle(vehicle)
                  setShowRejectDialog(true)
                }}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout activeTab="vehicles">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Vehicle Management</h2>
            <p className="text-muted-foreground">Review and approve vehicle listings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => loadVehicles()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredVehicles.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by brand, model, type, registration, or institute..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                  <SelectTrigger id="vehicleType">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="minibus">Minibus</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="All conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="needs-repair">Needs Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Showing {filteredVehicles.length} of {vehicles.length} vehicles</span>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="h-4 w-4 mr-2" />
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {filteredVehicles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {searchQuery ? 'No vehicles match your search' : 'No pending vehicle listings'}
                </CardContent>
              </Card>
            ) : (
              filteredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {filteredVehicles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {searchQuery ? 'No vehicles match your search' : 'No approved vehicles yet'}
                </CardContent>
              </Card>
            ) : (
              filteredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filteredVehicles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {searchQuery ? 'No vehicles match your search' : 'No rejected vehicles'}
                </CardContent>
              </Card>
            ) : (
              filteredVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vehicle Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedVehicle?.brand} {selectedVehicle?.model}'s listing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading || !rejectionReason.trim()}>
              Reject Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
