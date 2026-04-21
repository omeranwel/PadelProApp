import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/features/AuthModal';
import Chatbot from './components/features/Chatbot';
import Spinner from './components/ui/Spinner';

import ErrorBoundary from './components/layout/ErrorBoundary';

// Lazy loading pages
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

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, setIntendedPath } = useAppStore();
  const location = useLocation();
  if (!isLoggedIn) {
    setIntendedPath(location.pathname);
    openAuthModal('signin');
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-primary selection:bg-accent-blue/30 selection:text-white">
        <Navbar />
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courts" element={<ErrorBoundary><Courts /></ErrorBoundary>} />
            <Route path="/courts/:id" element={<ErrorBoundary><CourtDetail /></ErrorBoundary>} />
            <Route path="/market" element={<Market />} />
            <Route path="/market/:id" element={<ProductDetail />} />
            <Route path="/community" element={<Community />} />
            
            {/* Protected Routes */}
            <Route path="/matches" element={<ProtectedRoute><ErrorBoundary><Matches /></ErrorBoundary></ProtectedRoute>} />
            <Route path="/market/sell" element={<ProtectedRoute><SellItem /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
        <AuthModal />
        <Chatbot />
      </div>
    </Router>
  );
};

export default App;
