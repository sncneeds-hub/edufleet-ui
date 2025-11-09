import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { InstitutesManagement } from '@/pages/admin/InstitutesManagement'
import { VehiclesManagement } from '@/pages/admin/VehiclesManagement'
import SchoolDashboard from '@/pages/school/SchoolDashboard'
import PostVehicle from '@/pages/school/PostVehicle'
import MyVehicles from '@/pages/school/MyVehicles'
import EditVehicle from '@/pages/school/EditVehicle'
import InstituteProfile from '@/pages/school/InstituteProfile'
import Inquiries from '@/pages/school/Inquiries'
import { BrowseVehicles } from '@/pages/BrowseVehicles'
import { VehicleDetail } from '@/pages/VehicleDetail'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route path="/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/dashboard/institutes" element={<ProtectedAdminRoute><InstitutesManagement /></ProtectedAdminRoute>} />
          <Route path="/dashboard/vehicles" element={<ProtectedAdminRoute><VehiclesManagement /></ProtectedAdminRoute>} />

          {/* School Routes */}
          <Route path="/school" element={<ProtectedSchoolRoute><SchoolDashboard /></ProtectedSchoolRoute>} />
          <Route path="/school/post-vehicle" element={<ProtectedSchoolRoute><PostVehicle /></ProtectedSchoolRoute>} />
          <Route path="/school/edit-vehicle/:id" element={<ProtectedSchoolRoute><EditVehicle /></ProtectedSchoolRoute>} />
          <Route path="/school/my-vehicles" element={<ProtectedSchoolRoute><MyVehicles /></ProtectedSchoolRoute>} />
          <Route path="/school/inquiries" element={<ProtectedSchoolRoute><Inquiries /></ProtectedSchoolRoute>} />
          <Route path="/school/profile" element={<ProtectedSchoolRoute><InstituteProfile /></ProtectedSchoolRoute>} />

          {/* Public Routes */}
          <Route path="/vehicles" element={<BrowseVehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}

function ProtectedSchoolRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'school') return <Navigate to="/" replace />

  return <>{children}</>
}

export default App
