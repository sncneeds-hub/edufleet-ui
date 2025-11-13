import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import RegistrationWizard from '@/pages/RegistrationWizard'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { InstitutesManagement } from '@/pages/admin/InstitutesManagement'
import { VehiclesManagement } from '@/pages/admin/VehiclesManagement'
import { AdsManagement } from '@/pages/admin/AdsManagement'
import { SubscriptionManagement } from '@/pages/admin/SubscriptionManagement'
import RevenueAnalytics from '@/pages/admin/RevenueAnalytics'
import FeaturedAdsManagement from '@/pages/admin/FeaturedAdsManagement'
import SchoolDashboard from '@/pages/school/SchoolDashboard'
import PostVehicle from '@/pages/school/PostVehicle'
import MyVehicles from '@/pages/school/MyVehicles'
import EditVehicle from '@/pages/school/EditVehicle'
import InstituteProfile from '@/pages/school/InstituteProfile'
import Inquiries from '@/pages/school/Inquiries'
import InquiryStatistics from '@/pages/school/InquiryStatistics'
import TransactionHistory from '@/pages/school/TransactionHistory'
import AnalyticsProducts from '@/pages/school/AnalyticsProducts'
import { BrowseVehicles } from '@/pages/BrowseVehicles'
import { VehicleDetail } from '@/pages/VehicleDetail'
import PricingPage from '@/pages/PricingPage'
import TaskSelector from '@/pages/TaskSelector'
import ServicesMarketplace from '@/pages/ServicesMarketplace'
import VendorDashboard from '@/pages/school/VendorDashboard'
import ProfessionalServicesManagement from '@/pages/admin/ProfessionalServicesManagement'
import { Toaster } from 'sonner'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Toaster position="top-right" />
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/register" element={<RegistrationWizard />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/tasks" element={<ProtectedAdminRoute><TaskSelector /></ProtectedAdminRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Admin Routes */}
          <Route path="/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/dashboard/institutes" element={<ProtectedAdminRoute><InstitutesManagement /></ProtectedAdminRoute>} />
          <Route path="/dashboard/vehicles" element={<ProtectedAdminRoute><VehiclesManagement /></ProtectedAdminRoute>} />
          <Route path="/dashboard/ads" element={<ProtectedAdminRoute><AdsManagement /></ProtectedAdminRoute>} />
          <Route path="/dashboard/featured-ads" element={<ProtectedAdminRoute><FeaturedAdsManagement /></ProtectedAdminRoute>} />
          <Route path="/dashboard/subscriptions" element={<ProtectedAdminRoute><SubscriptionManagement /></ProtectedAdminRoute>} />
          <Route path="/dashboard/revenue" element={<ProtectedAdminRoute><RevenueAnalytics /></ProtectedAdminRoute>} />
          <Route path="/dashboard/professional-services" element={<ProtectedAdminRoute><ProfessionalServicesManagement /></ProtectedAdminRoute>} />
          
          {/* School Routes */}
          <Route path="/school" element={<ProtectedSchoolRoute><SchoolDashboard /></ProtectedSchoolRoute>} />
          <Route path="/school/post-vehicle" element={<ProtectedSchoolRoute><PostVehicle /></ProtectedSchoolRoute>} />
          <Route path="/school/edit-vehicle/:id" element={<ProtectedSchoolRoute><EditVehicle /></ProtectedSchoolRoute>} />
          <Route path="/school/my-vehicles" element={<ProtectedSchoolRoute><MyVehicles /></ProtectedSchoolRoute>} />
          <Route path="/school/inquiries" element={<ProtectedSchoolRoute><Inquiries /></ProtectedSchoolRoute>} />
          <Route path="/school/statistics" element={<ProtectedSchoolRoute><InquiryStatistics /></ProtectedSchoolRoute>} />
          <Route path="/school/transactions" element={<ProtectedSchoolRoute><TransactionHistory /></ProtectedSchoolRoute>} />
          <Route path="/school/analytics" element={<ProtectedSchoolRoute><AnalyticsProducts /></ProtectedSchoolRoute>} />
          <Route path="/school/analytics-products" element={<ProtectedSchoolRoute><AnalyticsProducts /></ProtectedSchoolRoute>} />
          <Route path="/school/profile" element={<ProtectedSchoolRoute><InstituteProfile /></ProtectedSchoolRoute>} />
          <Route path="/school/services" element={<ProtectedSchoolRoute><ServicesMarketplace /></ProtectedSchoolRoute>} />
          <Route path="/school/vendor" element={<ProtectedSchoolRoute><VendorDashboard /></ProtectedSchoolRoute>} />
          
          {/* Public Routes */}
          <Route path="/vehicles" element={<BrowseVehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/services" element={<ServicesMarketplace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function ProtectedSchoolRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (user?.role !== 'school') {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

export default App  