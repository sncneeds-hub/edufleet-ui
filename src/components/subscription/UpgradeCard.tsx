import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Lock, ArrowUp } from 'lucide-react';

interface UpgradeCardProps {
  title?: string;
  description?: string;
  currentPlan: string;
  upgradeTo?: 'Gold' | 'Platinum';
  onUpgrade: () => void;
  features?: string[];
  compact?: boolean;
}

export const UpgradeCard = ({
  title = 'Plan Limit Reached',
  description = 'Upgrade to unlock more listings',
  currentPlan = 'Silver',
  upgradeTo = 'Gold',
  onUpgrade,
  features = [],
  compact = false,
}: UpgradeCardProps) => {
  if (compact) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">{title}</p>
                <p className="text-sm text-amber-700">{description}</p>
              </div>
            </div>
            <Button onClick={onUpgrade} size="sm" className="bg-amber-600 hover:bg-amber-700">
              <ArrowUp className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20" />
            <Zap className="w-10 h-10 text-blue-600 relative" />
          </div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Current</p>
            <Badge variant="outline" className="mb-2 block text-center w-full">
              {currentPlan}
            </Badge>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>• 10 listings max</li>
              <li>• 7 day duration</li>
            </ul>
          </div>

          <div className="bg-blue-600 rounded-lg p-3 text-white relative">
            <div className="absolute top-2 right-2 bg-green-400 text-green-900 px-2 py-1 rounded text-xs font-semibold">
              Recommended
            </div>
            <p className="text-xs font-medium mb-2 opacity-90">Upgrade to</p>
            <Badge className="mb-2 block text-center w-full bg-white text-blue-600">
              {upgradeTo}
            </Badge>
            <ul className="text-xs space-y-1 opacity-90">
              <li>• {upgradeTo === 'Gold' ? '30' : '∞'} listings max</li>
              <li>• {upgradeTo === 'Gold' ? '60' : '90'} day duration</li>
            </ul>
          </div>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Additional benefits:</p>
            <ul className="space-y-1">
              {features.map((feature, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={onUpgrade}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Zap className="w-4 h-4 mr-2" />
          Upgrade to {upgradeTo}
        </Button>
      </CardContent>
    </Card>
  );
};
