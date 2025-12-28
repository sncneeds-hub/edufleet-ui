import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Phone, MapPin, CheckCircle, Star, MessageCircle, Calendar, Lock, Share2, Crown } from 'lucide-react';
import type { Supplier } from '@/api/types';
import { categoryLabels } from '@/constants/categories';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MaskedContent } from '@/components/MaskedContent';
import { ShareButton } from '@/components/ShareButton';
import toast from 'react-hot-toast';

interface SupplierCardProps {
  supplier: Supplier;
  onViewDetails?: () => void;
  showStatus?: boolean;
}

export function SupplierCard({ supplier, onViewDetails, showStatus = false }: SupplierCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  const isPaid = supplier.isPaid ?? false;

  // Handle click on card
  const handleClick = () => {
    if (!isPaid && user?.role !== 'admin') {
      toast.error('Detailed view is only available for featured vendors. Please contact admin for more info.');
      return;
    }
    
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate(`/suppliers/${supplier.id || (supplier as any)._id}`);
    }
  };

  // Generate rating from supplier data or default - safely handle missing/invalid id
  const supplierId = supplier?.id || supplier?.name || 'default';
  const idSuffix = typeof supplierId === 'string' && supplierId.length >= 2 ? supplierId.slice(-2) : '00';
  const idSuffix3 = typeof supplierId === 'string' && supplierId.length >= 3 ? supplierId.slice(-3) : '000';
  const rating = (4.0 + (parseInt(idSuffix, 36) % 10) / 10).toFixed(1);
  const reviewCount = 50 + (parseInt(idSuffix3, 36) % 200);

  return (
    <div className="relative group flex-shrink-0 w-full h-full" onClick={handleClick}>
      <Card className={`overflow-hidden border border-border/60 shadow-sm transition-all duration-300 rounded-xl w-full h-full flex flex-col p-0 bg-card ${isPaid ? 'hover:shadow-xl hover:-translate-y-1 group-hover:border-primary/20 cursor-pointer' : 'opacity-90 grayscale-[0.5] cursor-default'}`}>
        {/* Top: Image/Logo Section (Hero) */}
        <div className="relative overflow-hidden bg-muted aspect-[4/3] flex-shrink-0">
          {supplier.logo ? (
            <img
              src={supplier.logo}
              alt={supplier.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${isPaid ? 'group-hover:scale-110' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-primary/40" />
            </div>
          )}
          
          {supplier.isVerified && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1.5 shadow-lg border-2 border-background z-10" title="Verified Supplier">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}

          {isPaid && (
            <div className="absolute top-2 left-2 bg-amber-500 rounded-full p-1.5 shadow-lg border-2 border-background z-10" title="Featured Vendor">
              <Crown className="w-4 h-4 text-white" />
            </div>
          )}

          {showStatus && (
            <div className="absolute top-2 left-2 z-10">
              <Badge
                variant={
                  supplier.status === 'approved'
                    ? 'default'
                    : supplier.status === 'pending'
                    ? 'secondary'
                    : 'destructive'
                }
                className="text-xs shadow-sm"
              >
                {supplier.status}
              </Badge>
            </div>
          )}

          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShareButton
              title={supplier.name}
              text={`Check out ${supplier.name} on EduFleet Exchange!`}
              url={`/suppliers/${supplier.id || (supplier as any)._id}`}
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-none shadow-sm hover:bg-background"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow justify-between gap-3">
          <div className="min-h-0 space-y-2">
            <div>
              <h3 className="font-bold text-base leading-tight line-clamp-1 text-foreground mb-1 group-hover:text-primary transition-colors" title={supplier.name}>
                {supplier.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-1">
                 <div className="flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">
                  <span>{rating}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </div>
                <span className="text-[10px] text-muted-foreground">({reviewCount} reviews)</span>
              </div>
              
              {supplier.address && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{supplier.address.city}, {supplier.address.state}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                {categoryLabels[supplier.category] || supplier.category}
              </Badge>
              {supplier.yearsInBusiness && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{supplier.yearsInBusiness} yrs</span>
                </div>
              )}
            </div>

            {supplier.services && supplier.services.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {supplier.services.slice(0, 2).map((service, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[9px] px-1 py-0.5">
                    {service}
                  </Badge>
                ))}
                {supplier.services.length > 2 && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0.5">
                    +{supplier.services.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {supplier.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="w-3 h-3 flex-shrink-0 text-primary" />
              <span className="font-medium truncate max-w-[120px]">
                {isAuthenticated && isPaid ? supplier.phone : (
                  <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/login'); }}>
                    <span className="blur-sm select-none">+91 99999...</span>
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {isAuthenticated && isPaid ? (
               <>
                <Button 
                  size="sm" 
                  className="w-full text-xs h-8 bg-accent hover:bg-accent/90 text-white border-none shadow-sm"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={`tel:${supplier.phone}`}>
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </a>
                </Button>
                 <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full text-xs h-8 border-primary text-primary hover:bg-primary hover:text-white"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={`https://wa.me/${supplier.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp
                  </a>
                </Button>
              </>
            ) : !isPaid ? (
              <div className="col-span-2 py-2 px-3 bg-muted/50 rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Premium Required for Contact</p>
              </div>
            ) : (
               <MaskedContent 
                  variant="button" 
                  label="Login to Contact" 
                  className="col-span-2 w-full h-8 text-xs"
                />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}