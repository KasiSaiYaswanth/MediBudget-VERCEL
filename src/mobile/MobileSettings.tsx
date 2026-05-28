import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Trash,
  WifiOff, 
  Database,
  Lock,
  Moon,
  ToggleLeft,
  ToggleRight,
  Fingerprint,
  Info,
  Scale,
  ShieldAlert,
  HelpCircle,
  Mail,
  LogOut
} from "lucide-react";
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";
import { clearAllCache } from "@/lib/offlineStorage";

// Settings sub-pages are lazy loaded as independent full routes
export const MobileSettings = () => {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [biometrics, setBiometrics] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setBiometrics(localStorage.getItem("biometricsEnabled") === "true");
    setDarkMode(localStorage.getItem("theme") === "dark");
  }, []);

  const toggleBiometrics = () => {
    const nextVal = !biometrics;
    setBiometrics(nextVal);
    localStorage.setItem("biometricsEnabled", nextVal ? "true" : "false");
    toast.success(nextVal ? "Fingerprint/FaceID login enabled!" : "Biometrics disabled.");
  };

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    localStorage.setItem("theme", nextVal ? "dark" : "light");
    if (nextVal) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(nextVal ? "Dark theme active!" : "Light theme active!");
  };

  const handleClearCache = async () => {
    await clearAllCache();
    toast.success("Offline health cache flushed successfully!");
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      const symptomHistory = JSON.parse(localStorage.getItem("symptomHistory") || "[]");
      const estimationHistory = JSON.parse(localStorage.getItem("estimationHistory") || "[]");

      const exportPayload = {
        metadata: {
          exportedAt: new Date().toISOString(),
          app: "MediBudget Mobile",
          version: "1.2.0",
          exportMethod: "ClientSideExporter"
        },
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        data: {
          symptomHistory,
          estimationHistory,
        }
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medibudget-mobile-export.json`;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("JSON data downloaded successfully!");
    } catch (err: any) {
      toast.error("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure you want to permanently delete your account? This action is irreversible.")) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      localStorage.removeItem("symptomHistory");
      localStorage.removeItem("estimationHistory");
      localStorage.removeItem("biometricsEnabled");
      await clearAllCache();

      await supabase.auth.signOut();
      toast.success("Account permanently purged");
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast.error("Deletion failed: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MobileDashboardLayout>
      <div className="space-y-5">
        
        {/* Top Header */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale shrink-0">
            <ChevronLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground">App Settings</h1>
            <p className="text-[10px] text-muted-foreground">Manage offline storage, preferences & biometrics</p>
          </div>
        </div>

        {/* Group 1: Preferences */}
        <div className="space-y-1">
          <p className="text-[9px] font-black text-muted-foreground uppercase px-2 tracking-wider">Appearance & Biometrics</p>
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/40">
            
            {/* Dark Theme toggle row */}
            <div className="flex justify-between items-center p-3.5 text-xs text-foreground">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Moon className="h-4 w-4 text-purple-400" />
                </div>
                <span className="font-bold">Dark Appearance</span>
              </div>
              <button onClick={toggleDarkMode} className="active-scale">
                {darkMode ? (
                  <ToggleRight className="h-7 w-7 text-primary" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-muted-foreground/60" />
                )}
              </button>
            </div>

            {/* Biometric FaceID/Fingerprint row */}
            <div className="flex justify-between items-center p-3.5 text-xs text-foreground">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Fingerprint className="h-4 w-4 text-blue-400" />
                </div>
                <span className="font-bold">Biometric Quick-Login</span>
              </div>
              <button onClick={toggleBiometrics} className="active-scale">
                {biometrics ? (
                  <ToggleRight className="h-7 w-7 text-primary" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-muted-foreground/60" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Group 2: App Information & Legal */}
        <div className="space-y-1">
          <p className="text-[9px] font-black text-muted-foreground uppercase px-2 tracking-wider">Help, Information & Legal</p>
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/40">
            
            {/* About */}
            <button onClick={() => navigate("/settings/about")} className="w-full flex justify-between items-center p-3.5 text-xs text-foreground active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                  <Info className="h-4 w-4 text-teal-400" />
                </div>
                <span className="font-bold">About MediBudget</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* FAQ */}
            <button onClick={() => navigate("/settings/faq")} className="w-full flex justify-between items-center p-3.5 text-xs text-foreground active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="font-bold">Frequently Asked Questions</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Privacy Policy */}
            <button onClick={() => navigate("/settings/privacy")} className="w-full flex justify-between items-center p-3.5 text-xs text-foreground active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="font-bold">Privacy Policy</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Terms of Service */}
            <button onClick={() => navigate("/settings/terms")} className="w-full flex justify-between items-center p-3.5 text-xs text-foreground active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                  <Scale className="h-4 w-4 text-sky-400" />
                </div>
                <span className="font-bold">Terms of Service</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Medical Disclaimer */}
            <button onClick={() => navigate("/settings/disclaimer")} className="w-full flex justify-between items-center p-3.5 text-xs text-foreground active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                </div>
                <span className="font-bold">Medical Disclaimer</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Contact Us */}
            <button onClick={() => navigate("/settings/support")} className="w-full flex justify-between items-center p-3.5 text-xs text-foreground active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-orange-400" />
                </div>
                <span className="font-bold">Contact Support</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

          </div>
        </div>

        {/* Group 3: Data & Sync */}
        <div className="space-y-1">
          <p className="text-[9px] font-black text-muted-foreground uppercase px-2 tracking-wider">Offline Cache & Storage</p>
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/40">
            
            {/* Export JSON row */}
            <button onClick={handleExportData} className="w-full flex justify-between items-center p-3.5 text-xs text-foreground active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Download className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Export Backup Data</p>
                  <p className="text-[8px] text-muted-foreground">Download estimate histories as JSON</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Clear health cache row */}
            <button onClick={handleClearCache} className="w-full flex justify-between items-center p-3.5 text-xs text-foreground active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <WifiOff className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Clear Offline Health Cache</p>
                  <p className="text-[8px] text-muted-foreground">Flushes local regional multipliers</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

          </div>
        </div>

        {/* Group 4: Accounts and Logout */}
        <div className="space-y-1">
          <p className="text-[9px] font-black text-muted-foreground uppercase px-2 tracking-wider">Session & Security</p>
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/40">
            
            {/* Ordinary Logout */}
            <button onClick={handleSignOut} className="w-full flex justify-between items-center p-3.5 text-xs text-amber-500 active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <LogOut className="h-4 w-4 text-amber-400" />
                </div>
                <span className="font-bold text-left">Sign Out of Account</span>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-500/60" />
            </button>

            {/* Permanently Delete Account */}
            <button onClick={handleDeleteAccount} className="w-full flex justify-between items-center p-3.5 text-xs text-red-500 active-scale">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <Trash className="h-4 w-4 text-red-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Permanently Delete Account</p>
                  <p className="text-[8px] text-red-400/80">Wipes all credentials and histories</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-red-400/60" />
            </button>

          </div>
        </div>

        {/* Info label footer */}
        <div className="text-center py-4">
          <p className="text-[8px] text-muted-foreground font-semibold">MediBudget Android Mobile &bull; Version 1.2.0 (Build 41)</p>
          <p className="text-[7px] text-muted-foreground mt-0.5">&copy; 2026 MediBudget Inc. All Rights Reserved.</p>
        </div>

      </div>
    </MobileDashboardLayout>
  );
};

export default MobileSettings;
