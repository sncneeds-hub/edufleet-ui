import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bus, Shield, CheckCircle, Users, ArrowRight, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { getVariant, trackConversion } from '@/lib/abTesting'
import { useAuth } from '@/hooks/useAuth'
import { AdSection } from '@/components/ad/AdSection'

interface Vehicle {
  id: string
  brand?: string
  make?: string
  model: string
  year: number
  price: number
  images?: string | string[]
  condition: string
  seatingCapacity?: number
  vehicleType?: string
}

interface Stats {
  totalInstitutes: number
  totalVehicles: number
  totalSales: number
}

export function LandingPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([])
  const [stats, setStats] = useState<Stats>({ totalInstitutes: 0, totalVehicles: 0, totalSales: 0 })
  const [vehiclesLoading, setVehiclesLoading] = useState(true)

  // A/B Testing variants
  const heroHeadlineVariant = getVariant('heroHeadline')
  const primaryCTAVariant = getVariant('primaryCTA')
  const secondaryCTAVariant = getVariant('secondaryCTA')

  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success('Welcome to EduFleet!', {
        description: 'India\'s most trusted educational vehicle marketplace',
        duration: 4000
      })
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const loadFeaturedData = useCallback(async () => {
    try {
      setVehiclesLoading(true)
      // Load featured vehicles (approved vehicles)
      const vehiclesData = await api.vehicles.getAll({
        status: 'approved',
        soldStatus: 'available'
      })

      // Load institutes count
      const institutesData = await api.institutes.getAll('approved')

      // Ensure we have valid data before setting state
      if (Array.isArray(vehiclesData) && Array.isArray(institutesData)) {
        setFeaturedVehicles(vehiclesData.slice(0, 6) as Vehicle[])
        setStats({
          totalInstitutes: institutesData.length,
          totalVehicles: vehiclesData.length,
          totalSales: Math.floor(Math.random() * 50) + 100
        })
      } else {
        // Invalid response format - use fallback
        setFeaturedVehicles(getFallbackVehicles())
        setStats(getFallbackStats())
      }
    } catch (error: any) {
      // Network error or other failure - use fallback data
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network') || !error.response) {
        console.log('Backend not available - using fallback data')
      } else {
        console.error('Failed to load featured data:', error)
      }
      setFeaturedVehicles(getFallbackVehicles())
      setStats(getFallbackStats())
    } finally {
      setVehiclesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFeaturedData()
  }, [loadFeaturedData])

  // Fallback data in case backend is unavailable
  const getFallbackVehicles = (): Vehicle[] => [
    {
      id: 'demo-1',
      brand: 'Tata',
      make: 'Tata',
      model: 'School Bus Pro',
      year: 2022,
      price: 850000,
      condition: 'excellent',
      seatingCapacity: 45,
      vehicleType: 'School Bus'
    },
    {
      id: 'demo-2',
      brand: 'Mahindra',
      make: 'Mahindra',
      model: 'Transport Van',
      year: 2021,
      price: 620000,
      condition: 'good',
      seatingCapacity: 20,
      vehicleType: 'Van'
    },
    {
      id: 'demo-3',
      brand: 'Ashok Leyland',
      make: 'Ashok Leyland',
      model: 'City Bus',
      year: 2020,
      price: 750000,
      condition: 'good',
      seatingCapacity: 50,
      vehicleType: 'Bus'
    },
    {
      id: 'demo-4',
      brand: 'Force Motors',
      make: 'Force Motors',
      model: 'School Tempo',
      year: 2023,
      price: 450000,
      condition: 'excellent',
      seatingCapacity: 14,
      vehicleType: 'Tempo'
    },
    {
      id: 'demo-5',
      brand: 'Tata',
      make: 'Tata',
      model: 'Magna Bus',
      year: 2019,
      price: 680000,
      condition: 'excellent',
      seatingCapacity: 40,
      vehicleType: 'School Bus'
    },
    {
      id: 'demo-6',
      brand: 'Isuzu',
      make: 'Isuzu',
      model: 'School Coach',
      year: 2021,
      price: 920000,
      condition: 'excellent',
      seatingCapacity: 48,
      vehicleType: 'Coach'
    }
  ]

  const getFallbackStats = () => ({
    totalInstitutes: 500,
    totalVehicles: 156,
    totalSales: 324
  })

  const getFeaturedImage = (vehicle: Vehicle) => {
    if (Array.isArray(vehicle.images)) {
      return vehicle.images[0] || 'https://storage.googleapis.com/blink-core-storage/projects/edufleetphase30-3-sma0i152/images/generated-image-1762623375424-0.webp'
    } else if (typeof vehicle.images === 'string') {
      try {
        const images = JSON.parse(vehicle.images)
        return Array.isArray(images) ? images[0] : 'https://storage.googleapis.com/blink-core-storage/projects/edufleetphase30-3-sma0i152/images/generated-image-1762623375424-0.webp'
      } catch {
        return 'https://storage.googleapis.com/blink-core-storage/projects/edufleetphase30-3-sma0i152/images/generated-image-1762623375424-0.webp'
      }
    }
    return 'https://storage.googleapis.com/blink-core-storage/projects/edufleetphase30-3-sma0i152/images/generated-image-1762623375424-0.webp'
  }

  const handleRegisterClick = () => {
    trackConversion('heroHeadline', 'click')
    trackConversion('primaryCTA', 'click')
    navigate('/register')
  }

  const handleBrowseClick = () => {
    trackConversion('secondaryCTA', 'click')
    navigate('/vehicles')
  }

  const handleVehicleClick = (vehicleId: string) => {
    // Allow all users (logged in or not) to view vehicle details
    navigate(`/vehicles/${vehicleId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              EduFleet
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="hover:bg-primary/10"
              onClick={() => navigate('/pricing')}
            >
              Pricing
            </Button>
            {isAuthenticated && user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="hover:bg-primary/10 flex items-center gap-2"
                  onClick={() => navigate(user.role === 'admin' ? '/dashboard' : '/school')}
                >
                  <User className="h-4 w-4" />
                  {user.displayName || user.email}
                </Button>
                {user.role === 'admin' && (
                  <Button 
                    variant="outline" 
                    className="hover:border-primary hover:bg-primary/5" 
                    onClick={() => navigate('/tasks')}
                  >
                    Tasks
                  </Button>
                )}
                <Button 
                  className="shadow-md hover:shadow-lg transition-all" 
                  onClick={() => navigate(user.role === 'admin' ? '/dashboard' : '/school')}
                >
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="hover:bg-primary/10" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button className="shadow-md hover:shadow-lg transition-all" onClick={() => navigate('/register')}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Two Column Layout with Illustration */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Enhanced Decorative elements with animation */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-float-up" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 animate-float-up" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-primary/5 rounded-full blur-2xl animate-float-up" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Content */}
            <div className="text-center md:text-left">
              {/* Badge with enhanced styling */}
              <div className="inline-block mb-6 px-5 py-2.5 bg-white/70 backdrop-blur-md rounded-full border border-primary/20 animate-fade-in-up shadow-lg hover:shadow-xl transition-all group cursor-default">
                <span className="text-primary font-semibold text-sm flex items-center gap-2">
                  <span className="text-lg animate-bounce">🚌</span>
                  India's #1 Trusted Educational Vehicle Marketplace
                </span>
              </div>
              
              {/* Main headline with enhanced styling */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {heroHeadlineVariant.content.split(' ').slice(0, -4).join(' ')}{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-pulse" style={{ '--duration': '3s' } as any}>
                  {heroHeadlineVariant.content.split(' ').slice(-4).join(' ')}
                </span>
              </h2>
              
              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed animate-fade-in-up font-light" style={{ animationDelay: '0.2s' }}>
                Connect with 500+ verified institutes. Buy and sell pre-owned buses, vans, and school vehicles 
                through India's only <span className="font-semibold text-foreground">admin-approved</span> marketplace.
              </p>
              
              {/* CTA Buttons with enhanced styling */}
              <div className="flex gap-4 justify-center md:justify-start flex-wrap mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Button 
                  size="lg" 
                  className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  onClick={handleRegisterClick}
                >
                  <Users className="mr-2 md:mr-3 h-5 md:h-6 w-5 md:w-6 group-hover:animate-bounce transition-transform" />
                  {primaryCTAVariant.content}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 border-2 border-primary/30 hover:border-primary/60 bg-white/60 hover:bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={handleBrowseClick}
                >
                  {secondaryCTAVariant.content}
                  <ArrowRight className="ml-2 md:ml-3 h-5 md:h-6 w-5 md:w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              {/* Enhanced Trust indicators */}
              <div className="flex gap-6 justify-center md:justify-start items-center text-sm flex-wrap animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 hover:text-primary transition-all cursor-default hover:scale-110 group">
                  <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground text-xs">100% Verified</div>
                    <div className="text-[10px] text-muted-foreground">Admin approved</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-all cursor-default hover:scale-110 group">
                  <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground text-xs">Quality First</div>
                    <div className="text-[10px] text-muted-foreground">Reviewed listings</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-all cursor-default hover:scale-110 group">
                  <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Bus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground text-xs">Zero Commission</div>
                    <div className="text-[10px] text-muted-foreground">100% transparent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Illustration/Image */}
            <div className="relative animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                <img 
                  src="https://storage.googleapis.com/blink-core-storage/projects/edufleetphase20-3-pghvye9r/images/generated-image-1762619100386-0.webp"
                  alt="School Bus Fleet"
                  className="w-full h-auto object-cover"
                />
                {/* Overlay gradient for better integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
              </div>
              
              {/* Floating elements around illustration */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-2xl rotate-12 animate-float-up blur-sm" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/30 rounded-full animate-float-up blur-sm" style={{ animationDelay: '1s' }} />
              
              {/* Stats badge floating on image */}
              <div className="absolute top-4 -left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 animate-slide-in-up border border-primary/20" style={{ animationDelay: '0.6s' }}>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Verified Institutes</div>
              </div>
              
              <div className="absolute bottom-4 -right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 animate-slide-in-up border border-primary/20" style={{ animationDelay: '0.8s' }}>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-xs text-muted-foreground">Safe & Secure</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section with Animated Counters */}
      <section className="py-20 px-4 bg-gradient-to-r from-secondary/30 via-secondary/50 to-secondary/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group cursor-default hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-6 group-hover:shadow-lg transition-shadow">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform tabular-nums">
                {stats.totalInstitutes > 0 ? `${stats.totalInstitutes}+` : '500+'}
              </div>
              <p className="text-foreground font-semibold text-lg">Verified Institutes</p>
              <p className="text-sm text-muted-foreground mt-2">Trusted educational partners nationwide</p>
            </div>
            <div className="text-center group cursor-default hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-6 group-hover:shadow-lg transition-shadow">
                <Bus className="h-10 w-10 text-primary" />
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform tabular-nums">
                {stats.totalVehicles > 0 ? `${stats.totalVehicles}+` : '50+'}
              </div>
              <p className="text-foreground font-semibold text-lg">Active Listings</p>
              <p className="text-sm text-muted-foreground mt-2">Quality vehicles ready for sale</p>
            </div>
            <div className="text-center group cursor-default hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-6 group-hover:shadow-lg transition-shadow">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform tabular-nums">
                {stats.totalSales > 0 ? `${stats.totalSales}+` : '150+'}
              </div>
              <p className="text-foreground font-semibold text-lg">Successful Deals</p>
              <p className="text-sm text-muted-foreground mt-2">Happy transactions & counting</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promoted Ads Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-secondary/20 to-white">
        <div className="container mx-auto">
          <AdSection 
            pageLocation="landing" 
            title="Featured Premium Vehicles"
            className="mb-8"
          />
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-secondary/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">Latest Vehicle Listings</h3>
              <p className="text-base md:text-lg text-muted-foreground">Handpicked quality vehicles from verified institutes</p>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={handleBrowseClick}
            >
              See Full Inventory
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {vehiclesLoading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-muted rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : featuredVehicles.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredVehicles.map((vehicle, index) => {
                const featuredImage = getFeaturedImage(vehicle)
                return (
                  <Card 
                    key={vehicle.id} 
                    className={`overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-primary/50 group hover:-translate-y-2 animate-slide-in-up vehicle-card-stagger-${(index % 6) + 1}`}
                    onClick={() => handleVehicleClick(vehicle.id)}
                  >
                    <div className="aspect-[3/2] bg-muted relative overflow-hidden flex items-center justify-center">
                      <img
                        src={featuredImage}
                        alt={`${vehicle.brand || 'Vehicle'} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-2 right-2 capitalize shadow-lg backdrop-blur-sm bg-white/90 text-foreground border-0 text-xs">
                        {vehicle.condition}
                      </Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-3 space-y-2">
                      <div>
                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {vehicle.brand || 'Vehicle'} {vehicle.model}
                        </h4>
                        <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{vehicle.seatingCapacity || 0} seats</span>
                      </div>
                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="font-bold text-primary text-sm">
                          ₹{(vehicle.price / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-16 text-center border-2 border-dashed">
              <div className="max-w-md mx-auto">
                <Bus className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
                <h4 className="text-2xl font-semibold mb-3">No Vehicles Yet</h4>
                <p className="text-muted-foreground mb-6">
                  Be among the first institutions to list vehicles on EduFleet
                </p>
                <Button size="lg" onClick={() => navigate('/register')}>
                  <Users className="mr-2 h-5 w-5" />
                  Register & List Your Vehicle
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Why Choose EduFleet?</h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for educational institutions with trust and transparency at its core
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-2 border-primary/20 hover:border-primary/60 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-primary/2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 transition-transform shadow-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">100% Verified Partners</h4>
              <p className="text-muted-foreground leading-relaxed">
              Every educational institution is manually verified by our admin team before approval. 
              Zero fake listings, zero scams – only genuine institutes you can trust.
              </p>
            </Card>
            <Card className="p-8 border-2 border-primary/20 hover:border-primary/60 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-primary/2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 transition-transform shadow-lg">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Quality-Checked Listings</h4>
              <p className="text-muted-foreground leading-relaxed">
              Every vehicle ad is reviewed for accuracy and completeness before going live. 
              No spam, no low-quality posts – browse with peace of mind.
              </p>
            </Card>
            <Card className="p-8 border-2 border-primary/20 hover:border-primary/60 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-primary/2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 transition-transform shadow-lg">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Zero Commission Model</h4>
              <p className="text-muted-foreground leading-relaxed">
              Connect directly with buyers and sellers – no middlemen eating into your budget. 
              Keep 100% of your sale price with our completely free platform.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h3>
            <p className="text-base md:text-lg text-muted-foreground">
              Get started in three simple steps and join the EduFleet community
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            <div className="relative">
              <Card className="p-8 border-2 hover:shadow-xl transition-all h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-2xl mb-6 shadow-lg">
                  1
                </div>
                <h4 className="text-2xl font-semibold mb-3">Register Your Institution</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Sign up with your institution's details including registration documents. 
                  Our admin team will verify and approve within 24-48 hours.
                </p>
              </Card>
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-8 border-2 hover:shadow-xl transition-all h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-2xl mb-6 shadow-lg">
                  2
                </div>
                <h4 className="text-2xl font-semibold mb-3">List Your Vehicles</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Create detailed listings with photos, specifications, and pricing. 
                  Each listing is reviewed for quality before going live on the platform.
                </p>
              </Card>
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div>
              <Card className="p-8 border-2 hover:shadow-xl transition-all h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-2xl mb-6 shadow-lg">
                  3
                </div>
                <h4 className="text-2xl font-semibold mb-3">Connect & Trade</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Browse vehicles, send inquiries, and negotiate directly with sellers. 
                  Complete your transaction securely with verified institutions only.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">Join 500+ Institutes Trading on EduFleet</h3>
          <p className="text-base md:text-lg mb-10 text-white/90 leading-relaxed">
            List your vehicle in under 5 minutes. Get inquiries from verified buyers. 
            Close deals faster with India's most trusted educational vehicle marketplace.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
              onClick={handleRegisterClick}
            >
              <Users className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              List Your First Vehicle – Free
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all hover:scale-105" 
              onClick={handleBrowseClick}
            >
              Find Your Next Vehicle
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/70 rounded-xl flex items-center justify-center">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">EduFleet</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                India's trusted marketplace for buying and selling school vehicles. 
                Connecting educational institutions nationwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate('/vehicles')} className="hover:text-primary transition-colors">
                    Browse Vehicles
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/pricing')} className="hover:text-primary transition-colors">
                    Pricing Plans
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/register')} className="hover:text-primary transition-colors">
                    Register Institute
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/auth')} className="hover:text-primary transition-colors">
                    Sign In
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">How It Works</li>
                <li className="hover:text-primary transition-colors cursor-pointer">FAQ</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Support</li>
                <li>
                  <a href="/download.html" target="_blank" className="hover:text-primary transition-colors">
                    Download Project
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: support@edufleet.com</li>
                <li>Phone: +91 1800-XXX-XXXX</li>
                <li className="flex gap-2 pt-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 cursor-pointer transition-colors">
                    <span className="text-xs">📧</span>
                  </div>
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 cursor-pointer transition-colors">
                    <span className="text-xs">🐦</span>
                  </div>
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 cursor-pointer transition-colors">
                    <span className="text-xs">📱</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 EduFleet. All rights reserved. Made with ❤️ for educational institutions.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}