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
import NotFound from "./pages/NotFound";
import CitizenCourseRegistration from "./pages/CitizenCourseRegistration";
import CitizenMyRegistrations from "./pages/CitizenMyRegistrations";
import AdminCourseRegistrationReview from "./pages/AdminCourseRegistrationReview";
import CitizenCertificates from "./pages/CitizenCertificates";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminPMAjaySync from "./pages/AdminPMAjaySync";
import AdminCoursesSync from "./pages/AdminCoursesSync";
import CitizenGrievance from "./pages/CitizenGrievance";
import CitizenGrievanceView from "./pages/CitizenGrievanceView";
import AdminGrievanceManagement from "./pages/AdminGrievanceManagement";
import AgencyProposalSubmit from "./pages/AgencyProposalSubmit";
import AgencyProposals from "./pages/AgencyProposals";
import AdminProposalReview from "./pages/AdminProposalReview";
import AdminGrantReports from "./pages/AdminGrantReports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  return (
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
              <Route path="/citizen/course-registration" element={<CitizenCourseRegistration />} />
              <Route path="/citizen/registrations" element={<CitizenMyRegistrations />} />
              <Route path="/admin/registrations" element={<AdminCourseRegistrationReview />} />
              <Route path="/citizen/certificates" element={<CitizenCertificates />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/pm-ajay-sync" element={<AdminPMAjaySync />} />
              <Route path="/admin/courses-sync" element={<AdminCoursesSync />} />
              <Route path="/citizen/grievance" element={<CitizenGrievance />} />
              <Route path="/citizen/grievance/view" element={<CitizenGrievanceView />} />
              <Route path="/admin/grievances" element={<AdminGrievanceManagement />} />
              <Route path="/agency/proposals/submit" element={<AgencyProposalSubmit />} />
              <Route path="/agency/proposals" element={<AgencyProposals />} />
              <Route path="/admin/proposals" element={<AdminProposalReview />} />
              <Route path="/admin/grant-reports" element={<AdminGrantReports />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
