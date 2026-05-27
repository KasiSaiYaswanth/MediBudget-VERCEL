import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Responsive Switch Interceptor
import ResponsiveWrapper from "./responsive/ResponsiveWrapper";
import { AuthRedirectHandler } from "./components/auth/AuthRedirectHandler";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Core Layout Loader Fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#070e11] flex flex-col justify-center items-center">
    <div className="h-7 w-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
    <span className="text-[9px] text-teal-400/80 font-bold uppercase tracking-wider mt-3">Syncing interface...</span>
  </div>
);

// Lazily Loaded Desktop Pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MedicineScanner = lazy(() => import("./pages/MedicineScanner"));
const CostEstimation = lazy(() => import("./pages/CostEstimation"));
const SchemeChecker = lazy(() => import("./pages/SchemeChecker"));
const EstimationHistory = lazy(() => import("./pages/EstimationHistory"));
const SymptomAssistantUI = lazy(() => import("./pages/SymptomAssistantUI"));
const InsuranceCalculator = lazy(() => import("./pages/InsuranceCalculator"));
const Settings = lazy(() => import("./pages/Settings"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MFAVerify = lazy(() => import("./pages/MFAVerify"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const MedicalDisclaimer = lazy(() => import("./pages/MedicalDisclaimer"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazily Loaded Mobile Optimized Pages
const MobileLogin = lazy(() => import("./mobile/MobileLogin"));
const MobileSignup = lazy(() => import("./mobile/MobileSignup"));
const MobileForgotPassword = lazy(() => import("./mobile/MobileForgotPassword"));
const MobileDashboard = lazy(() => import("./mobile/MobileDashboard"));
const MobileMedicineScanner = lazy(() => import("./mobile/MobileMedicineScanner"));
const MobileSymptomChat = lazy(() => import("./mobile/MobileSymptomChat"));
const MobileCostEstimation = lazy(() => import("./mobile/MobileCostEstimation"));
const MobileInsuranceCalculator = lazy(() => import("./mobile/MobileInsuranceCalculator"));
const MobileSchemeChecker = lazy(() => import("./mobile/MobileSchemeChecker"));
const MobileEstimationHistory = lazy(() => import("./mobile/MobileEstimationHistory"));
const MobileSettings = lazy(() => import("./mobile/MobileSettings"));

// Lazily Loaded Protected Admin Pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const HealthDashboard = lazy(() => import("./pages/HealthDashboard"));
const AdminSymptoms = lazy(() => import("./pages/admin/AdminSymptoms"));
const AdminCosts = lazy(() => import("./pages/admin/AdminCosts"));
const AdminHospitals = lazy(() => import("./pages/admin/AdminHospitals"));
const AdminMedicines = lazy(() => import("./pages/admin/AdminMedicines"));
const AdminSchemes = lazy(() => import("./pages/admin/AdminSchemes"));
const AdminInsurance = lazy(() => import("./pages/admin/AdminInsurance"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthRedirectHandler />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<ResponsiveWrapper desktop={Login} mobile={MobileLogin} />} />
            <Route path="/signup" element={<ResponsiveWrapper desktop={Signup} mobile={MobileSignup} />} />
            <Route path="/forgot-password" element={<ResponsiveWrapper desktop={ForgotPassword} mobile={MobileForgotPassword} />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/mfa-verify" element={<MFAVerify />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/disclaimer" element={<MedicalDisclaimer />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/install" element={<Install />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><ResponsiveWrapper desktop={Dashboard} mobile={MobileDashboard} /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><ResponsiveWrapper desktop={MedicineScanner} mobile={MobileMedicineScanner} /></ProtectedRoute>} />
            <Route path="/estimate" element={<ProtectedRoute><ResponsiveWrapper desktop={CostEstimation} mobile={MobileCostEstimation} /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><ResponsiveWrapper desktop={SchemeChecker} mobile={MobileSchemeChecker} /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ResponsiveWrapper desktop={EstimationHistory} mobile={MobileEstimationHistory} /></ProtectedRoute>} />
            <Route path="/symptoms" element={<ProtectedRoute><ResponsiveWrapper desktop={SymptomAssistantUI} mobile={MobileSymptomChat} /></ProtectedRoute>} />
            <Route path="/insurance" element={<ProtectedRoute><ResponsiveWrapper desktop={InsuranceCalculator} mobile={MobileInsuranceCalculator} /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ResponsiveWrapper desktop={Settings} mobile={MobileSettings} /></ProtectedRoute>} />

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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
