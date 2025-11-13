import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title: string;
  description: string;
  currentPlan?: string;
  recommendedPlan?: 'Gold' | 'Platinum';
  features?: string[];
}

export const UpgradePromptModal = ({
  isOpen,
  onClose,
  onUpgrade,
  title,
  description,
  currentPlan = 'Silver',
  recommendedPlan = 'Gold',
  features = [],
}: UpgradePromptModalProps) => {
  const planPrices: any = {
    Gold: { price: '₹5,999', period: '/month', benefit: '3x more listings' },
    Platinum: { price: '₹9,999', period: '/month', benefit: 'Unlimited listings' },
  };

  const planInfo = planPrices[recommendedPlan] || planPrices.Gold;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-25" />
              <Zap className="w-12 h-12 text-blue-600 relative" />
            </div>
          </div>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base mt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current vs Recommended */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your Plan:</span>
              <Badge variant="outline">{currentPlan}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ArrowRight className="w-3 h-3" />
              <span>Upgrade for better results</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Recommended:</span>
              <Badge className="bg-blue-600 hover:bg-blue-700">{recommendedPlan}</Badge>
            </div>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">New features included:</p>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-blue-600">{planInfo.price}</span>
              <span className="text-gray-600">{planInfo.period}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{planInfo.benefit}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Not Now
          </Button>
          <Button onClick={onUpgrade} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
