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
    <div className={`relative group flex-shrink-0 w-[192px] h-[192px] ${isPaid ? 'cursor-pointer' : 'cursor-default'}`} onClick={handleClick}>
      <Card className={`overflow-hidden border border-border/60 shadow-sm transition-all duration-300 rounded-lg w-full h-full flex flex-col p-2 bg-card border-beam ${isPaid ? 'hover:shadow-md group-hover:border-primary/40' : 'opacity-90 grayscale-[0.5]'}`}>
        {/* Compact Header */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="relative w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
            {supplier.logo ? (
              <img
                src={supplier.logo}
                alt={supplier.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {supplier.isVerified && <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-white" />}
            {isPaid && <Crown className="w-3.5 h-3.5 text-amber-500 fill-white" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow min-h-0">
          <h3 className="font-bold text-[13px] leading-tight line-clamp-1 text-foreground mb-0.5 group-hover:text-primary transition-colors" title={supplier.name}>
            {supplier.name}
          </h3>
          
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded">
              <span>{rating}</span>
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>
            <span className="text-[9px] text-muted-foreground">{reviewCount} rev.</span>
          </div>

          <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
            {supplier.address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{supplier.address.city}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[8px] h-4 px-1 leading-none uppercase tracking-tighter">
                {categoryLabels[supplier.category] || supplier.category}
              </Badge>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight mt-1 mb-1">
            {supplier.description}
          </p>

          <div className="mt-auto">
            {isAuthenticated && isPaid ? (
              <Button 
                size="sm" 
                className="w-full text-[10px] h-6 bg-primary hover:bg-primary/90 text-white border-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Contact
              </Button>
            ) : !isPaid ? (
              <div className="w-full h-6 flex items-center justify-center bg-muted/50 rounded text-[8px] text-muted-foreground font-bold uppercase">
                Premium
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                className="w-full text-[10px] h-6 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/login');
                }}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}