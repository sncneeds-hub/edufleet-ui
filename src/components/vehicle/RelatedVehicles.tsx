import { useEffect, useState } from 'react'
import { Vehicle } from '@/types'
import { api } from '@/lib/api'
import { VehicleCard } from './VehicleCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface RelatedVehiclesProps {
  currentVehicle: Vehicle
}

export function RelatedVehicles({ currentVehicle }: RelatedVehiclesProps) {
  const navigate = useNavigate()
  const [relatedVehicles, setRelatedVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const loadRelatedVehicles = async () => {
    try {
      setLoading(true)
      const vehicleId = currentVehicle._id || currentVehicle.id
      
      if (!vehicleId) {
        setRelatedVehicles([])
        return
      }

      // Use new API endpoint for similar vehicles
      const related = await api.vehicles.getRelated(vehicleId, 6)
      setRelatedVehicles(related)
    } catch (error) {
      console.error('Failed to load related vehicles:', error)
      setRelatedVehicles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRelatedVehicles()
  }, [currentVehicle])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You Might Also Like</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (relatedVehicles.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>You Might Also Like</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {relatedVehicles.map((vehicle) => {
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
      </CardContent>
    </Card>
  )
}
