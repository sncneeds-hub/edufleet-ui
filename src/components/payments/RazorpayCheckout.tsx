import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, CheckCircle, Clock, Percent } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  open: boolean;
  onClose: () => void;
  plan: 'Silver' | 'Gold' | 'Platinum';
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  onSuccess?: () => void;
}

const PLAN_DETAILS = {
  Silver: {
    monthly: { price: '₹2,999', original: '₹2,999' },
    quarterly: { price: '₹8,097', original: '₹8,997', discount: '10%' },
    yearly: { price: '₹28,792', original: '₹35,988', discount: '20%' },
  },
  Gold: {
    monthly: { price: '₹5,999', original: '₹5,999' },
    quarterly: { price: '₹16,197', original: '₹17,997', discount: '10%' },
    yearly: { price: '₹57,592', original: '₹71,988', discount: '20%' },
  },
  Platinum: {
    monthly: { price: '₹9,999', original: '₹9,999' },
    quarterly: { price: '₹26,997', original: '₹29,997', discount: '10%' },
    yearly: { price: '₹95,992', original: '₹119,988', discount: '20%' },
  },
};

export function RazorpayCheckout({ open, onClose, plan, billingCycle = 'monthly', onSuccess }: RazorpayCheckoutProps) {
  const [selectedDuration, setSelectedDuration] = useState<'monthly' | 'quarterly' | 'yearly'>(billingCycle === 'yearly' ? 'yearly' : 'monthly');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Step 1: Create order
      const orderData = await api.payments.createOrder(plan, selectedDuration);

      // Step 2: Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EduFleet',
        description: `${plan} Plan - ${selectedDuration}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Step 4: Verify payment
            await api.payments.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              plan,
              selectedDuration
            );

            toast.success('Payment successful! Subscription activated.');
            onSuccess?.();
            onClose();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#2563EB',
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  const planDetails = PLAN_DETAILS[plan];
  const selectedPricing = planDetails[selectedDuration];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Subscribe to {plan} plan and unlock premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{plan} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan === 'Silver' && 'Perfect for small institutions'}
                    {plan === 'Gold' && 'Most popular for growing institutions'}
                    {plan === 'Platinum' && 'Maximum exposure and features'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                  plan === 'Platinum' ? 'from-purple-400 to-purple-600' :
                  plan === 'Gold' ? 'from-yellow-400 to-yellow-600' :
                  'from-slate-400 to-slate-600'
                } flex items-center justify-center`}>
                  <span className="text-white font-bold">{plan[0]}</span>
                </div>
              </div>

              {/* Duration Tabs */}
              <Tabs value={selectedDuration} onValueChange={(v: any) => setSelectedDuration(v)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="quarterly">
                    <div className="flex items-center gap-1">
                      Quarterly
                      <Badge variant="secondary" className="ml-1 text-xs">10% Off</Badge>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="yearly">
                    <div className="flex items-center gap-1">
                      Yearly
                      <Badge variant="secondary" className="ml-1 text-xs">20% Off</Badge>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-4 mt-4">
                  <PricingDisplay price={planDetails.monthly.price} />
                </TabsContent>

                <TabsContent value="quarterly" className="space-y-4 mt-4">
                  <PricingDisplay 
                    price={planDetails.quarterly.price} 
                    original={planDetails.quarterly.original}
                    discount={planDetails.quarterly.discount}
                  />
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4 mt-4">
                  <PricingDisplay 
                    price={planDetails.yearly.price} 
                    original={planDetails.yearly.original}
                    discount={planDetails.yearly.discount}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Features Summary */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">What you'll get:</h4>
              <ul className="space-y-2">
                {plan === 'Silver' && (
                  <>
                    <Feature text="List up to 10 vehicles" />
                    <Feature text="Basic analytics" />
                    <Feature text="Email support" />
                  </>
                )}
                {plan === 'Gold' && (
                  <>
                    <Feature text="List up to 30 vehicles" />
                    <Feature text="Advanced analytics" />
                    <Feature text="Featured badge" />
                    <Feature text="Homepage promotion" />
                    <Feature text="Priority support" />
                  </>
                )}
                {plan === 'Platinum' && (
                  <>
                    <Feature text="Unlimited vehicle listings" />
                    <Feature text="Premium analytics" />
                    <Feature text="Top homepage placement" />
                    <Feature text="Dedicated account manager" />
                    <Feature text="Custom branding options" />
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <div className="flex items-center gap-4">
            <Button
              className="flex-1"
              size="lg"
              onClick={handlePayment}
              disabled={processing}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {processing ? 'Processing...' : `Pay ${selectedPricing.price}`}
            </Button>
            <Button variant="outline" size="lg" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Instant Activation</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PricingDisplay({ 
  price, 
  original, 
  discount 
}: { 
  price: string; 
  original?: string; 
  discount?: string;
}) {
  return (
    <div className="text-center py-4">
      {original && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground line-through">{original}</span>
          {discount && (
            <Badge variant="secondary" className="text-green-600">
              <Percent className="h-3 w-3 mr-1" />
              Save {discount}
            </Badge>
          )}
        </div>
      )}
      <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {price}
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span className="text-sm">{text}</span>
    </li>
  );
}
