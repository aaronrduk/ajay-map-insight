import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CitizenDashboard from "./pages/CitizenDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Mapping from "./pages/Mapping";
import MapView from "./pages/MapView";
import Proposal from "./pages/Proposal";
import Dashboard from "./pages/Dashboard";
import Transparency from "./pages/Transparency";
import Comparison from "./pages/Comparison";
import ImpactMetrics from "./pages/ImpactMetrics";
import About from "./pages/About";
import FileComplaint from "./pages/FileComplaint";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
            <Route path="/agency-dashboard" element={<AgencyDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/mapping" element={<Mapping />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/proposal" element={<Proposal />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/impact" element={<ImpactMetrics />} />
            <Route path="/file-complaint" element={<FileComplaint />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
