import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@capacitor/splash-screen";
import { Pill } from "lucide-react";
import { motion } from "framer-motion";

export const MobileSplash = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Initializing secure tunnel...");

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Hide the native splash screen immediately to let the React splash take over.
        // Since launchAutoHide is false, the native splash stays up until this exact moment,
        // avoiding any blank screen completely.
        await SplashScreen.hide();
      } catch (e) {
        console.warn("SplashScreen.hide() failed", e);
      }

      try {
        // 2. Perform Session Check
        setStatus("Checking credentials...");
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error", error);
          setStatus("Authentication error. Redirecting...");
          setTimeout(() => navigate("/login", { replace: true }), 1000);
          return;
        }

        if (session) {
          setStatus("Access granted. Preparing dashboard...");
          setTimeout(() => navigate("/dashboard", { replace: true }), 800);
        } else {
          setStatus("No session found. Redirecting to login...");
          setTimeout(() => navigate("/login", { replace: true }), 800);
        }
      } catch (err) {
        console.error("Initialization error", err);
        setStatus("System error. Redirecting...");
        setTimeout(() => navigate("/login", { replace: true }), 1000);
      }
    };

    initApp();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#070e11] flex flex-col justify-between items-center p-6 text-white safe-top safe-bottom select-none">
      <div />

      {/* Center Pulsing Logo & Branding */}
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative"
        >
          <Pill className="h-8 w-8 text-white rotate-45" />
        </motion.div>
        
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center space-y-1.5"
        >
          <h1 className="text-2xl font-black tracking-tight text-white animate-pulse">MediBudget</h1>
          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Healthcare Cost Auditor</p>
        </motion.div>
      </div>

      {/* Bottom Progress Bar / Footnotes */}
      <div className="w-full max-w-[200px] flex flex-col items-center space-y-4 mb-6">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-1/2 bg-teal-400 rounded-full"
          />
        </div>
        <span className="text-[9px] text-muted-foreground font-semibold">{status}</span>
      </div>
    </div>
  );
};

export default MobileSplash;
