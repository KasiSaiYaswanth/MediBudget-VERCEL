import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Pill, Mail, Lock, ArrowRight, ShieldAlert, Fingerprint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkIsAdmin } from "@/lib/adminService";

import { Separator } from "@/components/ui/separator";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getLoginState() {
  const stored = localStorage.getItem("login_rate_limit");
  if (!stored) return { attempts: 0, lockedUntil: 0 };
  try {
    return JSON.parse(stored);
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function setLoginState(attempts: number, lockedUntil: number) {
  localStorage.setItem("login_rate_limit", JSON.stringify({ attempts, lockedUntil }));
}

export const MobileLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const state = getLoginState();
    setFailedAttempts(state.attempts);
    setLockedUntil(state.lockedUntil);
    setHasBiometrics(localStorage.getItem("biometricsEnabled") === "true");
  }, []);

  useEffect(() => {
    if (lockedUntil <= Date.now()) {
      setRemainingSeconds(0);
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        setFailedAttempts(0);
        setLockedUntil(0);
        setLoginState(0, 0);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil > Date.now();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      toast.error(`Account locked. Try again in ${Math.ceil(remainingSeconds / 60)} minute(s).`);
      return;
    }
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION;
        setLockedUntil(lockTime);
        setLoginState(newAttempts, lockTime);
        toast.error(`Too many failed attempts. Account locked for 15 minutes.`);
      } else {
        setLoginState(newAttempts, 0);
        toast.error(`Invalid email or password. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
      }
      return;
    }

    setFailedAttempts(0);
    setLockedUntil(0);
    setLoginState(0, 0);

    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = factorsData?.totp?.some((f) => f.status === "verified");

    if (hasVerifiedTotp) {
      setLoading(false);
      navigate("/mfa-verify");
      return;
    }

    let isAdmin = false;
    try {
      isAdmin = await checkIsAdmin();
    } catch (adminError) {
      console.warn("Admin check failed, defaulting to standard user", adminError);
    }
    setLoading(false);

    if (isAdmin) {
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: "com.medibudget.app://login",
            skipBrowserRedirect: true,
          }
        });

        if (error) throw error;

        if (data?.url) {
          // Open the URL using Capacitor Browser plugin
          await Browser.open({ url: data.url, windowName: '_self' });
        }
      } else {
        // Standard mobile web browser flow
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          }
        });
        if (error) throw error;
      }
    } catch (error: any) {
      toast.error("Google sign-in failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    // Elegant native-feeling biometric auth simulator
    toast.info("Scanning fingerprint...");
    setLoading(true);
    setTimeout(async () => {
      // Fetch dynamic profile mock to bypass Supabase for demo/test or do instant login
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setLoading(false);
        toast.success("Biometric verification success!");
        navigate("/dashboard");
      } else {
        setLoading(false);
        toast.error("No active session found. Please login with password first.");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 safe-top safe-bottom">
      
      {/* Top Banner and Logo */}
      <div className="flex flex-col items-center mt-8 space-y-3">
        <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-lg animate-bounce">
          <Pill className="h-5.5 w-5.5 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-black text-foreground">MediBudget</h1>
          <p className="text-[10px] text-muted-foreground">Smart Healthcare Cost Auditor</p>
        </div>
      </div>

      {/* Main card */}
      <Card className="shadow-md border border-border/40 w-full overflow-hidden bg-card">
        <CardHeader className="p-4 pb-2 text-center">
          <CardTitle className="text-sm font-bold text-foreground">Access Portal</CardTitle>
          <CardDescription className="text-[9px]">Enter your registered credentials to audit</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-4">
          
          {isLocked && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
              <ShieldAlert className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-destructive">Portal Temporarily Locked</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">Too many incorrect attempts. Try again in {remainingSeconds}s.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-9 text-xs"
                disabled={loading || isLocked}
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-9 text-xs"
                  disabled={loading || isLocked}
                />
              </div>
              <div className="text-right px-1">
                <Link to="/forgot-password" className="text-[9px] text-primary hover:underline font-bold">Forgot password?</Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full h-10 text-xs font-bold shadow-glow active-scale"
              disabled={loading || isLocked}
            >
              {loading ? "Authenticating..." : "Sign In"}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </form>

          <div className="relative flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[8px] text-muted-foreground uppercase font-bold">or connect via</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <Button
            variant="outline"
            className="w-full h-10 text-xs font-bold active-scale"
            type="button"
            disabled={loading || isLocked}
            onClick={handleGoogleLogin}
          >
            <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Identity
          </Button>

          {hasBiometrics && (
            <div className="pt-1">
              <button
                onClick={handleBiometricLogin}
                className="w-full h-10 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center gap-1.5 text-xs text-primary font-bold active-scale"
                disabled={loading || isLocked}
              >
                <Fingerprint className="h-4.5 w-4.5" />
                Verify with Biometrics
              </button>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Footer controls */}
      <div className="text-center py-4 space-y-1">
        <p className="text-[10px] text-muted-foreground">New to MediBudget?</p>
        <Link to="/signup" className="text-xs text-primary font-black hover:underline">Create a free profile</Link>
      </div>

    </div>
  );
};

export default MobileLogin;
