import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { blink } from '@/lib/blink'
import { api } from '@/lib/api'
import { Vehicle } from '@/types'
import { VehicleCard } from '@/components/vehicle/VehicleCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Bus, Search, Filter, RefreshCw, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { AdSection } from '@/components/ad/AdSection'

interface FilterChipProps {
  label: string
  onClose: () => void
}

function FilterChip({ label, onClose }: FilterChipProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-lg py-1 px-3 text-sm">
      <span>{label}</span>
      <button
        onClick={onClose}
        className="hover:bg-primary/20 rounded p-0.5 transition-colors"
        aria-label="Remove filter"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export function BrowseVehicles() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all')
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])
  const [yearRange, setYearRange] = useState<[number, number]>([1990, new Date().getFullYear()])
  const [seatingRange, setSeatingRange] = useState<[number, number]>([5, 90])
  const [sortBy, setSortBy] = useState('newest')

  // Define filterAndSortVehicles with useCallback (must be before useEffect that uses it)
  const filterAndSortVehicles = useCallback(() => {
    if (!vehicles || vehicles.length === 0) {
      setFilteredVehicles([])
      return
    }

    let filtered = [...vehicles]

    // Search by brand, model, registration, institute
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(v =>
        v.brand?.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.registrationNumber?.toLowerCase().includes(query) ||
        v.instituteName?.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query)
      )
    }

    // Filter by vehicle type
    if (vehicleTypeFilter !== 'all') {
      filtered = filtered.filter(v => v.vehicleType === vehicleTypeFilter)
    }

    // Filter by fuel type
    if (fuelTypeFilter !== 'all') {
      filtered = filtered.filter(v => v.fuelType === fuelTypeFilter)
    }

    // Filter by condition
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(v => v.condition === conditionFilter)
    }

    // Filter by price range
    filtered = filtered.filter(v =>
      v.price >= priceRange[0] && v.price <= priceRange[1]
    )

    // Filter by year range
    filtered = filtered.filter(v =>
      v.year >= yearRange[0] && v.year <= yearRange[1]
    )

    // Filter by seating capacity range
    filtered = filtered.filter(v =>
      v.seatingCapacity >= seatingRange[0] && v.seatingCapacity <= seatingRange[1]
    )

    // Sort - with featured ads prioritization
    if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        // Featured ads first
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => {
        // Featured ads first
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return a.price - b.price
      })
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => {
        // Featured ads first
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return b.price - a.price
      })
    } else if (sortBy === 'year-new') {
      filtered.sort((a, b) => {
        // Featured ads first
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return b.year - a.year
      })
    } else if (sortBy === 'year-old') {
      filtered.sort((a, b) => {
        // Featured ads first
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return a.year - b.year
      })
    }

    setFilteredVehicles(filtered)
  }, [vehicles, searchQuery, vehicleTypeFilter, fuelTypeFilter, conditionFilter, priceRange, yearRange, seatingRange, sortBy])

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles()
  }, [])

  // Filter vehicles whenever filters or data changes
  useEffect(() => {
    filterAndSortVehicles()
  }, [filterAndSortVehicles])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const data = await api.vehicles.getAll({
        status: 'approved',
        soldStatus: 'available'
      })
      setVehicles(data as Vehicle[])
    } catch (error: any) {
      // Network error - silently fail and show empty state
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network')) {
        console.log('Backend not available - showing empty vehicles list')
        setVehicles([])
      } else {
        console.error('Failed to load vehicles:', error)
        toast.error('Failed to load vehicles')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setVehicleTypeFilter('all')
    setFuelTypeFilter('all')
    setConditionFilter('all')
    setPriceRange([0, 5000000])
    setYearRange([1990, new Date().getFullYear()])
    setSeatingRange([5, 90])
    setSortBy('newest')
    toast.success('Filters reset')
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (searchQuery) count++
    if (vehicleTypeFilter !== 'all') count++
    if (fuelTypeFilter !== 'all') count++
    if (conditionFilter !== 'all') count++
    if (priceRange[0] !== 0 || priceRange[1] !== 5000000) count++
    if (yearRange[0] !== 1990 || yearRange[1] !== new Date().getFullYear()) count++
    if (seatingRange[0] !== 5 || seatingRange[1] !== 90) count++
    return count
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Bus className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduFleet</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(user.role === 'admin' ? '/dashboard' : '/school')}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {user.displayName || user.email}
                </Button>
                <Button onClick={() => navigate(user.role === 'admin' ? '/dashboard' : '/school')}>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Vehicles</h1>
          <p className="text-muted-foreground">Find the perfect vehicle from verified educational institutes</p>
        </div>

        {/* Promoted Ads Section */}
        <AdSection 
          pageLocation="browse" 
          title="Featured Premium Vehicles"
          className="mb-8"
        />

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    title="Reset all filters"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Brand, model, description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Vehicle Type */}
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                    <SelectTrigger id="vehicleType">
                      <SelectValue />
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

                {/* Fuel Type */}
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                    <SelectTrigger id="fuelType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fuels</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="cng">CNG</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger id="condition">
                      <SelectValue />
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

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="pt-2">
                    <Slider
                      min={0}
                      max={5000000}
                      step={100000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>₹{priceRange[0].toLocaleString()}</span>
                      <span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Year Range */}
                <div className="space-y-2">
                  <Label>Year Range</Label>
                  <div className="pt-2">
                    <Slider
                      min={1990}
                      max={new Date().getFullYear()}
                      step={1}
                      value={yearRange}
                      onValueChange={setYearRange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{yearRange[0]}</span>
                      <span>{yearRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Seating Capacity */}
                <div className="space-y-2">
                  <Label>Seating Capacity</Label>
                  <div className="pt-2">
                    <Slider
                      min={5}
                      max={90}
                      step={5}
                      value={seatingRange}
                      onValueChange={setSeatingRange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{seatingRange[0]} seats</span>
                      <span>{seatingRange[1]} seats</span>
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <Label htmlFor="sort">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="year-new">Year: Newest First</SelectItem>
                      <SelectItem value="year-old">Year: Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Filter Chips */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <FilterChip label={`Search: ${searchQuery}`} onClose={() => setSearchQuery('')} />
                )}
                {vehicleTypeFilter !== 'all' && (
                  <FilterChip label={vehicleTypeFilter} onClose={() => setVehicleTypeFilter('all')} />
                )}
                {fuelTypeFilter !== 'all' && (
                  <FilterChip label={fuelTypeFilter} onClose={() => setFuelTypeFilter('all')} />
                )}
                {conditionFilter !== 'all' && (
                  <FilterChip label={conditionFilter} onClose={() => setConditionFilter('all')} />
                )}
                {(priceRange[0] !== 0 || priceRange[1] !== 5000000) && (
                  <FilterChip 
                    label={`₹${priceRange[0].toLocaleString()} - ₹${priceRange[1].toLocaleString()}`} 
                    onClose={() => setPriceRange([0, 5000000])} 
                  />
                )}
                {(yearRange[0] !== 1990 || yearRange[1] !== new Date().getFullYear()) && (
                  <FilterChip 
                    label={`${yearRange[0]} - ${yearRange[1]}`} 
                    onClose={() => setYearRange([1990, new Date().getFullYear()])} 
                  />
                )}
                {(seatingRange[0] !== 5 || seatingRange[1] !== 90) && (
                  <FilterChip 
                    label={`${seatingRange[0]} - ${seatingRange[1]} seats`} 
                    onClose={() => setSeatingRange([5, 90])} 
                  />
                )}
              </div>
            )}

            {/* Vehicles Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-muted rounded-lg h-64 animate-pulse"></div>
                ))}
              </div>
            ) : filteredVehicles.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredVehicles.length} of {vehicles.length} vehicles
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredVehicles.map((vehicle) => {
                    const vehicleId = vehicle._id || vehicle.id
                    return (
                      <VehicleCard
                        key={vehicleId}
                        vehicle={vehicle}
                        onClick={() => navigate(`/vehicles/${vehicleId}`)}
                      />
                    )
                  })}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No vehicles match your filters</p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
