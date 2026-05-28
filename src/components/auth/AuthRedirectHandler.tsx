import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/adminService";
import { toast } from "sonner";
import { Pill, Sparkles, ArrowRight } from "lucide-react";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/privacy", "/terms", "/disclaimer", "/contact", "/faq", "/install"];

export const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showMobileBridge, setShowMobileBridge] = useState(false);
  const [hashFragment, setHashFragment] = useState("");

  const triggerDeepLink = (hash: string) => {
    if (!hash) return;
    console.log("Triggering deep link via user gesture:", hash);
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      const queryParams = hash.replace(/^#/, "?");
      const fallbackUrl = encodeURIComponent(`${window.location.origin}/medibudget.apk`);
      window.location.href = `intent://login${queryParams}#Intent;scheme=com.medibudget.app;package=com.medibudget.app;S.browser_fallback_url=${fallbackUrl};end`;
    } else {
      window.location.href = `com.medibudget.app://login${hash}`;
      
      setTimeout(() => {
        window.location.href = `medibudget://auth/callback${hash}`;
      }, 150);
    }
  };

  // 1. Intercept URL hash callback parameters directly upon mount or route changes
  useEffect(() => {
    const hash = window.location.hash;
    const isMobileUserAgent = /Android|iPhone|iPad|iPod|Capacitor/i.test(navigator.userAgent);

    if (hash && (hash.includes("access_token=") || hash.includes("refresh_token="))) {
      if (isMobileUserAgent) {
        console.log("Mobile auth callback hash detected on Vercel. Mounting Redirect Bridge...");
        setHashFragment(hash);
        setShowMobileBridge(true);
        
        // Attempt immediate silent redirection using best platform strategy
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid) {
          const queryParams = hash.replace(/^#/, "?");
          const fallbackUrl = encodeURIComponent(`${window.location.origin}/medibudget.apk`);
          window.location.href = `intent://login${queryParams}#Intent;scheme=com.medibudget.app;package=com.medibudget.app;S.browser_fallback_url=${fallbackUrl};end`;
        } else {
          window.location.href = `com.medibudget.app://login${hash}`;
          setTimeout(() => {
            window.location.href = `medibudget://auth/callback${hash}`;
          }, 100);
        }
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
              const hashFragmentStr = `#access_token=${accessToken}&refresh_token=${refreshToken}`;
              console.log("Mobile session established on Vercel. Deep linking to native app...");
              setHashFragment(hashFragmentStr);
              setShowMobileBridge(true);
              
              // Attempt immediate silent redirection
              const isAndroid = /Android/i.test(navigator.userAgent);
              if (isAndroid) {
                const queryParams = hashFragmentStr.replace(/^#/, "?");
                const fallbackUrl = encodeURIComponent(`${window.location.origin}/medibudget.apk`);
                window.location.href = `intent://login${queryParams}#Intent;scheme=com.medibudget.app;package=com.medibudget.app;S.browser_fallback_url=${fallbackUrl};end`;
              } else {
                window.location.href = `com.medibudget.app://login${hashFragmentStr}`;
                setTimeout(() => {
                  window.location.href = `medibudget://auth/callback${hashFragmentStr}`;
                }, 100);
              }
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

  const getDeepLinkUrl = () => {
    if (!hashFragment) return "#";
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      const queryParams = hashFragment.replace(/^#/, "?");
      const fallbackUrl = encodeURIComponent(`${window.location.origin}/medibudget.apk`);
      return `intent://login${queryParams}#Intent;scheme=com.medibudget.app;package=com.medibudget.app;S.browser_fallback_url=${fallbackUrl};end`;
    }
    return `com.medibudget.app://login${hashFragment}`;
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) {
      e.preventDefault();
      const hash = hashFragment;
      window.location.href = `com.medibudget.app://login${hash}`;
      setTimeout(() => {
        window.location.href = `medibudget://auth/callback${hash}`;
      }, 150);
    }
  };

  // Render high-fidelity OAuth bridge overlay for mobile clients
  if (showMobileBridge) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#070e11] flex flex-col justify-between items-center p-6 text-white select-none">
        <div />

        {/* Pulsing branding logo */}
        <div className="flex flex-col items-center space-y-5 text-center">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative animate-pulse">
            <Pill className="h-8 w-8 text-white rotate-45" />
          </div>
          
          <div className="space-y-2.5">
            <h1 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
              <Sparkles className="h-5 w-5 text-teal-400" />
              Secure Auth Link
            </h1>
            <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed font-semibold">
              Your credentials have been securely verified. Tap below to navigate back into the native app.
            </p>
          </div>
        </div>

        {/* Pulse action button */}
        <div className="w-full max-w-[280px] flex flex-col items-center space-y-4 mb-10">
          <a
            href={getDeepLinkUrl()}
            onClick={handleLinkClick}
            className="w-full h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-[#070e11] font-black text-xs shadow-lg shadow-teal-400/25 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5"
          >
            Open MediBudget App
            <ArrowRight className="h-4 w-4" />
          </a>
          <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">
            Resolves Google Chrome Security Guards
          </span>
        </div>
      </div>
    );
  }

  return null;
};
