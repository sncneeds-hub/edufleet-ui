import React from 'react';
import { useAds } from '../../../context/AdContext';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdRequests: React.FC = () => {
  const { adRequests, updateAdRequestStatus } = useAds();

  const handleStatusChange = (id: string, newStatus: any) => {
    updateAdRequestStatus(id, newStatus);
    toast.success(`Request marked as ${newStatus}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Mail className="w-3 h-3 mr-1" /> Contacted</Badge>;
      case 'converted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Converted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ad Requests</h2>
        <p className="text-muted-foreground">Manage incoming advertising inquiries</p>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Interested In</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No ad requests found
                </TableCell>
              </TableRow>
            ) : (
              adRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(request.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{request.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {request.email}
                    </div>
                    {request.phone && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {request.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{request.company}</TableCell>
                  <TableCell>{request.adType}</TableCell>
                  <TableCell className="max-w-xs truncate" title={request.message}>
                    {request.message || '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(request.id, 'contacted')}
                          >
                            Mark Contacted
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleStatusChange(request.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status === 'contacted' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusChange(request.id, 'converted')}
                        >
                          Convert to Ad
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdRequests;
