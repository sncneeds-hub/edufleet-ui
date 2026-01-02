import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/api/types';
import { CheckCircle2, XCircle, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useVehicles, useAdminActions } from '@/hooks/useApi';

export function VehicleManagement() {
  const { type } = useParams<{ type: 'pending' | 'all' }>();
  const isPendingView = type === 'pending';
  
  // Fetch vehicles from API
  const { vehicles: allVehicles, loading, refetch } = useVehicles(
    isPendingView ? { status: 'pending' } : {}
  );
  const { approveVehicle, rejectVehicle, togglePriority, loading: actionLoading } = useAdminActions();
  
  const [priorities, setPriorities] = useState<Set<string>>(new Set());

  // Update priorities when vehicles load
  useEffect(() => {
    const priorityIds = allVehicles.filter(v => v.isPriority).map(v => v.id || (v as any)._id);
    setPriorities(new Set(priorityIds));
  }, [allVehicles]);

  const displayVehicles = allVehicles;

  const handleApprove = async (id: string) => {
    try {
      await approveVehicle(id);
      toast.success('Listing approved successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve listing');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectVehicle(id);
      toast.error('Listing rejected');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject listing');
    }
  };

  const handleTogglePriority = async (id: string) => {
    const isPriority = priorities.has(id);
    try {
      await togglePriority(id, !isPriority);
      const newPriorities = new Set(priorities);
      if (isPriority) {
        newPriorities.delete(id);
      } else {
        newPriorities.add(id);
      }
      setPriorities(newPriorities);
      toast.success(newPriorities.has(id) ? 'Marked as priority' : 'Removed from priority');
      refetch();
    } catch (error) {
      toast.error('Failed to update priority status');
    }
  };

  const handleApproveAll = async () => {
    const pendingIds = displayVehicles.filter(v => v.status === 'pending').map(v => v.id || (v as any)._id);
    if (pendingIds.length === 0) {
      toast.info('No pending listings to approve');
      return;
    }
    try {
      await Promise.all(pendingIds.map(id => approveVehicle(id)));
      toast.success(`Approved ${pendingIds.length} pending listing(s)`);
      refetch();
    } catch (error) {
      toast.error('Failed to approve all listings');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isPendingView ? 'Pending Vehicle Listings' : 'All Vehicle Listings'}
          </h1>
          <p className="text-muted-foreground">
            {isPendingView 
              ? 'Review and approve new vehicle listings' 
              : 'Manage all vehicle listings and priority status'}
          </p>
        </div>
        {isPendingView && displayVehicles.length > 0 && (
          <Button onClick={handleApproveAll} size="sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve All Pending
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Listings</p>
            <div className="text-3xl font-bold text-primary">{allVehicles.length}</div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Pending Approval</p>
            <div className="text-3xl font-bold text-accent">
              {allVehicles.filter(v => v.status === 'pending').length}
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Approved</p>
            <div className="text-3xl font-bold text-secondary">
              {allVehicles.filter(v => v.status === 'approved').length}
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Priority Listings</p>
            <div className="text-3xl font-bold">{priorities.size}</div>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        {displayVehicles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-2">No {isPendingView ? 'pending' : ''} listings found</p>
            <p className="text-xs text-muted-foreground">Listings will appear here as they are submitted</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id || (vehicle as any)._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{vehicle.title}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.manufacturer} {vehicle.model}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{vehicle.sellerName}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.sellerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">₹{vehicle.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          vehicle.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : vehicle.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleTogglePriority(vehicle.id || (vehicle as any)._id)}
                        disabled={actionLoading}
                        className="flex items-center gap-2 hover:text-primary smooth-transition disabled:opacity-50"
                        title="Toggle Priority"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            priorities.has(vehicle.id || (vehicle as any)._id) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {vehicle.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(vehicle.id || (vehicle as any)._id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(vehicle.id || (vehicle as any)._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
