import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, CheckSquare, BarChart2, ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';

const AdminAdSidebar = () => {
  return (
    <div className="w-64 border-r bg-muted/10 min-h-screen p-4 space-y-4">
      <div className="font-semibold text-lg px-2 mb-6 text-primary flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5" /> Ad Manager
      </div>
      
      <div className="space-y-1">
        <NavLink 
          to="/admin/ads" 
          end
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </NavLink>
        <NavLink 
          to="/admin/ads/create" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <PlusCircle className="w-4 h-4" /> Create Ad
        </NavLink>
        <NavLink 
          to="/admin/ads/manage" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="w-4 h-4" /> All Ads
        </NavLink>
        <NavLink 
          to="/admin/ads/requests" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="w-4 h-4" /> Ad Requests
        </NavLink>
        <NavLink 
          to="/admin/ads/approvals" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <CheckSquare className="w-4 h-4" /> Approvals
        </NavLink>
        <NavLink 
          to="/admin/ads/analytics" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart2 className="w-4 h-4" /> Analytics
        </NavLink>
      </div>
    </div>
  );
};

export const AdminAdLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AdminAdSidebar />
      <div className="flex-1 bg-background">
        <div className="p-4 border-b flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
           <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
           </Button>
           <div className="text-sm text-muted-foreground">Admin Ad Management Portal</div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
