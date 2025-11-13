import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  User,
  Settings,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface Vendor {
  _id: string
  userId: string
  name: string
  businessName: string
  email: string
  phone: string
  services: string[]
  rating: number
  totalBookings: number
  completedBookings: number
  verificationStatus: 'pending' | 'verified' | 'rejected'
  isActive: boolean
}

interface ServiceBooking {
  _id: string
  serviceType: string
  quantity: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed'
  createdAt: string
  scheduledDate?: string
  instituteId: string
  rating?: number
  review?: string
}

const VendorDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [editDialog, setEditDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null)
  const [statusDialog, setStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [ratingDialog, setRatingDialog] = useState(false)
  const [selectedRating, setSelectedRating] = useState(5)
  const [selectedReview, setSelectedReview] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    fetchVendorData()
  }, [user, navigate])

  const fetchVendorData = async () => {
    try {
      // Try to get vendor profile
      const response = await fetch(`/api/professional-services/vendors?userId=${user?.id}`)
      const result = await response.json()

      if (result.data && result.data.length > 0) {
        setVendor(result.data[0])
        fetchBookings(result.data[0]._id)
      } else {
        // Vendor not registered yet
        setVendor(null)
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load vendor data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/professional-services/bookings/vendor/${vendorId}`)
      const result = await response.json()

      if (result.success) {
        setBookings(result.data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const getServiceName = (type: string) => {
    const names: Record<string, string> = {
      photography: 'Professional Photography',
      inspection: 'Vehicle Inspection',
      listing_optimization: 'Listing Optimization',
      bulk_upload: 'Bulk Upload Service'
    }
    return names[type] || type
  }

  const handleStatusUpdate = async () => {
    if (!selectedBooking) return

    try {
      const response = await fetch(
        `/api/professional-services/bookings/${selectedBooking._id}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Booking status updated'
        })
        setStatusDialog(false)
        fetchVendorData()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update status',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive'
      })
    }
  }

  const handleAddReview = async () => {
    if (!selectedBooking) return

    try {
      const response = await fetch(`/api/professional-services/bookings/${selectedBooking._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          review: selectedReview
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Review added successfully'
        })
        setRatingDialog(false)
        setSelectedRating(5)
        setSelectedReview('')
        fetchVendorData()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add review',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error adding review:', error)
      toast({
        title: 'Error',
        description: 'Failed to add review',
        variant: 'destructive'
      })
    }
  }

  const stats = [
    {
      label: 'Total Bookings',
      value: vendor?.totalBookings || 0,
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      label: 'Completed',
      value: vendor?.completedBookings || 0,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Rating',
      value: vendor?.rating?.toFixed(1) || '0',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      label: 'Verification',
      value: vendor?.verificationStatus || 'pending',
      icon: AlertCircle,
      color: 'text-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading Vendor Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Not Registered as Vendor</h2>
            <p className="text-muted-foreground mb-6">
              Start earning by registering as a service vendor. Offer professional services to institutes and grow your business.
            </p>
            <Button className="w-full" onClick={() => navigate('/vendor-registration')}>
              Register as Vendor
            </Button>
            <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <div className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{vendor.businessName}</h1>
              <p className="text-muted-foreground">{vendor.name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          {vendor.verificationStatus === 'pending' && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Your vendor profile is pending verification. Please wait for admin approval.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color} opacity-50`} />
                </div>
              </Card>
            )
          })}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto gap-2 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Bookings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-semibold">{vendor.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{vendor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{vendor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <Badge className="mt-1">
                    {vendor.verificationStatus === 'verified' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      vendor.verificationStatus
                    )}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {vendor.services.map((service) => (
                  <Badge key={service} variant="secondary">
                    {getServiceName(service)}
                  </Badge>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{getServiceName(booking.serviceType)}</TableCell>
                      <TableCell>{booking.quantity}</TableCell>
                      <TableCell>₹{booking.totalAmount}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'}
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setStatusDialog(true)
                            }}
                          >
                            Update
                          </Button>
                          {booking.status === 'completed' && !booking.rating && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setRatingDialog(true)
                              }}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No bookings yet</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <option value="">Select Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleStatusUpdate}>
                Update
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setStatusDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialog} onOpenChange={setRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Review from Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-2">Rating (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Button
                    key={i}
                    variant={selectedRating === i ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRating(i)}
                    className="flex-1"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    {i}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-2">Review</label>
              <textarea
                className="w-full p-2 border rounded-lg min-h-[100px]"
                value={selectedReview}
                onChange={(e) => setSelectedReview(e.target.value)}
                placeholder="Enter customer review..."
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleAddReview}>
                Submit
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setRatingDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VendorDashboard
