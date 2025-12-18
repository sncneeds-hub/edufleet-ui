import React, { useState } from 'react';
import { Ad, AdStatus } from '../../types/adTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit, Pause, Play, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';

interface AdTableProps {
  ads: Ad[];
  onEdit: (ad: Ad) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: AdStatus) => void;
  onView?: (ad: Ad) => void;
}

const getStatusColor = (status: AdStatus) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'paused': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'expired': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    case 'pending': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'rejected': return 'bg-red-100 text-red-800 hover:bg-red-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const AdTable: React.FC<AdTableProps> = ({ ads, onEdit, onDelete, onToggleStatus, onView }) => {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  
  const handleView = (ad: Ad) => {
    if (onView) {
      onView(ad);
    } else {
      setSelectedAd(ad);
    }
  };
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Details</TableHead>
            <TableHead>Placement</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                No ads found.
              </TableCell>
            </TableRow>
          ) : (
            ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{ad.title}</span>
                    <span className="text-xs text-muted-foreground">{ad.advertiser}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{ad.placement}</code>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(ad.status)} variant="secondary">
                    {ad.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    <div>{ad.impressions.toLocaleString()} imps</div>
                    <div>{ad.clicks.toLocaleString()} clicks</div>
                    <div className="text-muted-foreground">
                      {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}% CTR
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    <div>{format(new Date(ad.startDate), 'MMM d, yyyy')}</div>
                    <div>to {format(new Date(ad.endDate), 'MMM d, yyyy')}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleView(ad)} title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(ad)} title="Edit Ad">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onToggleStatus(ad.id, ad.status)}
                      disabled={ad.status === 'expired' || ad.status === 'rejected'}
                      title={ad.status === 'paused' ? 'Activate Ad' : 'Pause Ad'}
                    >
                      {ad.status === 'paused' ? (
                        <Play className="h-4 w-4 text-green-600" />
                      ) : (
                        <Pause className="h-4 w-4 text-yellow-600" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(ad.id)} title="Delete Ad">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* View Ad Dialog */}
      <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ad Details</DialogTitle>
            <DialogDescription>Complete information for this advertisement</DialogDescription>
          </DialogHeader>
          {selectedAd && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ad Title</p>
                  <p className="text-base font-semibold mt-1">{selectedAd.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Advertiser</p>
                  <p className="text-base font-semibold mt-1">{selectedAd.advertiser}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={`${getStatusColor(selectedAd.status)} mt-1`} variant="secondary">
                    {selectedAd.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-base mt-1 capitalize">{selectedAd.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Placement</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{selectedAd.placement}</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <p className="text-base mt-1">{selectedAd.priority}/10</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-base mt-1">{format(new Date(selectedAd.startDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-base mt-1">{format(new Date(selectedAd.endDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Target URL</p>
                <a 
                  href={selectedAd.targetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {selectedAd.targetUrl}
                </a>
              </div>
              
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="text-2xl font-bold text-primary">{selectedAd.impressions.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p className="text-2xl font-bold text-secondary">{selectedAd.clicks.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="text-2xl font-bold">
                    {selectedAd.impressions > 0 ? ((selectedAd.clicks / selectedAd.impressions) * 100).toFixed(2) : 0}%
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Preview</p>
                <div className="border rounded-lg p-4 bg-background">
                  {selectedAd.type === 'image' && selectedAd.mediaUrl && (
                    <img src={selectedAd.mediaUrl} alt={selectedAd.title} className="w-full h-auto rounded" />
                  )}
                  {selectedAd.type === 'video' && selectedAd.mediaUrl && (
                    <video src={selectedAd.mediaUrl} controls className="w-full h-auto rounded" />
                  )}
                  {selectedAd.type === 'html' && selectedAd.htmlContent && (
                    <div dangerouslySetInnerHTML={{ __html: selectedAd.htmlContent }} />
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
