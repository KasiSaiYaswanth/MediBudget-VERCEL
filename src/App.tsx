import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MedicineScanner from "./pages/MedicineScanner";
import CostEstimation from "./pages/CostEstimation";
import SchemeChecker from "./pages/SchemeChecker";
import EstimationHistory from "./pages/EstimationHistory";
import SymptomAssistantUI from "./pages/SymptomAssistantUI";
import InsuranceCalculator from "./pages/InsuranceCalculator";
import HealthDashboard from "./pages/HealthDashboard";
import NotFound from "./pages/NotFound";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSymptoms from "./pages/admin/AdminSymptoms";
import AdminCosts from "./pages/admin/AdminCosts";
import AdminHospitals from "./pages/admin/AdminHospitals";
import AdminMedicines from "./pages/admin/AdminMedicines";
import AdminSchemes from "./pages/admin/AdminSchemes";
import AdminInsurance from "./pages/admin/AdminInsurance";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAudit from "./pages/admin/AdminAudit";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import MedicalDisclaimer from "./pages/MedicalDisclaimer";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import Settings from "./pages/Settings";
import Install from "./pages/Install";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MFAVerify from "./pages/MFAVerify";
import { AuthRedirectHandler } from "./components/auth/AuthRedirectHandler";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthRedirectHandler />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/mfa-verify" element={<MFAVerify />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/disclaimer" element={<MedicalDisclaimer />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/install" element={<Install />} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><MedicineScanner /></ProtectedRoute>} />
          <Route path="/estimate" element={<ProtectedRoute><CostEstimation /></ProtectedRoute>} />
          <Route path="/schemes" element={<ProtectedRoute><SchemeChecker /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><EstimationHistory /></ProtectedRoute>} />
          <Route path="/symptoms" element={<ProtectedRoute><SymptomAssistantUI /></ProtectedRoute>} />
          <Route path="/insurance" element={<ProtectedRoute><InsuranceCalculator /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin-login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/health" element={<ProtectedRoute requireAdmin><AdminLayout><HealthDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/symptoms" element={<ProtectedRoute requireAdmin><AdminLayout><AdminSymptoms /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/costs" element={<ProtectedRoute requireAdmin><AdminLayout><AdminCosts /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/hospitals" element={<ProtectedRoute requireAdmin><AdminLayout><AdminHospitals /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/medicines" element={<ProtectedRoute requireAdmin><AdminLayout><AdminMedicines /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/schemes" element={<ProtectedRoute requireAdmin><AdminLayout><AdminSchemes /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/insurance" element={<ProtectedRoute requireAdmin><AdminLayout><AdminInsurance /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute requireAdmin><AdminLayout><AdminAudit /></AdminLayout></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
