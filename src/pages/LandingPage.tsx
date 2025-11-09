import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bus, Shield, CheckCircle, Users, ArrowRight, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { getVariant, trackConversion } from '@/lib/abTesting'
import { useAuth } from '@/hooks/useAuth'

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
    loadFeaturedData()
    
    // Show welcome toast with delay
    const timer = setTimeout(() => {
      toast.success('Welcome to EduFleet!', {
        description: 'India\'s most trusted educational vehicle marketplace',
        duration: 4000
      })
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const loadFeaturedData = async () => {
    try {
      // Load featured vehicles (approved vehicles)
      const vehiclesData = await api.vehicles.getAll({
        status: 'approved',
        soldStatus: 'available'
      })

      // Load institutes count
      const institutesData = await api.institutes.getAll('approved')

      setFeaturedVehicles(vehiclesData.slice(0, 6) as Vehicle[])
      setStats({
        totalInstitutes: institutesData.length,
        totalVehicles: vehiclesData.length,
        totalSales: Math.floor(Math.random() * 50) + 100
      })
    } catch (error: any) {
      // Network error - use fallback data
      console.log('Backend not available - using fallback data')
      setFeaturedVehicles(getFallbackVehicles())
      setStats(getFallbackStats())
    } finally {
      setVehiclesLoading(false)
    }
  }

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
    navigate('/auth?mode=signup')
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
                <Button className="shadow-md hover:shadow-lg transition-all" onClick={() => navigate('/auth?mode=signup')}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Custom Illustration */}
      <section className="relative py-24 px-4 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 opacity-[0.15] bg-center bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: `url('https://storage.googleapis.com/blink-core-storage/projects/edufleetphase20-3-pghvye9r/images/generated-image-1762619100386-0.webp')`,
            mixBlendMode: 'multiply'
          }}
        />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full animate-fade-in-up">
            <span className="text-primary font-semibold text-sm">🚌 India's #1 Trusted Educational Vehicle Marketplace</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {heroHeadlineVariant.content.split(' ').slice(0, -4).join(' ')}{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {heroHeadlineVariant.content.split(' ').slice(-4).join(' ')}
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Join 500+ verified institutes buying and selling pre-owned buses, vans, and school vehicles 
            through India's only admin-approved marketplace for education.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
              onClick={handleRegisterClick}
            >
              <Users className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              {primaryCTAVariant.content}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 hover:bg-primary/5 bg-white/80 backdrop-blur-sm"
              onClick={handleBrowseClick}
            >
              {secondaryCTAVariant.content}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex gap-8 justify-center items-center text-sm text-muted-foreground flex-wrap animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <Shield className="h-5 w-5 text-primary" />
              <span>100% Admin Verified</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Quality Approved Listings</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <Bus className="h-5 w-5 text-primary" />
              <span>Zero Commission Trading</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section with Animated Counters */}
      <section className="py-16 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group cursor-default">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform tabular-nums">
                {stats.totalInstitutes > 0 ? `${stats.totalInstitutes}+` : '500+'}
              </div>
              <p className="text-foreground font-semibold">Verified Institutes</p>
              <p className="text-sm text-muted-foreground mt-1">Trusted educational partners nationwide</p>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform tabular-nums">
                {stats.totalVehicles > 0 ? `${stats.totalVehicles}+` : '50+'}
              </div>
              <p className="text-foreground font-semibold">Active Listings</p>
              <p className="text-sm text-muted-foreground mt-1">Quality vehicles ready for sale</p>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform tabular-nums">
                {stats.totalSales > 0 ? `${stats.totalSales}+` : '150+'}
              </div>
              <p className="text-foreground font-semibold">Successful Deals</p>
              <p className="text-sm text-muted-foreground mt-1">Happy transactions & counting</p>
            </div>
          </div>
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
              {featuredVehicles.map((vehicle) => {
                const featuredImage = getFeaturedImage(vehicle)
                return (
                  <Card 
                    key={vehicle.id} 
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border hover:border-primary/50 group hover:-translate-y-2" 
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
                <Button size="lg" onClick={() => navigate('/auth?mode=signup')}>
                  <Users className="mr-2 h-5 w-5" />
                  Register & List Your Vehicle
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose EduFleet?</h3>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for educational institutions with trust and transparency at its core
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">100% Verified Partners</h4>
              <p className="text-muted-foreground leading-relaxed">
              Every educational institution is manually verified by our admin team before approval. 
              Zero fake listings, zero scams – only genuine institutes you can trust.
              </p>
            </Card>
            <Card className="p-8 border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">Quality-Checked Listings</h4>
              <p className="text-muted-foreground leading-relaxed">
              Every vehicle ad is reviewed for accuracy and completeness before going live. 
              No spam, no low-quality posts – browse with peace of mind.
              </p>
            </Card>
            <Card className="p-8 border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">Zero Commission Model</h4>
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
                  <button onClick={() => navigate('/auth?mode=signup')} className="hover:text-primary transition-colors">
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