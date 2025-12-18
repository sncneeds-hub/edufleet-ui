import React, { useState } from 'react';
import { useAds } from '../../../context/AdContext';
import { AdTable } from '../../../components/ads/AdTable';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Ad, AdStatus } from '../../../types/adTypes';
import { toast } from 'sonner';

const AdManagement: React.FC = () => {
  const { ads, deleteAd, updateAd } = useAds();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ad.advertiser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      deleteAd(id);
      toast.success('Ad deleted successfully');
    }
  };

  const handleToggleStatus = (id: string, currentStatus: AdStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateAd(id, { status: newStatus });
    toast.success(`Ad ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
  };

  const handleEdit = (ad: Ad) => {
    navigate(`/admin/ads/edit/${ad.id}`);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Ad Management</h2>
           <p className="text-muted-foreground">Manage all your ad campaigns</p>
        </div>
        <Button onClick={() => navigate('/admin/ads/create')}>
          <Plus className="mr-2 h-4 w-4" /> Create New Ad
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input 
          placeholder="Search by title or advertiser..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdTable 
        ads={filteredAds} 
        onDelete={handleDelete}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};

export default AdManagement;
