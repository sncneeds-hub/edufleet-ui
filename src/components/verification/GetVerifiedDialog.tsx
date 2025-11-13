import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { ShieldCheck, Check, Loader2, IndianRupee, Calendar, TrendingUp, Star, Award } from 'lucide-react';
import { VerificationStatus } from '@/types';

interface GetVerifiedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationStatus?: VerificationStatus;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function GetVerifiedDialog({
  open,
  onOpenChange,
  verificationStatus,
  onSuccess,
}: GetVerifiedDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const isRenewal = verificationStatus?.needsRenewal || false;
  const price = isRenewal ? 1999 : 4999;

  const benefits = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      title: 'Verified Badge',
      description: 'Display trust badge on all your vehicle listings',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      title: 'Higher Visibility',
      description: 'Verified institutes rank higher in search results',
    },
    {
      icon: <Star className="h-5 w-5 text-primary" />,
      title: 'Buyer Confidence',
      description: 'Buyers prefer verified institutes over unverified ones',
    },
    {
      icon: <Award className="h-5 w-5 text-primary" />,
      title: 'Premium Placement',
      description: 'Get featured in verified institute listings',
    },
  ];

  const handleGetVerified = async () => {
    setIsProcessing(true);

    try {
      // Create verification order
      const orderData = await api.verification.createOrder(
        isRenewal ? 'renewal' : 'oneTime'
      );

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Configure Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EduFleet',
        description: orderData.description,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment with backend
            await api.verification.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              isRenewal ? 'renewal' : 'oneTime'
            );

            toast.success('Institute verified successfully! 🎉', {
              description: 'Your verification is valid for 1 year.',
            });

            onOpenChange(false);
            if (onSuccess) {
              onSuccess();
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
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
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Get verified error:', error);
      toast.error('Failed to initiate verification payment');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
            {isRenewal ? 'Renew Verification' : 'Get Verified'}
          </DialogTitle>
          <DialogDescription>
            {isRenewal
              ? 'Your verification has expired. Renew to continue enjoying verified benefits.'
              : 'Verify your institute to build trust and increase visibility'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <IndianRupee className="h-8 w-8 text-primary" />
                  <span className="text-4xl font-bold">{price.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-muted-foreground">
                  {isRenewal ? 'Annual Renewal' : 'One-time Payment'}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Valid for 1 year</span>
                </div>
                {!isRenewal && (
                  <Badge variant="secondary" className="mt-2">
                    Renewal: ₹1,999/year after first year
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Why Get Verified?</h3>
            <div className="grid gap-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                >
                  <div className="mt-0.5">{benefit.icon}</div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{benefit.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                  <Check className="h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What's Included</h3>
            <ul className="space-y-2 text-sm">
              {[
                'Official verified badge on all listings',
                'Priority placement in search results',
                'Featured in "Verified Institutes" section',
                '1 year validity with annual renewal option',
                'Verified status visible to all buyers',
                'Trust score boost in recommendations',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGetVerified}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {isRenewal ? 'Renew Now' : 'Get Verified Now'}
                </>
              )}
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Razorpay. Your payment information is encrypted and secure.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
