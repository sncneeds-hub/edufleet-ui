import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, IndianRupee, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface SoldConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleTitle: string;
  listedPrice: number;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SoldConfirmationDialog({
  open,
  onClose,
  vehicleId,
  vehicleTitle,
  listedPrice,
  onSuccess,
}: SoldConfirmationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saleAmount, setSaleAmount] = useState(listedPrice.toString());

  const saleAmountNum = parseFloat(saleAmount) || 0;
  const commissionRate = 2.5;
  const commissionAmount = Math.round((saleAmountNum * commissionRate) / 100);

  const initiatePayment = async () => {
    if (saleAmountNum <= 0) {
      toast.error('Please enter a valid sale amount');
      return;
    }

    setLoading(true);

    try {
      // Create commission order
      const response = await fetch('/api/commissions/mark-sold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          vehicleId,
          saleAmount: saleAmountNum,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to create commission order');
        setLoading(false);
        return;
      }

      const { orderId, amount, keyId, commissionAmount: calculatedCommission } = result.data;

      // Initialize Razorpay
      const options = {
        key: keyId,
        amount,
        currency: 'INR',
        name: 'EduFleet',
        description: `Success Commission (${commissionRate}% of ₹${saleAmountNum.toLocaleString()})`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/commissions/verify-commission', {
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
                saleAmount: saleAmountNum,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              toast.success('Vehicle marked as sold! Commission paid successfully.');
              onSuccess();
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
          <DialogTitle>Mark Vehicle as Sold</DialogTitle>
          <DialogDescription>
            Congratulations on selling <strong>{vehicleTitle}</strong>! Please confirm the final
            sale amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sale Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="sale-amount">Final Sale Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="sale-amount"
                type="number"
                placeholder="0"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                className="pl-10"
                min="0"
                step="1000"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Listed price: ₹{listedPrice.toLocaleString()}
            </p>
          </div>

          {/* Commission Breakdown */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              Commission Breakdown
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sale Amount</span>
                <span className="font-medium">₹{saleAmountNum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission Rate</span>
                <Badge variant="secondary">{commissionRate}%</Badge>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Commission to Pay</span>
                <span className="text-primary">₹{commissionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>You'll Receive</span>
                <span className="font-medium">
                  ₹{(saleAmountNum - commissionAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Once you pay the commission and mark as sold, this vehicle will be removed from
              active listings. Payment is processed securely via Razorpay.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={initiatePayment} disabled={loading || saleAmountNum <= 0}>
            {loading ? 'Processing...' : `Pay ₹${commissionAmount.toLocaleString()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
