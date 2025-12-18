import React from 'react';
import { useAds } from '../../../context/AdContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Check, X } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';

const AdApprovals: React.FC = () => {
  const { ads, updateAd } = useAds();
  const { toast } = useToast();
  const pendingAds = ads.filter(ad => ad.status === 'pending');

  const handleApprove = (id: string) => {
    updateAd(id, { status: 'active' });
    toast({ title: 'Approved', description: 'Ad is now active.' });
  };

  const handleReject = (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason !== null) {
      updateAd(id, { status: 'rejected', rejectionReason: reason });
      toast({ title: 'Rejected', description: 'Ad has been rejected.' });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
         <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
         <p className="text-muted-foreground">Review and approve ad campaigns</p>
      </div>

      {pendingAds.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/10">
          <p className="text-lg text-muted-foreground">No pending ads to review.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingAds.map(ad => (
            <Card key={ad.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                   <Badge variant="outline">{ad.placement}</Badge>
                   <span className="text-xs text-muted-foreground">{ad.advertiser}</span>
                </div>
                <CardTitle className="text-lg mt-2">{ad.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                 <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center border">
                    {ad.type === 'image' && <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />}
                    {ad.type === 'video' && <video src={ad.mediaUrl} className="w-full h-full object-cover" />}
                    {ad.type === 'html' && <div className="text-xs p-2 text-muted-foreground">HTML Content Preview</div>}
                 </div>
                 <div className="text-sm space-y-1">
                   <p><strong>Target:</strong> <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="text-blue-600 truncate block">{ad.targetUrl}</a></p>
                   <p><strong>Priority:</strong> {ad.priority}</p>
                   <p><strong>Duration:</strong> {ad.startDate} - {ad.endDate}</p>
                 </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(ad.id)}>
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleReject(ad.id)}>
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdApprovals;
