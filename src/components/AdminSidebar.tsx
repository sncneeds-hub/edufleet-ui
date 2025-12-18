import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Building2, 
  Megaphone,
  Settings,
  Clock,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  pendingVehicles: number;
  pendingSuppliers: number;
}

export function AdminSidebar({ pendingVehicles, pendingSuppliers }: AdminSidebarProps) {
  const location = useLocation();

  const navItems = [
    {
      title: 'Overview',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      title: 'Vehicles',
      icon: Car,
      children: [
        {
          title: 'Pending Approval',
          path: '/admin/vehicles/pending',
          icon: Clock,
          badge: pendingVehicles
        },
        {
          title: 'All Vehicles',
          path: '/admin/vehicles/all',
          icon: CheckCircle
        }
      ]
    },
    {
      title: 'Suppliers',
      icon: Building2,
      children: [
        {
          title: 'Pending Approval',
          path: '/admin/suppliers/pending',
          icon: Clock,
          badge: pendingSuppliers
        },
        {
          title: 'All Suppliers',
          path: '/admin/suppliers/all',
          icon: CheckCircle
        }
      ]
    },
    {
      title: 'Ads Management',
      path: '/admin/ads',
      icon: Megaphone
    },
    {
      title: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: CreditCard
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center px-6">
        <h2 className="text-lg font-bold text-primary">Admin Panel</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                          isActive(child.path)
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <child.icon className="w-4 h-4" />
                          <span>{child.title}</span>
                        </div>
                        {child.badge !== undefined && child.badge > 0 && (
                          <Badge variant={isActive(child.path) ? "secondary" : "default"} className="h-5 min-w-5 px-1.5">
                            {child.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path!}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive(item.path!, item.exact)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>© 2024 EduFleet</p>
          <p className="mt-1">Admin Dashboard</p>
        </div>
      </div>
    </aside>
  );
}
