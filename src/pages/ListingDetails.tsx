import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useVehicle } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { checkBrowseLimit, incrementBrowseCount } from '@/api/services/subscriptionEnforcement';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PriorityBadge } from '@/components/PriorityBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, MapPin, Gauge, Calendar, User, Phone, Mail, Lock } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { MaskedContent } from '@/components/MaskedContent';

export function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [browseChecked, setBrowseChecked] = useState(false);

  const vehicleId = typeof id === 'string' ? id : '';
  const { vehicle, loading, error } = useVehicle(vehicleId);
  const isUnmasked = !!user;

  // Check and increment browse count when user views details
  useEffect(() => {
    const checkAndIncrementBrowse = async () => {
      if (!user?.id || browseChecked || !isUnmasked) return;
      
      try {
        const checkResult = await checkBrowseLimit(user.id);
        
        if (checkResult.success && checkResult.data.allowed) {
          // User is allowed - increment counter
          await incrementBrowseCount(user.id);
          setBrowseChecked(true);
        } else if (checkResult.data.limitReached) {
          // Browse limit reached
          toast.error(checkResult.data.message || 'Browse limit reached', {
            duration: 5000,
          });
        }
      } catch (err) {
        console.error('Browse check error:', err);
      }
    };

    checkAndIncrementBrowse();
  }, [user?.id, isUnmasked, browseChecked]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="w-32 h-10 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="w-full h-96 rounded-lg mb-4" />
            <Skeleton className="w-full h-64 rounded-lg" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || 'The vehicle you are looking for does not exist.'}</p>
        <Button onClick={() => navigate('/browse')}>Back to Browse</Button>
      </div>
    );
  }
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  const handleContactClick = () => {
    if (!isUnmasked) {
      navigate('/login');
    } else {
      setContactDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/browse')} className="mb-6 gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Browse
        </Button>

        {/* Alert for Unmasked View */}
        {!isUnmasked && (
          <Card className="mb-6 p-4 border-accent bg-accent/5">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Full Details Require Login</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Price, seller information, and registration number are hidden for guest users.
                </p>
                <Button size="sm" onClick={() => navigate('/login')}>
                  Login to View Full Details
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
              {!isUnmasked ? (
                <MaskedContent variant="image" label="Login to view image" className="w-full h-96">
                  <img
                    src={vehicle.images[currentImageIndex]}
                    alt={vehicle.title}
                    className="w-full h-96 object-cover"
                  />
                </MaskedContent>
              ) : (
                <img
                  src={vehicle.images[currentImageIndex]}
                  alt={vehicle.title}
                  className="w-full h-96 object-cover"
                />
              )}

              {/* Navigation Buttons */}
              {vehicle.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full smooth-transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full smooth-transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {vehicle.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {vehicle.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {vehicle.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 smooth-transition ${
                      idx === currentImageIndex ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <Card className="p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4">About This Vehicle</h2>
              <p className="text-muted-foreground mb-4">{vehicle.description}</p>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {vehicle.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-1">
            {/* Priority Badge */}
            {vehicle.isPriority && <div className="mb-4"><PriorityBadge /></div>}

            {/* Title & Specs */}
            <Card className="p-6 mb-6">
              <h1 className="text-2xl font-bold mb-2">{vehicle.title}</h1>
              <p className="text-sm text-muted-foreground mb-4">
                {vehicle.manufacturer} {vehicle.vehiclemodel}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>Year: <strong>{vehicle.year}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Gauge className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>Mileage: <strong>{(vehicle.mileage / 1000).toFixed(0)}k km</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm capitalize">
                  <span className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>Condition: <strong>{vehicle.condition}</strong></span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-border">
                {isUnmasked ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <div className="text-4xl font-bold text-primary">
                      ₹{vehicle.price.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div>
                     <p className="text-sm text-muted-foreground mb-1">Price</p>
                     <MaskedContent 
                       variant="text" 
                       label="Login to view price" 
                       className="text-4xl font-bold text-primary"
                     >
                       ₹{vehicle.price.toLocaleString()}
                     </MaskedContent>
                  </div>
                )}
              </div>

              {/* Registration Number */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                {isUnmasked ? (
                  <p className="font-mono font-semibold">{vehicle.registrationNumber}</p>
                ) : (
                  <MaskedContent variant="text" label="Login to view">
                    AB00 XY 1234
                  </MaskedContent>
                )}
              </div>

              {/* Insurance & Documents */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm font-semibold mb-3">Insurance & Documents</p>
                {isUnmasked ? (
                  <div className="space-y-2 text-sm">
                    {vehicle.insurance?.valid && (
                      <div>
                        <p className="font-medium text-green-600">✓ Insurance Valid</p>
                        <p className="text-xs text-muted-foreground">{vehicle.insurance.provider} • Expires: {vehicle.insurance.expiryDate}</p>
                      </div>
                    )}
                    {vehicle.fitness?.valid && (
                      <div>
                        <p className="font-medium text-green-600">✓ Fitness Certificate Valid</p>
                        <p className="text-xs text-muted-foreground">Expires: {vehicle.fitness.expiryDate}</p>
                      </div>
                    )}
                    {vehicle.roadTax?.valid && (
                      <div>
                        <p className="font-medium text-green-600">✓ Road Tax Valid</p>
                        <p className="text-xs text-muted-foreground">Expires: {vehicle.roadTax.expiryDate}</p>
                      </div>
                    )}
                    {vehicle.permit?.valid && (
                      <div>
                        <p className="font-medium text-green-600">✓ Permit Valid</p>
                        <p className="text-xs text-muted-foreground">{vehicle.permit.permitType} • Expires: {vehicle.permit.expiryDate}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <MaskedContent variant="text" label="Login to view documents">
                    <span className="flex flex-col gap-1">
                      <span>✓ Insurance Valid</span>
                      <span>✓ Fitness Valid</span>
                    </span>
                  </MaskedContent>
                )}
              </div>

              {/* Seller Info */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">Seller Information</p>
                {isUnmasked ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{vehicle.sellerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{vehicle.sellerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{vehicle.sellerPhone}</span>
                    </div>
                  </div>
                ) : (
                  <MaskedContent variant="block" label="Login to view seller details" />
                )}
              </div>

              {/* Contact Button */}
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleContactClick}
              >
                <Mail className="w-4 h-4" />
                Contact Seller
              </Button>
            </Card>

            {/* Sidebar Ad */}
            <div className="mt-8">
              <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <AlertDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contact Seller</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be able to contact the seller of this vehicle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 my-4">
            <div>
              <p className="text-sm font-medium mb-1">Seller Name</p>
              <p className="text-sm text-muted-foreground">{vehicle.sellerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Email</p>
              <p className="text-sm text-muted-foreground">{vehicle.sellerEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Phone</p>
              <p className="text-sm text-muted-foreground">{vehicle.sellerPhone}</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={() => {
                  // Send contact request
                  setContactDialogOpen(false);
                  alert('Contact request sent! The seller will be in touch soon.');
                }}
              >
                Send Message
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
