import { Vehicle } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Fuel, Users, Gauge, Building2, Lock, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { VerificationBadge } from '@/components/verification/VerificationBadge'

interface VehicleCardProps {
  vehicle: Vehicle
  onClick?: () => void
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const { isAuthenticated } = useAuth()

  const getFeaturedImage = () => {
    if (Array.isArray(vehicle.images)) {
      return vehicle.images[0] || null
    } else if (typeof vehicle.images === 'string') {
      try {
        const images = JSON.parse(vehicle.images)
        return Array.isArray(images) && images.length > 0 ? images[0] : null
      } catch {
        return null
      }
    }
    return null
  }

  const featuredImage = getFeaturedImage();
  const hasImage = !!featuredImage;

  // Check if vehicle is featured and active
  const isFeatured = vehicle.isFeatured && (!vehicle.featuredUntil || new Date(vehicle.featuredUntil) > new Date())

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${isFeatured ? 'border-2 border-primary/50 shadow-md' : ''}`} onClick={onClick}>
      <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center">
        {!isAuthenticated ? (
          /* Show placeholder for non-logged-in users */
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-2">
            <Lock className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground text-center px-4">
              Sign in to view images
            </p>
          </div>
        ) : hasImage ? (
          <img
            src={featuredImage}
            alt={`${vehicle.brand || 'Vehicle'} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No photo</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isFeatured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          <Badge className="capitalize text-xs">{vehicle.condition}</Badge>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm line-clamp-1">
            {vehicle.brand || 'Vehicle'} {vehicle.model}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{vehicle.year}</span>
            <span>•</span>
            <span className="capitalize">{vehicle.vehicleType}</span>
          </div>
        </div>

        {/* Show institution name to all users (minimal info) */}
        {vehicle.instituteName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span className="truncate flex-1">{vehicle.instituteName}</span>
            {vehicle.instituteVerified && (
              <VerificationBadge
                isVerified={vehicle.instituteVerified}
                verificationExpiresAt={vehicle.instituteVerificationExpiresAt}
                size="sm"
                showTooltip={true}
              />
            )}
          </div>
        )}

        {/* Show detailed info only to logged-in users */}
        {isAuthenticated && (
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3 flex-shrink-0" />
              <span>{vehicle.seatingCapacity} seats</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Fuel className="h-3 w-3 flex-shrink-0" />
              <span className="capitalize">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground col-span-2">
              <Gauge className="h-3 w-3 flex-shrink-0" />
              <span>{vehicle.mileage?.toLocaleString() || '0'} km</span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ₹{vehicle.price?.toLocaleString() || '0'}
          </span>
          <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-7">
            View
          </Button>
        </div>
      </div>
    </Card>
  )
}
