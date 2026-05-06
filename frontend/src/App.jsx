import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider, useApp } from './context/AppContext'
import { SocketProvider } from './context/SocketContext'
import { BusinessAuthProvider } from './context/BusinessAuthContext'
import { useState } from 'react'
import Preloader from './components/ui/Preloader'
import CustomCursor from './components/ui/Cursor'
import ScrollProgressBar from './components/ui/ScrollProgressBar'

// Business Portal
import BusinessRegister from './pages/business/BusinessRegister'
import BusinessLogin from './pages/business/BusinessLogin'
import OwnerDashboard from './pages/business/OwnerDashboard'
import MenuManagement from './pages/business/MenuManagement'
import RoomManagement from './pages/business/RoomManagement'
import HallManagement from './pages/business/HallManagement'
import ReviewsPage from './pages/business/ReviewsPage'
import SettingsPage from './pages/business/SettingsPage'
import NotificationsPage from './pages/business/NotificationsPage'
import NearbyBusinesses from './pages/business/NearbyBusinesses'
import BusinessDetail from './pages/business/BusinessDetail'
import OwnerProfile from './pages/business/OwnerProfile'
import LocationAndMap from './pages/business/LocationAndMap'

// Public Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import BookingPage from './pages/customer/BookingPage'
import TrackCoolie from './pages/customer/TrackCoolie'
import PaymentPage from './pages/customer/PaymentPage'
import BookingHistory from './pages/customer/BookingHistory'
import RatingPage from './pages/customer/RatingPage'
import TrainStatus from './pages/customer/TrainStatus'
import CustomerProfile from './pages/customer/CustomerProfile'
import ReceiptsPage from './pages/customer/ReceiptsPage'
import BookingReceipt from './pages/customer/BookingReceipt'
import CustomerBusinesses from './pages/customer/CustomerBusinesses'

// Coolie Pages
import CoolieDashboard from './pages/coolie/CoolieDashboard'
import CoolieProfile from './pages/coolie/CoolieProfile'
import CoolieEarnings from './pages/coolie/CoolieEarnings'
import Leaderboard from './pages/coolie/Leaderboard'
import CoolieHeroRanking from './pages/coolie/CoolieHeroRanking'
import CoolieVerification from './pages/coolie/CoolieVerification'
import CoolieReceiptsPage from './pages/coolie/CoolieReceiptsPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCoolies from './pages/admin/AdminCoolies'
import AdminBookings from './pages/admin/AdminBookings'
import AdminDisputes from './pages/admin/AdminDisputes'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminBusinesses from './pages/admin/AdminBusinesses'

const ProtectedRoute = ({ children, allowedRole }) => {
  const { role } = useApp()
  if (!role) return <Navigate to="/login" replace />
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { role } = useApp()
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoute allowedRole="customer"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/book" element={<ProtectedRoute allowedRole="customer"><BookingPage /></ProtectedRoute>} />
      <Route path="/customer/track" element={<ProtectedRoute allowedRole="customer"><TrackCoolie /></ProtectedRoute>} />
      <Route path="/customer/payment" element={<ProtectedRoute allowedRole="customer"><PaymentPage /></ProtectedRoute>} />
      <Route path="/customer/history" element={<ProtectedRoute allowedRole="customer"><BookingHistory /></ProtectedRoute>} />
      <Route path="/customer/rate" element={<ProtectedRoute allowedRole="customer"><RatingPage /></ProtectedRoute>} />
            <Route path="/customer/trains" element={<ProtectedRoute allowedRole="customer"><TrainStatus /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute allowedRole="customer"><CustomerProfile /></ProtectedRoute>} />
                        <Route path="/customer/receipts" element={<ProtectedRoute allowedRole="customer"><ReceiptsPage /></ProtectedRoute>} />
      <Route path="/customer/receipt/:id" element={<ProtectedRoute allowedRole="customer"><BookingReceipt /></ProtectedRoute>} />
      <Route path="/customer/businesses" element={<ProtectedRoute allowedRole="customer"><CustomerBusinesses /></ProtectedRoute>} />

      {/* Coolie */}
      <Route path="/coolie" element={<ProtectedRoute allowedRole="coolie"><CoolieDashboard /></ProtectedRoute>} />
      <Route path="/coolie/profile" element={<ProtectedRoute allowedRole="coolie"><CoolieProfile /></ProtectedRoute>} />
      <Route path="/coolie/earnings" element={<ProtectedRoute allowedRole="coolie"><CoolieEarnings /></ProtectedRoute>} />
      <Route path="/coolie/leaderboard" element={<ProtectedRoute allowedRole="coolie"><Leaderboard /></ProtectedRoute>} />
      <Route path="/coolie/rankings" element={<ProtectedRoute allowedRole="coolie"><CoolieHeroRanking /></ProtectedRoute>} />
                        <Route path="/coolie/receipts" element={<ProtectedRoute allowedRole="coolie"><CoolieReceiptsPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/coolies" element={<ProtectedRoute allowedRole="admin"><AdminCoolies /></ProtectedRoute>} />
      <Route path="/admin/businesses" element={<ProtectedRoute allowedRole="admin"><AdminBusinesses /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute allowedRole="admin"><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/disputes" element={<ProtectedRoute allowedRole="admin"><AdminDisputes /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="admin"><AdminAnalytics /></ProtectedRoute>} />


      {/* Business Portal */}
      <Route path="/register/business" element={<BusinessRegister />} />
      <Route path="/business/login" element={<BusinessLogin />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/profile" element={<OwnerProfile />} />
      <Route path="/owner/location" element={<LocationAndMap />} />
      <Route path="/owner/menu" element={<MenuManagement />} />
      <Route path="/owner/rooms" element={<RoomManagement />} />
      <Route path="/owner/halls" element={<HallManagement />} />
      <Route path="/owner/reviews" element={<ReviewsPage />} />
      <Route path="/owner/settings" element={<SettingsPage />} />
      <Route path="/owner/notifications" element={<NotificationsPage />} />

      {/* Public Business Pages (require customer login) */}
      <Route path="/station/:stationId/nearby" element={<ProtectedRoute allowedRole="customer"><NearbyBusinesses /></ProtectedRoute>} />
      <Route path="/business/:businessId" element={<ProtectedRoute allowedRole="customer"><BusinessDetail /></ProtectedRoute>} />

      {/* Public Verification (QR Scan) */}
      <Route path="/verify/coolie/:id" element={<CoolieVerification />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const handlePreloaderComplete = React.useCallback(() => setLoaded(true), []);
  
  return (
    <AppProvider>
      <BusinessAuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <CustomCursor />
        <ScrollProgressBar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(249,115,22,0.3)' },
            duration: 4000,
          }}
        />
        {loaded ? <AppRoutes /> : <Preloader onComplete={handlePreloaderComplete} />}
      </BrowserRouter>
      </SocketProvider>
      </BusinessAuthProvider>
    </AppProvider>
  )
}
