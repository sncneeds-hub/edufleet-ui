import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Camera, CheckCircle, Star, Users, TrendingUp, Filter, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface Service {
  _id: string
  serviceType: string
  title: string
  description: string
  price: number
  duration?: number
  features: string[]
  active: boolean
}

interface Vendor {
  _id: string
  businessName: string
  name: string
  rating: number
  completedBookings: number
  services: string[]
  description: string
  profileImage?: string
}

const ServicesMarketplace = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [selectedTab, setSelectedTab] = useState('services')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [bookingDialog, setBookingDialog] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    fetchServices()
    fetchVendors()
  }, [user, navigate])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/professional-services/services')
      const result = await response.json()
      if (result.success) {
        setServices(result.data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive'
      })
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/professional-services/vendors')
      const result = await response.json()
      if (result.success) {
        setVendors(result.data)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast({
        title: 'Error',
        description: 'Failed to load vendors',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (type: string) => {
    const icons: Record<string, any> = {
      photography: <Camera className="h-6 w-6 text-blue-600" />,
      inspection: <CheckCircle className="h-6 w-6 text-green-600" />,
      listing_optimization: <TrendingUp className="h-6 w-6 text-purple-600" />,
      bulk_upload: <Users className="h-6 w-6 text-orange-600" />
    }
    return icons[type] || <Camera className="h-6 w-6" />
  }

  const getServiceTitle = (type: string) => {
    const titles: Record<string, string> = {
      photography: 'Professional Photography',
      inspection: 'Vehicle Inspection',
      listing_optimization: 'Listing Optimization',
      bulk_upload: 'Bulk Upload Service'
    }
    return titles[type] || type
  }

  const getServiceDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      photography: 'Professional photos to showcase your vehicles beautifully',
      inspection: 'Comprehensive vehicle inspection and condition report',
      listing_optimization: 'SEO optimization for better visibility in searches',
      bulk_upload: 'Upload multiple vehicles at once with assistance'
    }
    return descriptions[type] || ''
  }

  const handleBookService = async (vendor: Vendor) => {
    if (!selectedService) return

    try {
      const totalAmount = selectedService.price * quantity

      // Create order
      const orderResponse = await fetch('/api/professional-services/bookings/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instituteId: user?.id,
          vendorId: vendor._id,
          serviceType: selectedService.serviceType,
          quantity,
          price: selectedService.price
        })
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error)
      }

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || '',
        amount: totalAmount * 100,
        currency: 'INR',
        order_id: orderData.orderId,
        name: 'Professional Services',
        description: `${selectedService.title} - ${quantity} unit(s)`,
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch('/api/professional-services/bookings/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instituteId: user?.id,
              vendorId: vendor._id,
              serviceType: selectedService.serviceType,
              quantity,
              price: selectedService.price,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              notes: `Booking service: ${selectedService.title}`
            })
          })

          if (verifyResponse.ok) {
            toast({
              title: 'Success!',
              description: 'Service booked successfully. Vendor will contact you soon.'
            })
            setBookingDialog(false)
            setQuantity(1)
          } else {
            toast({
              title: 'Error',
              description: 'Payment verification failed',
              variant: 'destructive'
            })
          }
        },
        prefill: {
          email: user?.email || '',
          name: user?.name || ''
        }
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        const rzp1 = new (window as any).Razorpay(options)
        rzp1.open()
      }
      document.body.appendChild(script)
    } catch (error) {
      console.error('Error booking service:', error)
      toast({
        title: 'Error',
        description: 'Failed to book service',
        variant: 'destructive'
      })
    }
  }

  const filteredServices = services.filter((service) => {
    if (filterType !== 'all' && service.serviceType !== filterType) return false
    if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const filteredVendors = vendors.filter((vendor) => {
    if (searchQuery && !vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading Services Marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <div className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Professional Services Marketplace
              </h1>
              <p className="text-muted-foreground mt-2">
                Connect with verified service providers to grow your vehicle listings
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
              Back to Dashboard
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services or vendors..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <option value="all">All Services</option>
              <option value="photography">Photography</option>
              <option value="inspection">Inspection</option>
              <option value="listing_optimization">Listing Optimization</option>
              <option value="bulk_upload">Bulk Upload</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full md:w-auto gap-2 mb-8">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Vendors
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service._id}
                  className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => {
                    setSelectedService(service)
                    setBookingDialog(true)
                  }}
                >
                  <div className="p-6">
                    {/* Icon */}
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                      {getServiceIcon(service.serviceType)}
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-lg font-semibold mb-2">{getServiceTitle(service.serviceType)}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{getServiceDescription(service.serviceType)}</p>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">₹{service.price}</div>
                      <Badge variant="outline">Per Unit</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No services found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <Card key={vendor._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="p-6">
                    {/* Vendor Header */}
                    <div className="flex items-start justify-between mb-4">
                      {vendor.profileImage ? (
                        <img
                          src={vendor.profileImage}
                          alt={vendor.businessName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <Badge className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {vendor.rating.toFixed(1)}
                      </Badge>
                    </div>

                    {/* Business Name */}
                    <h3 className="text-lg font-semibold mb-1">{vendor.businessName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{vendor.name}</p>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{vendor.description}</p>

                    {/* Services */}
                    <div className="mb-4 flex flex-wrap gap-1">
                      {vendor.services.map((service, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {getServiceTitle(service)}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-semibold">{vendor.completedBookings}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-semibold">{vendor.rating}/5</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button className="w-full" onClick={() => setSelectedVendor(vendor)}>
                      View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {filteredVendors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No vendors found matching your criteria</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Service Booking Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
            <DialogDescription>
              {selectedService && `${getServiceTitle(selectedService.serviceType)} - ₹${selectedService.price} per unit`}
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-6">
              {/* Service Details */}
              <div className="space-y-2">
                <h4 className="font-semibold">Service Details</h4>
                <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                <div className="pt-2 space-y-1">
                  {selectedService.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </Button>
                  <span className="text-lg font-semibold">{quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                    +
                  </Button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price per unit</span>
                  <span>₹{selectedService.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{selectedService.price * quantity}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {vendors.map((vendor) => (
                  <Button
                    key={vendor._id}
                    className="w-full"
                    onClick={() => handleBookService(vendor)}
                  >
                    Book with {vendor.businessName}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ServicesMarketplace
