import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Check, Zap } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FeaturedAdCheckoutProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
  onSuccess?: () => void;
}

const PACKAGES = {
  basic: {
    name: 'Basic Boost',
    price: '₹499',
    duration: '7 days',
    features: ['Top position in browse page', 'Featured badge', '3x visibility'],
    color: 'from-blue-400 to-blue-600',
  },
  standard: {
    name: 'Featured Listing',
    price: '₹1,499',
    duration: '30 days',
    features: ['Top 3 positions', 'Gold featured badge', 'Highlighted border', '5x visibility'],
    popular: true,
    color: 'from-yellow-400 to-yellow-600',
  },
  premium: {
    name: 'Homepage Hero',
    price: '₹4,999',
    duration: '7 days',
    features: ['Homepage hero slot', 'Maximum visibility', 'Custom CTA', '10x visibility'],
    color: 'from-purple-400 to-purple-600',
  },
  category: {
    name: 'Category Champion',
    price: '₹2,999',
    duration: '30 days',
    features: ['First in category', 'Category banner', 'Featured across category pages', '7x visibility'],
    color: 'from-green-400 to-green-600',
  },
};

export function FeaturedAdCheckout({ open, onClose, vehicleId, onSuccess }: FeaturedAdCheckoutProps) {
  const [selectedPackage, setSelectedPackage] = useState<keyof typeof PACKAGES>('standard');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create order
      const orderResponse = await api.post('/featured-ads/create-order', {
        vehicleId,
        packageType: selectedPackage,
      });

      if (!orderResponse.data.success) {
        toast.error('❌ ' + (orderResponse.data.error || 'Failed to create order'));
        throw new Error(orderResponse.data.error || 'Failed to create order');
      }
      
      toast.loading('Opening payment gateway...')

      const { orderId, amount, currency, keyId } = orderResponse.data.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: keyId,
          amount,
          currency,
          name: 'EduFleet',
          description: `${PACKAGES[selectedPackage].name} - ${PACKAGES[selectedPackage].duration}`,
          order_id: orderId,
          handler: async (response: any) => {
            try {
              const verifyResponse = await api.post('/featured-ads/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                vehicleId,
                packageType: selectedPackage,
              });

              if (verifyResponse.data.success) {
                toast.success('✅ Featured ad activated successfully! Your vehicle is now promoted.');
                onSuccess?.();
                onClose();
              } else {
                toast.error('❌ ' + (verifyResponse.data.error || 'Payment verification failed'));
              }
            } catch (error: any) {
              toast.error('❌ ' + (error.response?.data?.error || 'Payment verification failed. Please contact support.'));
            }
          },
          prefill: {
            name: '',
            email: '',
          },
          theme: {
            color: '#2563EB',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error: any) {
      toast.error('❌ ' + (error.response?.data?.error || 'Failed to initiate payment. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Promote Your Vehicle
          </DialogTitle>
          <DialogDescription>Choose a package to boost your listing visibility</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {Object.entries(PACKAGES).map(([key, pkg]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                selectedPackage === key
                  ? 'border-primary shadow-lg scale-105'
                  : 'hover:border-primary/50'
              } ${pkg.popular ? 'border-yellow-500' : ''}`}
              onClick={() => setSelectedPackage(key as keyof typeof PACKAGES)}
            >
              <CardContent className="p-4">
                {pkg.popular && (
                  <Badge className="mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600">
                    Most Popular
                  </Badge>
                )}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-3`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold">{pkg.price}</span>
                  <span className="text-sm text-muted-foreground">for {pkg.duration}</span>
                </div>
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : `Proceed with ${PACKAGES[selectedPackage].price}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
