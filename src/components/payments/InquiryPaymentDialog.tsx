import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Package, Info } from 'lucide-react';
import { toast } from 'sonner';

interface InquiryPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleTitle: string;
  onPaymentSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function InquiryPaymentDialog({
  open,
  onClose,
  vehicleId,
  vehicleTitle,
  onPaymentSuccess,
}: InquiryPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'single' | 'package'>('single');

  const initiatePayment = async () => {
    setLoading(true);

    try {
      // Create order
      const response = await fetch('/api/commissions/inquiry-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          vehicleId,
          inquiryType: selectedType,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to create payment order');
        setLoading(false);
        return;
      }

      const { orderId, amount, keyId, description } = result.data;

      // Initialize Razorpay
      const options = {
        key: keyId,
        amount,
        currency: 'INR',
        name: 'EduFleet',
        description,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/commissions/verify-inquiry-fee', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                vehicleId,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              toast.success('Payment successful! You can now contact the seller.');
              onPaymentSuccess();
              onClose();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Seller Contact</DialogTitle>
          <DialogDescription>
            Pay a small fee to view seller details and send your inquiry for{' '}
            <strong>{vehicleTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Single Inquiry Option */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedType === 'single'
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedType('single')}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Single Inquiry</h4>
                    <p className="text-sm text-muted-foreground">
                      Pay once for this vehicle only
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  ₹99
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Package Option */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedType === 'package'
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedType('package')}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">
                      Inquiry Package{' '}
                      <Badge variant="default" className="ml-2">
                        Best Value
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      10 inquiries for any vehicles
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Save ₹491 • Only ₹49.90 per inquiry
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  ₹499
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="flex gap-2 p-3 bg-muted rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Payment is processed securely via Razorpay. Once paid, you'll instantly get access
              to seller contact details and can send your inquiry.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={initiatePayment} disabled={loading}>
            {loading ? 'Processing...' : `Pay ${selectedType === 'single' ? '₹99' : '₹499'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
