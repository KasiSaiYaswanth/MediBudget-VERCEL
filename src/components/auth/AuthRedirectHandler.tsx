import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/adminService";
import { toast } from "sonner";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/privacy", "/terms", "/disclaimer", "/contact", "/faq", "/install"];

export const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Intercept URL hash callback parameters directly upon mount or route changes
  useEffect(() => {
    const hash = window.location.hash;
    const isMobileUserAgent = /Android|iPhone|iPad|iPod|Capacitor/i.test(navigator.userAgent);

    if (hash && (hash.includes("access_token=") || hash.includes("refresh_token="))) {
      if (isMobileUserAgent) {
        console.log("Mobile auth callback hash detected on Vercel. Redirecting to native app...");
        window.location.href = `com.medibudget.app://login${hash}`;
        
        // Secondary fallback deep link
        setTimeout(() => {
          window.location.href = `medibudget://auth/callback${hash}`;
        }, 150);
        return;
      }
    }
  }, [location]);

  // 2. Intercept SIGNED_IN auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const isMobileUserAgent = /Android|iPhone|iPad|iPod|Capacitor/i.test(navigator.userAgent);
          
          if (isMobileUserAgent) {
            const accessToken = session.access_token;
            const refreshToken = session.refresh_token;
            if (accessToken && refreshToken) {
              const hashFragment = `#access_token=${accessToken}&refresh_token=${refreshToken}`;
              console.log("Mobile session established on Vercel. Deep linking to native app...");
              window.location.href = `com.medibudget.app://login${hashFragment}`;
              
              // Secondary fallback deep link
              setTimeout(() => {
                window.location.href = `medibudget://auth/callback${hashFragment}`;
              }, 150);
              return;
            }
          }

          // Desktop normal route redirection
          if (PUBLIC_ROUTES.includes(location.pathname)) {
            try {
              const isAdmin = await checkIsAdmin();
              if (isAdmin) {
                toast.success("Welcome, Admin!");
                navigate("/admin", { replace: true });
              } else {
                toast.success("Welcome back!");
                navigate("/dashboard", { replace: true });
              }
            } catch {
              navigate("/dashboard", { replace: true });
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return null;
};
