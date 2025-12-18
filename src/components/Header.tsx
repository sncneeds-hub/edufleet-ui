import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, LayoutDashboard, Megaphone, Bell, Search } from 'lucide-react';
import { useState } from 'react';
import { NotificationBell } from '@/components/NotificationBell';

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

  const handleDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else if (user?.role === 'institute') {
      navigate('/dashboard');
    }
  };

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
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-4">
          <Link to="/" className="text-2xl font-bold flex items-center gap-1 shrink-0">
            <span className="text-primary font-display tracking-tight">Edu</span>
            <span className="text-accent font-display tracking-tight">Fleet</span>
          </Link>

          {/* Search Bar - Visible on desktop inner pages */}
          {location.pathname !== '/' && (
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <input 
                type="text" 
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={handleHeaderSearch}
                placeholder="Search vehicles, jobs, suppliers..." 
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-muted/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all" 
              />
              <button onClick={performSearch} className="absolute left-3 top-3 text-muted-foreground hover:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link to="/browse" className="hover:text-primary transition-colors">Vehicles</Link>
              <Link to="/jobs" className="hover:text-primary transition-colors">Jobs</Link>
              <Link to="/suppliers" className="hover:text-primary transition-colors">Suppliers</Link>
              <div className="h-4 w-px bg-border"></div>
              <Link to="/advertise" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Megaphone className="w-4 h-4" />
                <span>Advertise</span>
              </Link>
              <Link to="/signup" className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors font-bold px-3 py-1.5 border border-accent rounded-md">
                <span className="uppercase text-xs tracking-wide">Free Listing</span>
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <NotificationBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 hover:bg-muted p-1 rounded-full transition-colors focus:outline-none">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-semibold text-foreground">{user.name}</div>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
                      <div className="my-1 h-px bg-border" />
                      <DropdownMenuItem onClick={handleDashboard} className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                  <Button 
                    onClick={() => navigate('/signup')} 
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
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
              <Link to="/browse" className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <span className="font-medium">Vehicles</span>
              </Link>
              <Link to="/jobs" className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <span className="font-medium">Jobs</span>
              </Link>
              <Link to="/suppliers" className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <span className="font-medium">Suppliers</span>
              </Link>
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
