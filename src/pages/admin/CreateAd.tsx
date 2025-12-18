import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAds } from '../../../context/AdContext';
import { AdForm } from '../../../components/ads/AdForm';
import { useToast } from '../../../hooks/use-toast';

const CreateAd: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ads, addAd, updateAd } = useAds();
  const { toast } = useToast();
  const [initialData, setInitialData] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const ad = ads.find(a => a.id === id);
      if (ad) {
        setInitialData(ad);
      } else {
        toast({ title: 'Error', description: 'Ad not found', variant: 'destructive' });
        navigate('/admin/ads');
      }
    }
  }, [id, ads, navigate, toast]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (id) {
      updateAd(id, data);
      toast({ title: 'Success', description: 'Ad updated successfully' });
    } else {
      addAd(data);
      toast({ title: 'Success', description: 'Ad created successfully' });
    }
    
    setLoading(false);
    navigate('/admin/ads');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <AdForm 
        initialData={initialData} 
        onSubmit={handleSubmit} 
        isSubmitting={loading}
      />
    </div>
  );
};

export default CreateAd;
