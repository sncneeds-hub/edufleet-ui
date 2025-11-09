import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Vehicle } from '@/types'
import { ImageGallery } from '@/components/vehicle/ImageGallery'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Bus, MapPin, Phone, Mail, Fuel, Gauge, Users, Calendar, AlertCircle, User } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

interface Institute {
  _id: string
  id?: string
  instituteName: string
  institutePhone: string
  instituteEmail: string
  instituteAddress: string
}

export function VehicleDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [institute, setInstitute] = useState<Institute | null>(null)
  const [loading, setLoading] = useState(true)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [submittingInquiry, setSubmittingInquiry] = useState(false)

  useEffect(() => {
    loadVehicleDetails()
  }, [id])

  const loadVehicleDetails = async () => {
    try {
      if (!id) {
        toast.error('Vehicle not found')
        navigate('/vehicles')
        return
      }

      const vehicleData = await api.vehicles.getById(id)

      if (!vehicleData) {
        toast.error('Vehicle not found')
        navigate('/vehicles')
        return
      }

      const v = vehicleData as Vehicle

      if (v.approvalStatus !== 'approved' || v.soldStatus !== 'available') {
        toast.error('This vehicle is no longer available')
        navigate('/vehicles')
        return
      }

      setVehicle(v)

      // Load institute details
      try {
        const instituteId = v.instituteId
        if (instituteId) {
          const instituteData = await api.institutes.getById(instituteId)
          if (instituteData) {
            setInstitute(instituteData as Institute)
          }
        }
      } catch (error) {
        console.error('Failed to load institute:', error)
      }
    } catch (error: any) {
      // Network error - silently fail
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
        console.log('Backend not available')
        toast.error('Unable to load vehicle details')
        navigate('/vehicles')
      } else {
        console.error('Failed to load vehicle details:', error)
        toast.error('Failed to load vehicle details')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitInquiry = async () => {
    if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!currentUser) {
      toast.error('Please sign in to send an inquiry')
      navigate('/auth')
      return
    }

    if (currentUser.role !== 'school') {
      toast.error('Only schools can send inquiries')
      return
    }

    // Get sender institute
    try {
      const senderInstitute = await api.institutes.getByUserId(currentUser.id)

      if (!senderInstitute) {
        toast.error('Please complete your institute profile first')
        navigate('/school/profile')
        return
      }

      setSubmittingInquiry(true)

      const vehicleId = vehicle!._id || vehicle!.id
      const senderInstituteId = senderInstitute._id || senderInstitute.id
      
      await api.inquiries.create({
        vehicleId: vehicleId,
        vehicleBrand: vehicle!.brand,
        vehicleModel: vehicle!.vehicleModel || vehicle!.model,
        vehiclePrice: vehicle!.price,
        senderInstituteId: senderInstituteId,
        senderInstituteName: senderInstitute.instituteName,
        receiverInstituteId: vehicle!.instituteId,
        senderEmail: contactName,
        senderPhone: contactPhone,
        message: contactMessage
      })

      toast.success('Inquiry sent successfully!')
      setContactName('')
      setContactPhone('')
      setContactMessage('')
    } catch (error) {
      console.error('Failed to submit inquiry:', error)
      toast.error('Failed to send inquiry')
    } finally {
      setSubmittingInquiry(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Bus className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduFleet</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Bus className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduFleet</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Vehicle not found</p>
          <Button onClick={() => navigate('/vehicles')}>Back to Vehicles</Button>
        </div>
      </div>
    )
  }

  const images = Array.isArray(vehicle.images)
    ? vehicle.images
    : typeof vehicle.images === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(vehicle.images)
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })()
      : []

  const features = Array.isArray(vehicle.features)
    ? vehicle.features
    : typeof vehicle.features === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(vehicle.features)
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })()
      : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Bus className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduFleet</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/vehicles')}>Back</Button>
            {isAuthenticated && currentUser ? (
              <>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2"
                  onClick={() => navigate(currentUser.role === 'admin' ? '/dashboard' : '/school')}
                >
                  <User className="h-4 w-4" />
                  {currentUser.displayName || currentUser.email}
                </Button>
                <Button onClick={() => navigate(currentUser.role === 'admin' ? '/dashboard' : '/school')}>
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
                <Button onClick={() => navigate('/auth?mode=signup')}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {!currentUser && images.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Sign in to view vehicle photos</p>
                  <Button onClick={() => navigate('/auth')}>Sign In</Button>
                </CardContent>
              </Card>
            ) : (
              <ImageGallery
                images={images}
                alt={`${vehicle.brand} ${vehicle.model}`}
              />
            )}

            {/* Vehicle Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">
                  {vehicle.brand} {vehicle.model}
                </CardTitle>
                <CardDescription>
                  {vehicle.registrationNumber ? (
                    <>Registration: {vehicle.registrationNumber} • Year: {vehicle.year}</>
                  ) : (
                    <>Year: {vehicle.year} {!currentUser && ' • Sign in to view registration number'}</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specifications Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Fuel className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="font-semibold capitalize">{vehicle.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Seating Capacity</p>
                      <p className="font-semibold">{vehicle.seatingCapacity} seats</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Gauge className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="font-semibold">{vehicle.mileage?.toLocaleString()} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Condition</p>
                      <p className="font-semibold capitalize">{vehicle.condition}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{vehicle.description}</p>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="capitalize">
                          ✓ {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price and Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="text-4xl font-bold text-primary">₹{vehicle.price?.toLocaleString()}</p>
                  </div>
                  <Badge variant="default" className="w-full justify-center py-2 text-base">
                    Available
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Institute Info Card */}
            {institute && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Institute Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Institute Name</p>
                    <p className="font-medium">{institute.instituteName}</p>
                  </div>
                  {!currentUser ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Sign in to view complete contact details
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      {institute.instituteAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Address</p>
                            <p className="text-sm">{institute.instituteAddress}</p>
                          </div>
                        </div>
                      )}
                      {institute.institutePhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Phone</p>
                            <p className="text-sm">{institute.institutePhone}</p>
                          </div>
                        </div>
                      )}
                      {institute.instituteEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                            <p className="text-sm">{institute.instituteEmail}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Seller Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interested?</CardTitle>
                <CardDescription>Send an inquiry to the seller</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentUser ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please sign in to send an inquiry
                      <Button
                        className="mt-2 w-full"
                        onClick={() => navigate('/auth')}
                      >
                        Sign In
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : currentUser.role !== 'school' ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Only school accounts can send inquiries
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Your Name</Label>
                      <Input
                        id="contact-name"
                        placeholder="Your contact person name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone Number</Label>
                      <Input
                        id="contact-phone"
                        placeholder="+91 1234567890"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Message</Label>
                      <Textarea
                        id="contact-message"
                        placeholder="Tell them why you're interested or ask questions..."
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmitInquiry}
                      disabled={submittingInquiry}
                    >
                      {submittingInquiry ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
