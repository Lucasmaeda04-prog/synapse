import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Decks from "./pages/Decks";
import DeckNew from "./pages/DeckNew";
import DeckDetail from "./pages/DeckDetail";
import Classes from "./pages/Classes";
import ClassNew from "./pages/ClassNew";
import ClassDetail from "./pages/ClassDetail";
import Study from "./pages/Study";
import Reports from "./pages/Reports";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout><Dashboard /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/decks" element={
              <ProtectedRoute>
                <DashboardLayout><Decks /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/decks/new" element={
              <ProtectedRoute requiredRole="TEACHER">
                <DashboardLayout><DeckNew /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/decks/:deckId" element={
              <ProtectedRoute>
                <DashboardLayout><DeckDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/classes" element={
              <ProtectedRoute>
                <DashboardLayout><Classes /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/classes/new" element={
              <ProtectedRoute requiredRole="TEACHER">
                <DashboardLayout><ClassNew /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/classes/:classId" element={
              <ProtectedRoute>
                <DashboardLayout><ClassDetail /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/study/:deckId" element={
              <ProtectedRoute>
                <DashboardLayout><Study /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <DashboardLayout><Reports /></DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
