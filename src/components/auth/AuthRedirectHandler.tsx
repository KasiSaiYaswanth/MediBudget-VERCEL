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
    
    // If there's an access token in the URL and we are on a public route, wait for onAuthStateChange to fire
    // Supabase client automatically processes the hash and triggers SIGNED_IN
    if (hash && (hash.includes("access_token=") || hash.includes("refresh_token="))) {
       console.log("Auth callback hash detected. Awaiting session processing...");
    }
  }, [location]);

  // 2. Intercept SIGNED_IN auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Normal route redirection for all web users (desktop and mobile browsers)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location.pathname]);

  return null;
};

