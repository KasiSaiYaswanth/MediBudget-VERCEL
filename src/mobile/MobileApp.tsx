import React, { Suspense, lazy, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mobile pages (Lazy Loaded for absolute minimum startup bundle sizes)
const MobileSplash = lazy(() => import("./MobileSplash"));
const MobileLogin = lazy(() => import("./MobileLogin"));
const MobileSignup = lazy(() => import("./MobileSignup"));
const MobileForgotPassword = lazy(() => import("./MobileForgotPassword"));
const MobileDashboard = lazy(() => import("./MobileDashboard"));
const MobileMedicineScanner = lazy(() => import("./MobileMedicineScanner"));
const MobileSymptomChat = lazy(() => import("./MobileSymptomChat"));
const MobileCostEstimation = lazy(() => import("./MobileCostEstimation"));
const MobileInsuranceCalculator = lazy(() => import("./MobileInsuranceCalculator"));
const MobileSchemeChecker = lazy(() => import("./MobileSchemeChecker"));
const MobileEstimationHistory = lazy(() => import("./MobileEstimationHistory"));
const MobileSettings = lazy(() => import("./MobileSettings"));

// Settings Full-Screen Detail Pages
const MobileAboutSettings = lazy(() => import("./legal/MobileLegalPages").then(module => ({ default: module.MobileAboutPage })));
const MobilePrivacySettings = lazy(() => import("./legal/MobileLegalPages").then(module => ({ default: module.MobilePrivacyPage })));
const MobileTermsSettings = lazy(() => import("./legal/MobileLegalPages").then(module => ({ default: module.MobileTermsPage })));
const MobileDisclaimerSettings = lazy(() => import("./legal/MobileLegalPages").then(module => ({ default: module.MobileDisclaimerPage })));
const MobileFAQSettings = lazy(() => import("./legal/MobileLegalPages").then(module => ({ default: module.MobileFAQPage })));
const MobileSupportSettings = lazy(() => import("./legal/MobileLegalPages").then(module => ({ default: module.MobileSupportPage })));

// Lightweight Mobile-specific Protected Route to isolate session verification from desktop wrappers
const MobileProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        setSession(session);
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setSession(session);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e11] flex flex-col justify-center items-center">
        <div className="h-7 w-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[9px] text-teal-400/80 font-bold uppercase tracking-wider mt-3">Verifying session...</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Global App Link / Deep Link Handler
const MobileAppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAppUrl = async (event: any) => {
      const url = event.url;
      
      // Check if it is a deep link callback from Supabase OAuth or confirmation
      if (url && (url.startsWith("com.medibudget.app://") || url.startsWith("medibudget://"))) {
        try {
          let accessToken = "";
          let refreshToken = "";

          // Parse hash fragment params: access_token and refresh_token
          const hashParts = url.split("#");
          if (hashParts.length > 1) {
            const params = new URLSearchParams(hashParts[1]);
            accessToken = params.get("access_token") || "";
            refreshToken = params.get("refresh_token") || "";
          }

          // If not found in hash, parse from query search parameters
          if (!accessToken || !refreshToken) {
            const queryParts = url.split("?");
            if (queryParts.length > 1) {
              // Strip trailing hash if any exists
              const cleanedQuery = queryParts[1].split("#")[0];
              const params = new URLSearchParams(cleanedQuery);
              accessToken = params.get("access_token") || "";
              refreshToken = params.get("refresh_token") || "";
            }
          }

          if (accessToken && refreshToken) {
            // Set Supabase session programmatically
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;

            if (data.session) {
              toast.success("Welcome back! Google Sign-in successful.");
              navigate("/dashboard", { replace: true });
            }
          } else if (url.includes("reset-password")) {
            // Handle reset password route
            navigate("/login", { replace: true });
            toast.info("Password reset request received. Accessing profile.");
          }
        } catch (e: any) {
          console.error("Deep link restoration failed", e);
          toast.error("Authentication callback failed: " + e.message);
        } finally {
          try {
            // Guarantee in-app browser overlay is closed cleanly
            await Browser.close();
          } catch (err) {
            // Browser wasn't open, safe to ignore
          }
        }
      }
    };

    // Add deep link listener
    CapApp.addListener("appUrlOpen", handleAppUrl);

    return () => {
      CapApp.removeAllListeners();
    };
  }, [navigate]);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070e11] flex flex-col justify-center items-center">
        <div className="h-7 w-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Routes>
        {/* Startup transitions */}
        <Route path="/" element={<MobileSplash />} />
        <Route path="/login" element={<MobileLogin />} />
        <Route path="/signup" element={<MobileSignup />} />
        <Route path="/forgot-password" element={<MobileForgotPassword />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<MobileProtectedRoute><MobileDashboard /></MobileProtectedRoute>} />
        <Route path="/scanner" element={<MobileProtectedRoute><MobileMedicineScanner /></MobileProtectedRoute>} />
        <Route path="/symptoms" element={<MobileProtectedRoute><MobileSymptomChat /></MobileProtectedRoute>} />
        <Route path="/estimate" element={<MobileProtectedRoute><MobileCostEstimation /></MobileProtectedRoute>} />
        <Route path="/insurance" element={<MobileProtectedRoute><MobileInsuranceCalculator /></MobileProtectedRoute>} />
        <Route path="/schemes" element={<MobileProtectedRoute><MobileSchemeChecker /></MobileProtectedRoute>} />
        <Route path="/history" element={<MobileProtectedRoute><MobileEstimationHistory /></MobileProtectedRoute>} />
        <Route path="/settings" element={<MobileProtectedRoute><MobileSettings /></MobileProtectedRoute>} />
        
        {/* Settings Drill-Down Sub-pages */}
        <Route path="/settings/about" element={<MobileProtectedRoute><MobileAboutSettings /></MobileProtectedRoute>} />
        <Route path="/settings/privacy" element={<MobileProtectedRoute><MobilePrivacySettings /></MobileProtectedRoute>} />
        <Route path="/settings/terms" element={<MobileProtectedRoute><MobileTermsSettings /></MobileProtectedRoute>} />
        <Route path="/settings/disclaimer" element={<MobileProtectedRoute><MobileDisclaimerSettings /></MobileProtectedRoute>} />
        <Route path="/settings/faq" element={<MobileProtectedRoute><MobileFAQSettings /></MobileProtectedRoute>} />
        <Route path="/settings/support" element={<MobileProtectedRoute><MobileSupportSettings /></MobileProtectedRoute>} />

        {/* Catch-all redirect to splash check */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export const MobileApp = () => (
  <HashRouter>
    <MobileAppRoutes />
  </HashRouter>
);

export default MobileApp;
