import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, LayoutDashboard, Megaphone, Bell, Search, UserCircle, Crown } from 'lucide-react';
import { useState } from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboard = (tab?: string) => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      // Default to institute dashboard for any other role
      if (tab === 'profile') {
        navigate('/dashboard?tab=profile');
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Determine which menu items to show based on user role
  const shouldShowTeacherNav = user?.role === 'teacher';
  const shouldShowInstituteNav = user?.role === 'institute' || (!user?.role && user);

  const handleHeaderSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const performSearch = () => {
    if (headerSearch.toLowerCase().includes('job')) {
      navigate('/jobs');
    } else if (headerSearch.toLowerCase().includes('supplier')) {
      navigate('/suppliers');
    } else {
      navigate('/browse');
    }
    setHeaderSearch('');
  }

  return (
    <header className="glass-nav sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center gap-4">
          <Link to="/" className="text-2xl lg:text-3xl font-bold flex items-center gap-1.5 shrink-0 group">
            <span className="text-primary font-display tracking-tight transition-colors group-hover:text-primary-light">Edu</span>
            <span className="text-accent font-display tracking-tight transition-colors group-hover:text-accent-light">Fleet</span>
            <span className="text-xs font-sans text-muted-foreground ml-1 hidden sm:inline">Exchange</span>
          </Link>

          {/* Search Bar - Visible on desktop inner pages */}
          {location.pathname !== '/' && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <input 
                type="text" 
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={handleHeaderSearch}
                placeholder="Search vehicles, jobs, suppliers..." 
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border bg-background/60 focus:bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60 text-sm" 
              />
              <button onClick={performSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                <Search className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-7 text-sm font-medium">
              {!shouldShowTeacherNav && (
                <>
                  <Link to={user?.role === 'institute' ? "/dashboard?tab=listings" : "/browse"} className="text-foreground/70 hover:text-primary transition-all relative group">
                    <span>Vehicles</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/jobs" className="text-foreground/70 hover:text-primary transition-all relative group">
                    <span>Jobs</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/suppliers" className="text-foreground/70 hover:text-primary transition-all relative group">
                    <span>Suppliers</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/#pricing" className="text-foreground/70 hover:text-primary transition-all relative group">
                    <span>Pricing</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                  </Link>
                  <div className="h-5 w-px bg-border/70"></div>
                </>
              )}
              {shouldShowTeacherNav && (
                <Link to="/jobs" className="text-foreground/70 hover:text-primary transition-all relative group">
                  <span>Browse Jobs</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              )}
              <Link to="/advertise" className="flex items-center gap-1.5 text-foreground/70 hover:text-secondary transition-all">
                <Megaphone className="w-4 h-4" />
                <span>Advertise</span>
              </Link>
              <Link to="/signup" className="flex items-center gap-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-all font-semibold px-4 py-2 border border-accent/30 hover:border-accent rounded-lg shadow-sm hover:shadow-md">
                <span className="uppercase text-xs tracking-wide">Free Listing</span>
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <NotificationBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2.5 hover:bg-muted/50 px-2 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-border/60 hover:border-primary/40 transition-colors">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium max-w-[100px] truncate text-foreground">{user.name}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 shadow-lg">
                      <div className="px-3 py-2.5 border-b border-border">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-semibold text-foreground truncate max-w-[140px]">{user.name}</div>
                          {user.subscription?.planId?.displayName && (
                            <Badge variant="outline" className="text-[10px] h-5 bg-primary/5 text-primary border-primary/20 px-1.5 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5" />
                              {(user.subscription.planId as any).displayName}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                      <DropdownMenuItem onClick={() => handleDashboard()} className="cursor-pointer py-2.5 px-3">
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDashboard('profile')} className="cursor-pointer py-2.5 px-3">
                        <UserCircle className="w-4 h-4 mr-3" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive py-2.5 px-3">
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-3 py-2">Login</Link>
                  <Button 
                    onClick={() => navigate('/signup')} 
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary-light shadow-sm hover:shadow-md transition-all font-semibold px-5 py-2.5"
                  >
                    Sign Up Free
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-muted rounded-md transition-colors text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {!shouldShowTeacherNav ? (
                <>
                  <Link to={user?.role === 'institute' ? "/dashboard?tab=listings" : "/browse"} className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="font-medium">Vehicles</span>
                  </Link>
                  <Link to="/jobs" className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="font-medium">Jobs</span>
                  </Link>
                  <Link to="/suppliers" className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="font-medium">Suppliers</span>
                  </Link>
                  <Link to="/#pricing" className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="font-medium">Pricing</span>
                  </Link>
                </>
              ) : (
                <Link to="/jobs" className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors col-span-2">
                  <span className="font-medium">Browse Jobs</span>
                </Link>
              )}
              <Link to="/advertise" className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <span className="font-medium">Advertise</span>
              </Link>
            </div>
            
            <div className="border-t border-border pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                      <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => { handleDashboard(); setMobileMenuOpen(false); }}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  >
                    Login
                  </Button>
                  <Button 
                    className="w-full bg-primary text-primary-foreground" 
                    onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
