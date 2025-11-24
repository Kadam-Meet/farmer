import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound";
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import FarmerDashboard from './components/Dashboard/FarmerDashboard';
import WorkerDashboard from './components/Dashboard/WorkerDashboard';
import AgriTools from './pages/AgriTools';
import Browse from './pages/Browse';
import AddListing from './pages/AddListing';
import BookingHistory from './pages/BookingHistory';
import ListingDetail from './pages/ListingDetail';
import { FloatingChatbot } from './components/Dashboard/FloatingChatbot';
import { useApp } from '@/context/AppContext';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const location = useLocation();
  const { language } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        <Route path="/agri-tools" element={<AgriTools />} />
        <Route path="/lease-equipment" element={<Browse />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/add-listing" element={<AddListing />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Floating Chatbot - appears on all pages except landing page */}
      {location.pathname !== '/' && <FloatingChatbot language={language} />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;