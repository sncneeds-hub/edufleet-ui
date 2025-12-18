import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/AdminSidebar';
import { mockVehicles } from '@/mock/vehicleData';
import { useState, useEffect } from 'react';
import { getSupplierStats } from '@/api/services/supplierService';

export function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supplierStats, setSupplierStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, verified: 0 });

  useEffect(() => {
    loadSupplierStats();
  }, []);

  const loadSupplierStats = async () => {
    try {
      const response = await getSupplierStats();
      setSupplierStats(response.data);
    } catch (error) {
      console.error('Failed to load supplier stats');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted mb-6">Only admins can access this page</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  const pendingVehicles = mockVehicles.filter(v => v.status === 'pending').length;

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar 
        pendingVehicles={pendingVehicles} 
        pendingSuppliers={supplierStats.pending}
      />
      <main className="flex-1 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
