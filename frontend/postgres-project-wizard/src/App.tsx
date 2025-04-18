import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotFound from "./pages/NotFound";
import NewShipment from "./pages/NewShipment";
import AddProduct from "./pages/AddProduct"; // ✅ Added import
import TrackShipment from "./pages/TrackShipment";

// Configure query client with retries disabled for development
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries to prevent repeated failed API calls
      refetchOnWindowFocus: false, // Optional: Disable refetching when window gets focus
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/new-shipment" element={<NewShipment />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/track-shipments" element={<TrackShipment />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
