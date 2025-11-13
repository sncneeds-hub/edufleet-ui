import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayAnalyticsCheckoutProps {
  productId: string;
  productName: string;
  price: number;
  currency: string;
  period: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function RazorpayAnalyticsCheckout({
  productId,
  productName,
  price,
  currency,
  period,
  onSuccess,
  onError,
}: RazorpayAnalyticsCheckoutProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        navigate('/auth');
        return;
      }

      // Create Razorpay order on backend
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analytics-payments/create-order`,
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error || 'Failed to create order');
      }

      const { orderId, amount, currency: curr, keyId } = orderResponse.data.data;

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount,
        currency: curr,
        name: 'EduFleet',
        description: `${productName} Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/analytics-payments/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productId,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (verifyResponse.data.success) {
              toast.success(verifyResponse.data.message || 'Payment successful!');
              onSuccess?.();
              // Redirect to dashboard after 2 seconds
              setTimeout(() => {
                navigate('/school/dashboard');
              }, 2000);
            } else {
              throw new Error(verifyResponse.data.error || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Payment verification failed';
            toast.error(errorMsg);
            onError?.(errorMsg);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#8B5CF6',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to initiate payment';
      toast.error(errorMsg);
      onError?.(errorMsg);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>
          You're about to subscribe to {productName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-semibold">{productName}</p>
            <p className="text-sm text-muted-foreground">
              Billed {period}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {currency}{price}
            </p>
            <p className="text-xs text-muted-foreground">/{period}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>7-day free trial included</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Cancel anytime, no questions asked</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Instant access after payment</span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading || !scriptLoaded}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : !scriptLoaded ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading Payment System...
            </>
          ) : (
            <>
              Pay {currency}{price}
            </>
          )}
        </Button>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            Secure payment powered by Razorpay. Your payment information is encrypted and secure.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
