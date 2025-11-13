import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  XCircle,
  Star,
  Users,
  AlertCircle,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Service {
  _id: string
  serviceType: string
  title: string
  description: string
  price: number
  features: string[]
  active: boolean
}

interface Vendor {
  _id: string
  businessName: string
  name: string
  email: string
  phone: string
  rating: number
  completedBookings: number
  verificationStatus: 'pending' | 'verified' | 'rejected'
  isActive: boolean
}

interface ServiceBooking {
  _id: string
  serviceType: string
  quantity: number
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  instituteName?: string
  vendorName?: string
}

const ProfessionalServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('services')
  const [serviceDialog, setServiceDialog] = useState(false)
  const [vendorDialog, setVendorDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesRes, vendorsRes, bookingsRes] = await Promise.all([
        fetch('/api/professional-services/services'),
        fetch('/api/professional-services/vendors'),
        fetch('/api/professional-services/analytics/overview')
      ])

      if (servicesRes.ok) {
        const data = await servicesRes.json()
        setServices(data.data)
      }

      if (vendorsRes.ok) {
        const data = await vendorsRes.json()
        setVendors(data.data)
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        setBookings(data.data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load professional services data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/professional-services/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: 'verified' })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Vendor verified successfully'
        })
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify vendor',
        variant: 'destructive'
      })
    }
  }

  const handleRejectVendor = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/professional-services/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: 'rejected' })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Vendor rejected'
        })
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject vendor',
        variant: 'destructive'
      })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <div className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Professional Services Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage services, vendors, and bookings for the marketplace
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto gap-2 mb-8">
            <TabsTrigger value="services" className="flex items-center gap-2">
              Services
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              Vendors
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              Bookings
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Services</h2>
              <Button onClick={() => {
                setSelectedService(null)
                setServiceDialog(true)
              }} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service) => (
                <Card key={service._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-sm">{getServiceName(service.serviceType)}</h3>
                    <Badge variant={service.active ? 'default' : 'secondary'}>
                      {service.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                  <p className="text-xl font-bold text-primary mb-3">₹{service.price}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                      setSelectedService(service)
                      setServiceDialog(true)
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {services.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services yet</p>
              </div>
            )}
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <h2 className="text-2xl font-bold">Service Vendors</h2>

            <div className="space-y-4">
              {/* Pending Vendors */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Pending Verification
                </h3>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors
                      .filter((v) => v.verificationStatus === 'pending')
                      .map((vendor) => (
                        <TableRow key={vendor._id}>
                          <TableCell className="font-medium">{vendor.businessName}</TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell>{vendor.services.length} services</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-600" />
                              {vendor.rating.toFixed(1)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => handleVerifyVendor(vendor._id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleRejectVendor(vendor._id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {/* Verified Vendors */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Verified Vendors
                </h3>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors
                      .filter((v) => v.verificationStatus === 'verified')
                      .map((vendor) => (
                        <TableRow key={vendor._id}>
                          <TableCell className="font-medium">{vendor.businessName}</TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell>{vendor.services.length}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                              {vendor.rating.toFixed(1)}/5
                            </div>
                          </TableCell>
                          <TableCell>{vendor.completedBookings}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {vendor.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {vendors.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No vendors registered yet</p>
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">Service Bookings</h2>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Date</TableHead>
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
                      <Badge variant={booking.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {bookings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No bookings yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Service Dialog */}
      <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {selectedService ? 'Update service details' : 'Create a new professional service offering'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Service Type</label>
              <Input placeholder="e.g., Photography" disabled={!!selectedService} />
            </div>
            <div>
              <label className="text-sm font-semibold">Title</label>
              <Input placeholder="Professional Photography" />
            </div>
            <div>
              <label className="text-sm font-semibold">Price (₹)</label>
              <Input type="number" placeholder="2499" />
            </div>
            <div>
              <label className="text-sm font-semibold">Description</label>
              <Textarea placeholder="Service description..." />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Save Service</Button>
              <Button variant="outline" className="flex-1" onClick={() => setServiceDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProfessionalServicesManagement
