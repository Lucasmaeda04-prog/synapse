import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/decks" element={<DashboardLayout><Decks /></DashboardLayout>} />
            <Route path="/decks/new" element={<DashboardLayout><DeckNew /></DashboardLayout>} />
            <Route path="/decks/:deckId" element={<DashboardLayout><DeckDetail /></DashboardLayout>} />
            <Route path="/classes" element={<DashboardLayout><Classes /></DashboardLayout>} />
            <Route path="/classes/new" element={<DashboardLayout><ClassNew /></DashboardLayout>} />
            <Route path="/classes/:classId" element={<DashboardLayout><ClassDetail /></DashboardLayout>} />
            <Route path="/study/:deckId" element={<DashboardLayout><Study /></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
