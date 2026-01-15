/**
 * Persona Access Info Component
 * Displays persona-specific access permissions and feature limits
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertCircle,
  CheckCircle,
  Lock,
  Zap,
  Users,
  FileText,
  ShoppingCart,
  Briefcase,
  BarChart3
} from 'lucide-react';
import {
  getPersonaAccessControl,
  checkVehicleListingAccess,
  checkJobPostAccess,
  checkJobApplicationAccess,
  checkProductListingAccess
} from '@/api/services/subscriptionService';

interface PersonaAccessInfoProps {
  showDetails?: boolean;
  compact?: boolean;
}

export function PersonaAccessInfo({ showDetails = true, compact = false }: PersonaAccessInfoProps) {
  const { user } = useAuth();
  const [accessControl, setAccessControl] = useState<any>(null);
  const [specificAccess, setSpecificAccess] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAccessInfo();
    }
  }, [user?.id]);

  const loadAccessInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get overall access control
      const accessResponse = await getPersonaAccessControl();
      if (accessResponse.success) {
        setAccessControl(accessResponse.data);
      }

      // Get persona-specific access based on role
      const specific: any = {};
      if (user?.role === 'institute') {
        const vehicleAccess = await checkVehicleListingAccess();
        const jobPostAccess = await checkJobPostAccess();
        specific.vehicle = vehicleAccess.data;
        specific.jobPost = jobPostAccess.data;
      } else if (user?.role === 'teacher') {
        const jobAppAccess = await checkJobApplicationAccess();
        specific.jobApplication = jobAppAccess.data;
      } else if (user?.role === 'vendor' || user?.role === 'supplier') {
        const productAccess = await checkProductListingAccess();
        specific.product = productAccess.data;
      }
      
      setSpecificAccess(specific);
    } catch (err: any) {
      console.error('Failed to load access info:', err);
      setError(err.message || 'Failed to load access information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Spinner className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">Loading access information...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <div className="ml-4">
          <p className="font-semibold">Error Loading Access Info</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </Alert>
    );
  }

  if (!accessControl) {
    return null;
  }

  if (compact) {
    // Compact view - just show persona and basic status
    return (
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="capitalize">
          {accessControl.persona}
        </Badge>
        {accessControl.subscription?.status === 'active' ? (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            No Subscription
          </Badge>
        )}
      </div>
    );
  }

  // Full view - show detailed access information
  const getPersonaIcon = () => {
    switch (accessControl.persona) {
      case 'institute':
        return <Briefcase className="w-4 h-4" />;
      case 'teacher':
        return <Users className="w-4 h-4" />;
      case 'vendor':
      case 'supplier':
        return <ShoppingCart className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const renderInstituteAccess = () => {
    return (
      <div className="space-y-4">
        {/* Vehicle Listing Access */}
        <div className="bg-slate-50 p-4 rounded-lg border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Vehicle Listings</h4>
                <p className="text-sm text-muted-foreground">Create and manage vehicle listings</p>
              </div>
            </div>
            {specificAccess.vehicle?.allowed ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Allowed
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <Lock className="w-3 h-3 mr-1" />
                Restricted
              </Badge>
            )}
          </div>
          
          {specificAccess.vehicle?.allowed ? (
            <p className="text-sm text-green-700 mt-2">
              Remaining: <span className="font-semibold">{specificAccess.vehicle?.remaining || 0}</span> listings
            </p>
          ) : (
            <p className="text-sm text-red-600 mt-2">
              {specificAccess.vehicle?.reason}
            </p>
          )}
        </div>

        {/* Job Post Access */}
        <div className="bg-slate-50 p-4 rounded-lg border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Job Posts</h4>
                <p className="text-sm text-muted-foreground">Post job openings for teachers</p>
              </div>
            </div>
            {specificAccess.jobPost?.allowed ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Allowed
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <Lock className="w-3 h-3 mr-1" />
                Restricted
              </Badge>
            )}
          </div>
          
          {specificAccess.jobPost?.allowed ? (
            <p className="text-sm text-green-700 mt-2">
              Remaining: <span className="font-semibold">{specificAccess.jobPost?.remaining || 0}</span> job posts
            </p>
          ) : (
            <p className="text-sm text-red-600 mt-2">
              {specificAccess.jobPost?.reason}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderTeacherAccess = () => {
    return (
      <div className="bg-slate-50 p-4 rounded-lg border">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold">Job Applications</h4>
              <p className="text-sm text-muted-foreground">Apply for job openings</p>
            </div>
          </div>
          {specificAccess.jobApplication?.allowed ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Allowed
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <Lock className="w-3 h-3 mr-1" />
              Restricted
            </Badge>
          )}
        </div>
        
        {specificAccess.jobApplication?.allowed ? (
          <div className="space-y-1 mt-2 text-sm text-green-700">
            <p>Profile Visibility: <span className="font-semibold capitalize">{specificAccess.jobApplication?.profileVisibility || 'Basic'}</span></p>
            <p>Job Board Access: <span className="font-semibold">Enabled</span></p>
          </div>
        ) : (
          <p className="text-sm text-red-600 mt-2">
            {specificAccess.jobApplication?.reason}
          </p>
        )}
      </div>
    );
  };

  const renderVendorAccess = () => {
    return (
      <div className="bg-slate-50 p-4 rounded-lg border">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <ShoppingCart className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-semibold">Product Listings</h4>
              <p className="text-sm text-muted-foreground">Create and manage product listings</p>
            </div>
          </div>
          {specificAccess.product?.allowed ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Allowed
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <Lock className="w-3 h-3 mr-1" />
              Restricted
            </Badge>
          )}
        </div>
        
        {specificAccess.product?.allowed ? (
          <p className="text-sm text-green-700 mt-2">
            Remaining: <span className="font-semibold">{specificAccess.product?.remaining || 0}</span> product listings
          </p>
        ) : (
          <p className="text-sm text-red-600 mt-2">
            {specificAccess.product?.reason}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPersonaIcon()}
            <div>
              <h3 className="font-semibold capitalize text-lg">{accessControl.persona} Persona</h3>
              <p className="text-sm text-muted-foreground">Your subscription features and limits</p>
            </div>
          </div>
          {accessControl.subscription?.status === 'active' ? (
            <Badge className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active Subscription
            </Badge>
          ) : (
            <Badge variant="secondary">No Active Subscription</Badge>
          )}
        </div>
      </Card>

      {/* Subscription Info */}
      {accessControl.subscription && showDetails && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Plan</p>
              <p className="text-sm font-semibold mt-1">{accessControl.subscription.planName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
              <Badge className="mt-1 capitalize bg-green-600 text-white">
                {accessControl.subscription.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Valid Until</p>
              <p className="text-sm font-semibold mt-1">
                {new Date(accessControl.subscription.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Feature-Specific Access */}
      {showDetails && (
        <>
          {accessControl.persona === 'institute' && renderInstituteAccess()}
          {accessControl.persona === 'teacher' && renderTeacherAccess()}
          {(accessControl.persona === 'vendor' || accessControl.persona === 'supplier') && renderVendorAccess()}
        </>
      )}
    </div>
  );
}
