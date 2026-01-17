import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, Zap } from 'lucide-react';
import { SubscriptionUsageStats } from '@/types/subscriptionTypes';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionUsageCardProps {
  stats: SubscriptionUsageStats | null;
  loading?: boolean;
}

export function SubscriptionUsageCard({ stats, loading }: SubscriptionUsageCardProps) {
  const { user } = useAuth();

  if (loading) {
    return (
      <Card className="p-6 bg-muted/50 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Alert variant="default" className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <div className="ml-4">
          <p className="font-semibold text-amber-900">No Subscription Data</p>
          <p className="text-sm text-amber-800 mt-1">
            Unable to load subscription usage information.
          </p>
        </div>
      </Alert>
    );
  }

  const browsePercentage = Math.min(stats.browseCount.percentage, 100);
  const listingPercentage = Math.min(stats.listingCount.percentage, 100);
  const jobPostsPercentage = stats.jobPostsCount ? Math.min(stats.jobPostsCount.percentage, 100) : 0;
  
  const browseWarning = browsePercentage >= 80;
  const listingWarning = listingPercentage >= 80;
  const jobPostsWarning = jobPostsPercentage >= 80;

  const isTeacher = user?.role === 'teacher';
  const isInstitute = user?.role === 'institute';

  const showListings = isInstitute && (stats.listingCount.allowed > 0 || stats.listingCount.used > 0);
  const showJobPosts = isInstitute && stats.jobPostsCount && (stats.jobPostsCount.allowed > 0 || stats.jobPostsCount.used > 0);
  const showApplications = isTeacher && stats.jobPostsCount && (stats.jobPostsCount.allowed > 0 || stats.jobPostsCount.used > 0);

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Subscription Usage</h3>

        {/* Browse Count */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Browse Count</span>
              {browseWarning && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Zap className="w-3 h-3 mr-1" />
                  High Usage
                </Badge>
              )}
            </div>
            <span className="text-sm font-medium">
              {stats.browseCount.used} / {stats.browseCount.allowed}
            </span>
          </div>
          <Progress
            value={browsePercentage}
            className={`h-2 ${browseWarning ? 'bg-amber-100' : ''}`}
          />
          <p className="text-xs text-muted">
            {stats.browseCount.remaining} view{stats.browseCount.remaining !== 1 ? 's' : ''} remaining
          </p>
        </div>

        {browseWarning && (
          <Alert variant="default" className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div className="ml-4">
              <p className="font-semibold text-amber-900 text-sm">
                Browse Limit Warning
              </p>
              <p className="text-xs text-amber-800 mt-1">
                You're using {Math.round(browsePercentage)}% of your monthly browse limit. Upgrade your plan for more access.
              </p>
            </div>
          </Alert>
        )}

        {/* Listing Count - Institute Only */}
        {showListings && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Listings Created</span>
                {listingWarning && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Zap className="w-3 h-3 mr-1" />
                    High Usage
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium">
                {stats.listingCount.used} / {stats.listingCount.allowed}
              </span>
            </div>
            <Progress
              value={listingPercentage}
              className={`h-2 ${listingWarning ? 'bg-amber-100' : ''}`}
            />
            <p className="text-xs text-muted">
              {stats.listingCount.remaining} listing{stats.listingCount.remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}

        {/* Job Post Count - Institute Only */}
        {showJobPosts && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Job Posts</span>
                {jobPostsWarning && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Zap className="w-3 h-3 mr-1" />
                    High Usage
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium">
                {stats.jobPostsCount!.used} / {stats.jobPostsCount!.allowed}
              </span>
            </div>
            <Progress
              value={jobPostsPercentage}
              className={`h-2 ${jobPostsWarning ? 'bg-amber-100' : ''}`}
            />
            <p className="text-xs text-muted">
              {stats.jobPostsCount!.remaining} post{stats.jobPostsCount!.remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}

        {/* Job Applications - Teacher Only */}
        {showApplications && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Job Applications</span>
                {jobPostsWarning && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Zap className="w-3 h-3 mr-1" />
                    High Usage
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium">
                {stats.jobPostsCount!.used} / {stats.jobPostsCount!.allowed}
              </span>
            </div>
            <Progress
              value={jobPostsPercentage}
              className={`h-2 ${jobPostsWarning ? 'bg-amber-100' : ''}`}
            />
            <p className="text-xs text-muted">
              {stats.jobPostsCount!.remaining} application{stats.jobPostsCount!.remaining !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}

        {(listingWarning || (isInstitute && jobPostsWarning) || (isTeacher && jobPostsWarning)) && (
          <Alert variant="default" className="mt-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div className="ml-4">
              <p className="font-semibold text-amber-900 text-sm">
                Usage Limit Warning
              </p>
              <p className="text-xs text-amber-800 mt-1">
                You're approaching your usage quota. Contact your administrator to increase your plan.
              </p>
            </div>
          </Alert>
        )}
      </div>
    </Card>
  );
}
