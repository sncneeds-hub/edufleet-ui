import { AlertCircle, X, Zap, TrendingUp, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface UpgradeBannerProps {
  message: string;
  reason: 'limitReached' | 'expiring' | 'upgrade' | 'feature' | 'nearLimit';
  currentPlan?: string;
  recommendedPlan?: 'Gold' | 'Platinum';
  onUpgrade: () => void;
  dismissible?: boolean;
  progress?: number; // 0-100 for limit usage
}

export const UpgradeBanner = ({
  message,
  reason,
  currentPlan = 'Silver',
  recommendedPlan,
  onUpgrade,
  dismissible = true,
  progress,
}: UpgradeBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const bannerStyles: Record<string, string> = {
    limitReached: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300',
    nearLimit: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300',
    expiring: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300',
    upgrade: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300',
    feature: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300',
  };

  const iconStyles: Record<string, string> = {
    limitReached: 'text-orange-600',
    nearLimit: 'text-yellow-600',
    expiring: 'text-red-600',
    upgrade: 'text-blue-600',
    feature: 'text-purple-600',
  };

  const buttonStyles: Record<string, string> = {
    limitReached: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700',
    nearLimit: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
    expiring: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
    upgrade: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
    feature: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
  };

  const getIcon = () => {
    switch (reason) {
      case 'limitReached':
        return <AlertCircle className={`w-5 h-5 flex-shrink-0 ${iconStyles[reason]}`} />;
      case 'nearLimit':
        return <TrendingUp className={`w-5 h-5 flex-shrink-0 ${iconStyles[reason]}`} />;
      case 'upgrade':
        return <Star className={`w-5 h-5 flex-shrink-0 ${iconStyles[reason]}`} />;
      case 'feature':
        return <Zap className={`w-5 h-5 flex-shrink-0 ${iconStyles[reason]}`} />;
      default:
        return <AlertCircle className={`w-5 h-5 flex-shrink-0 ${iconStyles[reason]}`} />;
    }
  };

  const getPlanIcon = (plan: string) => {
    if (plan === 'Platinum') return <Crown className="w-3 h-3" />;
    if (plan === 'Gold') return <Star className="w-3 h-3" />;
    return null;
  };

  return (
    <div className={`border rounded-lg p-4 shadow-sm ${bannerStyles[reason]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {getIcon()}
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{message}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">Current plan: {currentPlan}</p>
                {recommendedPlan && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    {getPlanIcon(recommendedPlan)}
                    Recommended: {recommendedPlan}
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress bar for limit usage */}
            {progress !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progress >= 90
                        ? 'bg-red-500'
                        : progress >= 70
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={onUpgrade}
            className={`whitespace-nowrap text-white ${buttonStyles[reason]} shadow-lg`}
            size="sm"
          >
            <Zap className="w-4 h-4 mr-1" />
            Upgrade Now
          </Button>

          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-black/10 rounded-md transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
