import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@capacitor/splash-screen";
import { Pill } from "lucide-react";
import { motion } from "framer-motion";

export const MobileSplash = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Loading...");
  const navigatedRef = useRef(false); // prevent double-navigation

  const goTo = (path: string) => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    navigate(path, { replace: true });
  };

  useEffect(() => {
    // 1. Hide native splash immediately
    SplashScreen.hide().catch(() => {});

    // 2. Hard safety timeout — if ANYTHING hangs (Supabase, Preferences, network),
    //    we bail out after 4 seconds and send the user to /login.
    //    This prevents the "stuck on splash" issue permanently.
    const hardTimeout = setTimeout(() => {
      console.warn("[Splash] Hard timeout reached — navigating to /login");
      setStatus("Taking too long... redirecting.");
      goTo("/login");
    }, 4000);

    const initApp = async () => {
      try {
        setStatus("Checking session...");

        // 3. FAST PATH: Check localStorage directly first (synchronous).
        //    Supabase stores the session under "sb-<project-ref>-auth-token".
        //    This resolves instantly without any async I/O.
        let hasLocalSession = false;
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i) || "";
            if (k.includes("auth-token") || k.includes("supabase.auth.token")) {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                // Check the token hasn't expired
                const expiresAt = parsed?.expires_at || parsed?.expiresAt || 0;
                if (expiresAt > Math.floor(Date.now() / 1000)) {
                  hasLocalSession = true;
                }
              }
              break;
            }
          }
        } catch {}

        if (hasLocalSession) {
          setStatus("Session found. Entering dashboard...");
          clearTimeout(hardTimeout);
          goTo("/dashboard");
          return;
        }

        // 4. SLOW PATH: Ask Supabase client (reads from Capacitor Preferences on native).
        //    This can take a second or two on cold boot — the timeout above protects us.
        const { data: { session }, error } = await supabase.auth.getSession();

        clearTimeout(hardTimeout);

        if (error) {
          console.error("[Splash] Session error:", error.message);
          goTo("/login");
          return;
        }

        if (session) {
          setStatus("Welcome back!");
          goTo("/dashboard");
        } else {
          setStatus("Please sign in.");
          goTo("/login");
        }
      } catch (err) {
        console.error("[Splash] Fatal init error:", err);
        clearTimeout(hardTimeout);
        goTo("/login");
      }
    };

    initApp();

    return () => clearTimeout(hardTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#070e11] flex flex-col justify-between items-center p-6 text-white safe-top safe-bottom select-none">
      <div />

      {/* Center Pulsing Logo & Branding */}
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/20"
        >
          <Pill className="h-8 w-8 text-white rotate-45" />
        </motion.div>

        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center space-y-1.5"
        >
          <h1 className="text-2xl font-black tracking-tight text-white">MediBudget</h1>
          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Healthcare Cost Auditor</p>
        </motion.div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full max-w-[200px] flex flex-col items-center space-y-4 mb-6">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-1/2 bg-teal-400 rounded-full"
          />
        </div>
        <span className="text-[9px] text-muted-foreground font-semibold">{status}</span>
      </div>
    </div>
  );
};

export default MobileSplash;
