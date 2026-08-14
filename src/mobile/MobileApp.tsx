import React, { Suspense, lazy, useEffect, useRef } from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Network } from "@capacitor/network";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkIsAdmin } from "@/lib/adminService";

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

// ─────────────────────────────────────────────────────────────────────────────
// Shared spinner for all Suspense fallbacks
// ─────────────────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen bg-[#070e11] flex flex-col justify-center items-center gap-3">
    <div className="h-7 w-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
    <span className="text-[9px] text-teal-400/80 font-bold uppercase tracking-wider">Loading...</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MobileProtectedRoute — guards routes; redirects to /login if no session.
// Also handles offline gracefully: if we have a cached session, let them in.
// ─────────────────────────────────────────────────────────────────────────────
const MobileProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<any>(undefined); // undefined = checking
  const [networkAvailable, setNetworkAvailable] = React.useState<boolean>(true);

  React.useEffect(() => {
    let active = true;

    // Check network status first
    Network.getStatus().then(({ connected }) => {
      if (active) setNetworkAvailable(connected);
    }).catch(() => {
      if (active) setNetworkAvailable(navigator.onLine);
    });

    // Get session from local storage (works offline)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (active) setSession(s);
    }).catch(() => {
      // On network error, still check if there's a persisted session
      if (active) setSession(null);
    });

    // Keep session in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (active) setSession(s);
    });

    // Network listeners
    let networkListener: any = null;
    Network.addListener("networkStatusChange", ({ connected }) => {
      if (active) setNetworkAvailable(connected);
    }).then(l => { networkListener = l; });

    return () => {
      active = false;
      subscription.unsubscribe();
      if (networkListener) networkListener.remove();
    };
  }, []);

  // While we're checking for a session, show the spinner
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#070e11] flex flex-col justify-center items-center gap-3">
        <div className="h-7 w-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[9px] text-teal-400/80 font-bold uppercase tracking-wider">
          {networkAvailable ? "Verifying session..." : "Offline — Checking cache..."}
        </span>
      </div>
    );
  }

  if (!session) {
    toast.error("Please log in to continue.");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
// MobileAppRoutes — handles deep links (Google OAuth callback) and renders routes
// ─────────────────────────────────────────────────────────────────────────────
const MobileAppRoutes = () => {
  const navigate = useNavigate();
  const processingRef = useRef(false); // prevent double-processing

  useEffect(() => {
    // Hide native splash immediately so the app feels fast
    import("@capacitor/splash-screen").then(({ SplashScreen }) => {
      SplashScreen.hide().catch(() => {});
    });

    // ── Handle Google OAuth deep-link callbacks (com.medibudget.app://login?...) ──
    const handleAppUrl = async (event: any) => {
      const url: string = event.url || "";
      if (!url) return;

      const isAuthCallback =
        url.includes("com.medibudget.app://") ||
        url.includes("medibudget://");

      if (!isAuthCallback || processingRef.current) return;
      processingRef.current = true;

      console.log("[DeepLink] Received:", url);

      try {
        let accessToken = "";
        let refreshToken = "";

        // Try hash fragment: com.medibudget.app://login#access_token=...
        const hashParts = url.split("#");
        if (hashParts.length > 1) {
          const params = new URLSearchParams(hashParts[1]);
          accessToken = params.get("access_token") || "";
          refreshToken = params.get("refresh_token") || "";
        }

        // Try query string: com.medibudget.app://login?access_token=...
        if (!accessToken || !refreshToken) {
          const queryParts = url.split("?");
          if (queryParts.length > 1) {
            const cleanQuery = queryParts[1].split("#")[0];
            const params = new URLSearchParams(cleanQuery);
            accessToken = params.get("access_token") || "";
            refreshToken = params.get("refresh_token") || "";
          }
        }

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          if (data.session) {
            toast.success("Signed in successfully!");

            let isAdmin = false;
            try { isAdmin = await checkIsAdmin(); } catch {}

            navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
          }
        } else if (url.includes("reset-password") || url.includes("type=recovery")) {
          navigate("/forgot-password", { replace: true });
        }
      } catch (e: any) {
        console.error("[DeepLink] Session restoration failed:", e.message);
        toast.error("Sign-in failed. Please try again.");
        navigate("/login", { replace: true });
      } finally {
        processingRef.current = false;
        try { await Browser.close(); } catch {}
      }
    };

    CapApp.addListener("appUrlOpen", handleAppUrl);

    return () => {
      CapApp.removeAllListeners();
    };
  }, [navigate]);

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* ── Startup ─────────────────────────────────────────────────── */}
        <Route path="/" element={<MobileSplash />} />
        <Route path="/login" element={<MobileLogin />} />
        <Route path="/signup" element={<MobileSignup />} />
        <Route path="/forgot-password" element={<MobileForgotPassword />} />

        {/* ── Protected Dashboard Routes ───────────────────────────────── */}
        <Route path="/dashboard" element={<MobileProtectedRoute><MobileDashboard /></MobileProtectedRoute>} />
        <Route path="/scanner" element={<MobileProtectedRoute><MobileMedicineScanner /></MobileProtectedRoute>} />
        <Route path="/symptoms" element={<MobileProtectedRoute><MobileSymptomChat /></MobileProtectedRoute>} />
        <Route path="/estimate" element={<MobileProtectedRoute><MobileCostEstimation /></MobileProtectedRoute>} />
        <Route path="/insurance" element={<MobileProtectedRoute><MobileInsuranceCalculator /></MobileProtectedRoute>} />
        <Route path="/schemes" element={<MobileProtectedRoute><MobileSchemeChecker /></MobileProtectedRoute>} />
        <Route path="/history" element={<MobileProtectedRoute><MobileEstimationHistory /></MobileProtectedRoute>} />
        <Route path="/settings" element={<MobileProtectedRoute><MobileSettings /></MobileProtectedRoute>} />

        {/* ── Settings Drill-Down Sub-pages ───────────────────────────── */}
        <Route path="/settings/about" element={<MobileProtectedRoute><MobileAboutSettings /></MobileProtectedRoute>} />
        <Route path="/settings/privacy" element={<MobileProtectedRoute><MobilePrivacySettings /></MobileProtectedRoute>} />
        <Route path="/settings/terms" element={<MobileProtectedRoute><MobileTermsSettings /></MobileProtectedRoute>} />
        <Route path="/settings/disclaimer" element={<MobileProtectedRoute><MobileDisclaimerSettings /></MobileProtectedRoute>} />
        <Route path="/settings/faq" element={<MobileProtectedRoute><MobileFAQSettings /></MobileProtectedRoute>} />
        <Route path="/settings/support" element={<MobileProtectedRoute><MobileSupportSettings /></MobileProtectedRoute>} />

        {/* ── Catch-all ───────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export const MobileApp = () => (
  <HashRouter>
    <MobileAppRoutes />
  </HashRouter>
);

export default MobileApp;
