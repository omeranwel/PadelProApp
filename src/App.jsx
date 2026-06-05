import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import AuthModal from './components/features/AuthModal';
import Chatbot from './components/features/Chatbot';
import Spinner from './components/ui/Spinner';
import ErrorBoundary from './components/layout/ErrorBoundary';
import NotificationToast from './components/ui/NotificationToast';

const NotFound = lazy(() => import('./pages/NotFound'));
const Home = lazy(() => import('./pages/Home'));
const Courts = lazy(() => import('./pages/Courts'));
const CourtDetail = lazy(() => import('./pages/CourtDetail'));
const Matches = lazy(() => import('./pages/Matches'));
const Market = lazy(() => import('./pages/Market'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SellItem = lazy(() => import('./pages/SellItem'));
const Community = lazy(() => import('./pages/Community'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Chat = lazy(() => import('./pages/Chat'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const ClubDashboard = lazy(() => import('./pages/ClubDashboard'));
const Login = lazy(() => import('./pages/Login'));
const ClubRegister = lazy(() => import('./pages/ClubRegister'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore();
  const { setIntendedPath } = useAppStore();
  const location = useLocation();
  React.useEffect(() => {
    if (!isLoggedIn) {
      setIntendedPath(location.pathname);
    }
  }, [isLoggedIn, location.pathname, setIntendedPath]);
  
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const logout = useAuthStore((state) => state.logout);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        await logout();
      }
      setAuthReady(true);
    });
    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, [logout]);

  if (!authReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-base text-text-primary">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-primary selection:bg-accent/20 selection:text-accent">
        <Navbar />
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courts" element={<ErrorBoundary><Courts /></ErrorBoundary>} />
          <Route path="/courts/:id" element={<ErrorBoundary><CourtDetail /></ErrorBoundary>} />
          <Route path="/market" element={<Market />} />
          <Route path="/market/:id" element={<ProductDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/club" element={<ProtectedRoute><ClubRegister /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><ErrorBoundary><Matches /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/market/sell" element={<ProtectedRoute><SellItem /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="/club" element={<ProtectedRoute><ClubDashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <MobileNav />
      <AuthModal />
      <Chatbot />
      <NotificationToast />
    </div>
  </Router>
  );
};

export default App;
