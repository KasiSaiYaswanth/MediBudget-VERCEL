import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Pill, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { passwordSchema } from "@/lib/passwordValidation";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

import { Browser } from "@capacitor/browser";

export const MobileSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: "com.medibudget.app://login",
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account!");
      navigate("/login");
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "com.medibudget.app://login",
          skipBrowserRedirect: true,
        }
      });

      if (error) throw error;

      if (data?.url) {
        await Browser.open({ url: data.url, windowName: '_self' });
      }
    } catch (error: any) {
      toast.error("Google sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 safe-top safe-bottom">
      
      {/* Top logo */}
      <div className="flex flex-col items-center mt-6 space-y-2">
        <div className="h-10 w-10 rounded-2xl gradient-primary flex items-center justify-center shadow-md animate-bounce">
          <Pill className="h-5 w-5 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-md font-black text-foreground">Create Account</h1>
          <p className="text-[9px] text-muted-foreground">Start auditing & optimizing healthcare costs</p>
        </div>
      </div>

      {/* Main card */}
      <Card className="shadow-sm border border-border/40 w-full overflow-hidden bg-card">
        <CardHeader className="p-4 pb-2 text-center">
          <CardTitle className="text-xs font-bold text-foreground">Register Profile</CardTitle>
          <CardDescription className="text-[9px]">Fill details to build custom health ledger</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3.5">
          
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 h-9 text-xs"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-9 text-xs"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-9 text-xs"
                disabled={loading}
              />
            </div>

            <div className="px-1 scale-95">
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9 h-9 text-xs"
                disabled={loading}
              />
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-[9px] text-destructive px-1 font-bold">Passwords do not match</p>
            )}

            <Button
              type="submit"
              variant="hero"
              className="w-full h-10 text-xs font-bold shadow-glow active-scale mt-1.5"
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Account"}
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
            className="w-full h-9 text-xs font-bold active-scale"
            type="button"
            disabled={loading}
            onClick={handleGoogleSignup}
          >
            <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Identity
          </Button>

          <div className="flex items-start gap-1.5 p-2 rounded-xl bg-secondary/50 border border-border/40">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[8px] leading-relaxed text-muted-foreground">
              By registering, you agree to our end-user terms. Data is end-to-end encrypted.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Switch auth */}
      <div className="text-center py-4 space-y-1">
        <p className="text-[10px] text-muted-foreground">Already have an account?</p>
        <Link to="/login" className="text-xs text-primary font-black hover:underline">Sign In Instead</Link>
      </div>

    </div>
  );
};

export default MobileSignup;
