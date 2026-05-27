import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/responsive/ResponsiveWrapper";
import { Pill } from "lucide-react";
import { motion } from "framer-motion";

// Desktop Only Landing Page Elements
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhyMediBudgetSection from "@/components/landing/WhyMediBudgetSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isMobile) {
      setCheckingAuth(false);
      return;
    }

    const checkMobileAuth = async () => {
      // Simulate slightly longer loading for splash screen elegance
      const start = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 1500 - elapsed); // Keep splash visible for at least 1.5s for brand impact

      setTimeout(() => {
        if (session) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      }, delay);
    };

    checkMobileAuth();
  }, [isMobile, navigate]);

  // Mobile Native Splash Screen
  if (isMobile && checkingAuth) {
    return (
      <div className="min-h-screen bg-[#070e11] flex flex-col justify-between items-center p-6 text-white safe-top safe-bottom select-none">
        
        {/* Top spacer */}
        <div />

        {/* Center Pulsing Logo & Branding */}
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
            transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/20 pulse-ring relative"
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
          <span className="text-[9px] text-muted-foreground font-semibold">Initializing secure tunnel...</span>
        </div>

      </div>
    );
  }

  // Desktop Standard Landing Page
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhyMediBudgetSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
