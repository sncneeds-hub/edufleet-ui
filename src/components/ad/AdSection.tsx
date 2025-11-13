import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Vehicle } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'

interface AdSectionProps {
  pageLocation: 'landing' | 'browse' | 'detail'
  title?: string
  className?: string
}

export function AdSection({ pageLocation, title, className = '' }: AdSectionProps) {
  const navigate = useNavigate()
  const [ads, setAds] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sessionId = useRef(getOrCreateSessionId())
  
  // Get tracked impressions from sessionStorage (persistent across remounts)
  const getTrackedImpressions = (): Set<string> => {
    const stored = sessionStorage.getItem(`edufleet_tracked_impressions_${pageLocation}`)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  }
  
  // Save tracked impressions to sessionStorage
  const saveTrackedImpressions = (tracked: Set<string>) => {
    sessionStorage.setItem(`edufleet_tracked_impressions_${pageLocation}`, JSON.stringify([...tracked]))
  }
  
  // Get tracked clicks from sessionStorage
  const getTrackedClicks = (): Set<string> => {
    const stored = sessionStorage.getItem(`edufleet_tracked_clicks_${pageLocation}`)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  }
  
  // Save tracked clicks to sessionStorage
  const saveTrackedClicks = (tracked: Set<string>) => {
    sessionStorage.setItem(`edufleet_tracked_clicks_${pageLocation}`, JSON.stringify([...tracked]))
  }
  
  const trackedAdsRef = useRef<Set<string>>(getTrackedImpressions())
  const trackedClicksRef = useRef<Set<string>>(getTrackedClicks())

  useEffect(() => {
    loadAds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLocation])

  useEffect(() => {
    // Setup IntersectionObserver for impression tracking
    if (ads.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const vehicleId = entry.target.getAttribute('data-vehicle-id')
            if (vehicleId && !trackedAdsRef.current.has(vehicleId)) {
              trackedAdsRef.current.add(vehicleId)
              saveTrackedImpressions(trackedAdsRef.current) // Persist to sessionStorage
              trackImpression(vehicleId)
            }
          }
        })
      },
      {
        threshold: 0.5, // Track when 50% of ad is visible
        rootMargin: '0px'
      }
    )

    // Observe all ad elements
    const adElements = document.querySelectorAll(`[data-ad-section="${pageLocation}"]`)
    adElements.forEach((el) => observerRef.current?.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads, pageLocation])

  const loadAds = async () => {
    try {
      setLoading(true)
      const promotedAds = await api.vehicles.getAdsByPage(pageLocation)
      setAds(promotedAds || [])
    } catch (error: any) {
      // Network error - silently fail and return empty ads
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network') || !error.response) {
        console.log('Backend not available - ads will not be displayed')
        setAds([])
      } else {
        console.error('Failed to load promoted ads:', error)
        setAds([])
      }
    } finally {
      setLoading(false)
    }
  }

  const trackImpression = async (vehicleId: string) => {
    try {
      await api.adTracking.recordImpression(
        vehicleId,
        pageLocation,
        sessionId.current,
        window.location.href
      )
    } catch (error: any) {
      // Silently fail - tracking errors should not break the app
      if (import.meta.env.DEV) {
        console.error('Failed to track impression:', error)
      }
    }
  }

  const handleAdClick = async (vehicleId: string) => {
    // Only record click if not already tracked in this session
    if (!trackedClicksRef.current.has(vehicleId)) {
      try {
        trackedClicksRef.current.add(vehicleId)
        saveTrackedClicks(trackedClicksRef.current)
        await api.adTracking.recordClick(vehicleId, pageLocation, sessionId.current)
      } catch (error: any) {
        // Silently fail - tracking errors should not break the app
        if (import.meta.env.DEV) {
          console.error('Failed to track click:', error)
        }
      }
    }
    navigate(`/vehicles/${vehicleId}`)
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          {title}
        </h3>}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (ads.length === 0) {
    return null
  }

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

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          {title}
        </h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {ads.map((vehicle) => {
          const vehicleId = vehicle._id || vehicle.id || ''
          const featuredImage = getFeaturedImage(vehicle)
          
          return (
            <Card
              key={vehicleId}
              data-vehicle-id={vehicleId}
              data-ad-section={pageLocation}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-yellow-200 hover:border-yellow-400 group hover:-translate-y-2 relative"
              onClick={() => handleAdClick(vehicleId)}
            >
              {/* Promoted Badge */}
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>

              <div className="aspect-[3/2] bg-muted relative overflow-hidden flex items-center justify-center">
                <img
                  src={featuredImage}
                  alt={`${vehicle.brand || 'Vehicle'} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-2 right-2 capitalize shadow-lg backdrop-blur-sm bg-white/90 text-foreground border-0 text-xs">
                  {vehicle.condition}
                </Badge>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="p-3 space-y-2 bg-gradient-to-br from-yellow-50/50 to-white">
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
    </div>
  )
}

// Helper function to generate or retrieve session ID
function getOrCreateSessionId(): string {
  const SESSION_KEY = 'edufleet_session_id'
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  
  return sessionId
}
