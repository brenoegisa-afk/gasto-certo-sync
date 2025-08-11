import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Contas from "./pages/Contas";
import Cartoes from "./pages/Cartoes";
import Transacoes from "./pages/Transacoes";
import Telegram from "./pages/Telegram";
import NotFound from "./pages/NotFound";

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      <Route path="/contas" element={user ? <Contas /> : <Navigate to="/auth" />} />
      <Route path="/cartoes" element={user ? <Cartoes /> : <Navigate to="/auth" />} />
      <Route path="/transacoes" element={user ? <Transacoes /> : <Navigate to="/auth" />} />
      <Route path="/telegram" element={user ? <Telegram /> : <Navigate to="/auth" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
