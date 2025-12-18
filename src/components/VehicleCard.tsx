import { Vehicle } from '@/mock/vehicleData';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Gauge, Calendar, Lock } from 'lucide-react';
import { MaskedContent } from '@/components/MaskedContent';

interface VehicleCardProps {
  vehicle: Vehicle;
  isListing?: boolean;
}

export function VehicleCard({ vehicle, isListing = false }: VehicleCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isUnmasked = !!user;

  const handleClick = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer relative group flex-shrink-0 w-full h-full"
    >
      <Card className="overflow-hidden border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl w-full h-full flex flex-col p-0 bg-card group-hover:border-primary/20">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-muted aspect-[4/3] flex-shrink-0">
          {!isUnmasked && !isListing ? (
            <MaskedContent variant="image" label="Login to view" className="w-full h-full">
              <img
                src={vehicle.images[0]}
                alt={vehicle.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </MaskedContent>
          ) : (
            <img
              src={vehicle.images[0]}
              alt={vehicle.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
          
          {vehicle.isPriority && (
            <div className="absolute top-1 left-1 z-10 scale-75 origin-top-left pointer-events-none">
              <PriorityBadge />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow justify-between gap-3">
          <div className="min-h-0">
            <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground mb-1 group-hover:text-primary transition-colors" title={vehicle.title}>
              {vehicle.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <span className="font-medium">{vehicle.manufacturer}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
              <span>{vehicle.year}</span>
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <div className="min-w-0">
              {isUnmasked || isListing ? (
                <div className="text-lg font-bold text-primary truncate">
                  ₹{(vehicle.price / 100000).toFixed(2)} Lakh
                </div>
              ) : (
                <MaskedContent 
                  variant="text" 
                  label="Login to view price" 
                  className="text-xs font-semibold text-primary/80"
                >
                  ₹{(vehicle.price / 100000).toFixed(2)} Lakh
                </MaskedContent>
              )}
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <span className="text-xs bg-secondary/5 text-secondary px-2 py-1 rounded-md font-medium border border-secondary/10">
                {vehicle.type === 'bus' ? 'Bus' : vehicle.type === 'van' ? 'Van' : 'Car'}
              </span>
            </div>
          </div>
          
          {/* Call to Action Placeholder - Justdial Style */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button variant="outline" size="sm" className="w-full text-xs h-8 border-primary text-primary hover:bg-primary hover:text-white">
              View Details
            </Button>
            <Button variant="default" size="sm" className="w-full text-xs h-8 bg-accent hover:bg-accent/90 text-white border-none shadow-sm">
              Enquire
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
