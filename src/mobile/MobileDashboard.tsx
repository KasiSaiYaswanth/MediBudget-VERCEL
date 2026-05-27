import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scan, Calculator, ShieldCheck, History, ArrowRight, TrendingDown,
  Users, Sparkles, Shield, IndianRupee, Building2, MapPin, Clock, HeartHandshake
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";

interface SavedEstimation {
  id: string;
  date: string;
  condition: string;
  city: string;
  hospitalType: string;
  total: number;
}

export const MobileDashboard = () => {
  const [userName, setUserName] = useState("there");
  const [recentEstimations, setRecentEstimations] = useState<SavedEstimation[]>([]);
  const [activeTip, setActiveTip] = useState(0);

  const healthTips = [
    "⚕️ Did you know generic drugs can cost up to 80% less than branded medicines?",
    "🏥 Always compare pricing tiers across Private, Charity, and Public hospitals.",
    "🛡️ Check scheme eligibility early to save significantly on medical bills.",
    "🍎 Drinking enough water daily boosts overall immune defense & cell regeneration."
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name;
      if (name) setUserName(name.split(" ")[0]);
    });

    try {
      const history = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
      setRecentEstimations(history.slice(0, 3));
    } catch {
      setRecentEstimations([]);
    }

    const interval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % healthTips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const totalEstimations = recentEstimations.length > 0
    ? JSON.parse(localStorage.getItem("estimationHistory") || "[]").length
    : 0;

  const totalSpent = recentEstimations.reduce((sum, e) => sum + (e.total || 0), 0);

  const quickActions = [
    {
      icon: Sparkles,
      title: "Symptom AI",
      path: "/symptoms",
      color: "gradient-hero",
    },
    {
      icon: Scan,
      title: "Scanner",
      path: "/scanner",
      color: "gradient-primary",
    },
    {
      icon: Calculator,
      title: "Estimator",
      path: "/estimate",
      color: "gradient-accent",
    },
    {
      icon: ShieldCheck,
      title: "Schemes",
      path: "/schemes",
      color: "gradient-warm",
    },
  ];

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN")}`;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <MobileDashboardLayout>
      <div className="space-y-6">
        
        {/* Profile Card & Welcoming */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
              Hello, {userName} <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your personal healthcare companion</p>
          </div>
          <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center font-bold text-white shadow-sm border border-background">
            {userName[0].toUpperCase()}
          </div>
        </motion.div>

        {/* Dynamic Micro-Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-sm border border-border/40">
            <CardContent className="p-3 text-center flex flex-col items-center">
              <Calculator className="h-4.5 w-4.5 text-primary mb-1" />
              <span className="text-base font-extrabold text-foreground">{totalEstimations}</span>
              <span className="text-[9px] text-muted-foreground mt-0.5 truncate w-full">Estimations</span>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border border-border/40">
            <CardContent className="p-3 text-center flex flex-col items-center">
              <TrendingDown className="h-4.5 w-4.5 text-emerald-500 mb-1" />
              <span className="text-base font-extrabold text-foreground">
                {totalEstimations > 0 ? formatCurrency(Math.round(totalSpent / totalEstimations)) : "₹0"}
              </span>
              <span className="text-[9px] text-muted-foreground mt-0.5 truncate w-full">Avg Estimate</span>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-border/40">
            <CardContent className="p-3 text-center flex flex-col items-center">
              <Shield className="h-4.5 w-4.5 text-accent mb-1" />
              <span className="text-base font-extrabold text-foreground">Active</span>
              <span className="text-[9px] text-muted-foreground mt-0.5 truncate w-full">Insurance</span>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Banner Health Tip */}
        <motion.div 
          key={activeTip}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl p-4 gradient-hero text-primary-foreground shadow-sm flex items-start gap-3 relative overflow-hidden active-scale"
        >
          <HeartHandshake className="h-5 w-5 text-white shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/80">Daily Health Tip</h4>
            <p className="text-xs font-semibold leading-relaxed mt-1 text-white">
              {healthTips[activeTip]}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-3 translate-x-3">
            <Pill className="h-24 w-24" />
          </div>
        </motion.div>

        {/* Compact Quick Actions Panel */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.path} className="active-scale flex flex-col items-center">
                <div className={`h-12 w-12 rounded-2xl ${action.color} flex items-center justify-center shadow-md`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-foreground mt-2">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Compact Recent Estimations */}
        {recentEstimations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Recent Estimations</h2>
              <Link to="/history" className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="space-y-2">
              {recentEstimations.map((est, i) => (
                <motion.div
                  key={est.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="shadow-sm border border-border/40 hover:border-primary/20 transition-all active-scale">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <IndianRupee className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{est.condition}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted-foreground">
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="h-2.5 w-2.5" /> {est.city}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 truncate">
                            <Building2 className="h-2.5 w-2.5" /> {est.hospitalType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-primary">{formatCurrency(est.total)}</p>
                        <p className="text-[8px] text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                          <Clock className="h-2 w-2" /> {formatDate(est.date)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Medical disclaimer compact */}
        <div className="p-3 rounded-2xl bg-secondary/30 border border-primary/10 text-center">
          <p className="text-[9px] leading-relaxed text-muted-foreground font-medium">
            ⚕️ estimates only. Does not constitute medical advice. Consult medical professionals before making health decisions.
          </p>
        </div>

      </div>
    </MobileDashboardLayout>
  );
};

export default MobileDashboard;
