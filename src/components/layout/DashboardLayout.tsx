import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Bus, LogOut, LayoutDashboard, Car, Building2, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NotificationBell } from './NotificationBell'

interface DashboardLayoutProps {
  children: ReactNode
  activeTab?: string
}

export function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isAdmin = user?.role === 'admin'
  const isSchool = user?.role === 'school'
  const basePath = isAdmin ? '/dashboard' : '/school'

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col">
        <div className="h-16 border-b flex items-center px-4 gap-2">
          <Bus className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">EduFleet</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => navigate(basePath)}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          
          {isAdmin ? (
            <>
              <Button
                variant={activeTab === 'institutes' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/dashboard/institutes')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Institutes
              </Button>
              <Button
                variant={activeTab === 'vehicles' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/dashboard/vehicles')}
              >
                <Car className="h-4 w-4 mr-2" />
                Vehicle Approvals
              </Button>
            </>
          ) : isSchool ? (
            <>
              <Button
                variant={activeTab === 'my-vehicles' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/school/my-vehicles')}
              >
                <Car className="h-4 w-4 mr-2" />
                My Vehicles
              </Button>
              <Button
                variant={activeTab === 'inquiries' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/school/inquiries')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Inquiries
              </Button>
              <Button
                variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/school/profile')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Institute Profile
              </Button>
            </>
          ) : null}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">
            {isAdmin ? 'Admin Dashboard' : 'School Dashboard'}
          </h1>
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
