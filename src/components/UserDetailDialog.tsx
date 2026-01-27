import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Building2, User, Calendar, ShieldCheck, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface UserDetailDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  plans: any[];
}

export function UserDetailDialog({ user, isOpen, onClose, plans }: UserDetailDialogProps) {
  if (!user) return null;

  const plan = plans.find(p => p._id === user.subscription?.planId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{user.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{user.role}</Badge>
                {user.isActive ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Information
            </h3>
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Phone:</span>
                <span className="text-muted-foreground">{user.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Joined:</span>
                <span className="text-muted-foreground">
                  {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                </span>
              </div>
            </Card>
          </div>

          {/* Role Specific Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Institute Details
            </h3>
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Institute Name:</span>
                <span className="text-muted-foreground">{user.instituteName || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Contact Person:</span>
                <span className="text-muted-foreground">{user.contactPerson || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span className="text-muted-foreground">{user.location || 'N/A'}</span>
              </div>
            </Card>
          </div>

          {/* Subscription Info */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Subscription & Usage
            </h3>
            <Card className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Current Plan</p>
                  <p className="font-semibold text-primary">{plan?.displayName || 'No Active Plan'}</p>
                  {user.subscription?.endDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {format(new Date(user.subscription.endDate), 'PPP')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Listings Used</p>
                  <p className="font-semibold">{user.subscription?.listingsUsed || 0} / {user.subscription?.listingsLimit || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Job Posts Used</p>
                  <p className="font-semibold">{user.subscription?.jobPostsUsed || 0} / {user.subscription?.jobPostsLimit || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Verification & Access */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Account Status
            </h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant={user.isVerified ? "default" : "secondary"}>
                {user.isVerified ? "Verified Email" : "Unverified Email"}
              </Badge>
              <Badge variant={user.isActive ? "default" : "destructive"}>
                {user.isActive ? "Active Account" : "Suspended Account"}
              </Badge>
              {user.role === 'teacher' && (
                <Badge variant={user.isAvailable ? "default" : "secondary"}>
                  {user.isAvailable ? "Available for Hiring" : "Not Available"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
