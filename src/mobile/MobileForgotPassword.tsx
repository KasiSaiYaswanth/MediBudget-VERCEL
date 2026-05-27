import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Pill, Mail, ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MobileForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Password reset link sent! Check your email.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 safe-top safe-bottom">
      
      {/* Top Logo */}
      <div className="flex flex-col items-center mt-8 space-y-2">
        <div className="h-10 w-10 rounded-2xl gradient-primary flex items-center justify-center shadow-md animate-bounce">
          <Pill className="h-5 w-5 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-md font-black text-foreground">Password Recovery</h1>
          <p className="text-[9px] text-muted-foreground">Restore your access to MediBudget</p>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm border border-border/40 w-full overflow-hidden bg-card">
        <CardHeader className="p-4 pb-2 text-center">
          <CardTitle className="text-xs font-bold text-foreground">Request Link</CardTitle>
          <CardDescription className="text-[9px]">
            {sent
              ? "Reset link dispatched successfully"
              : "Provide your email to receive recovery instructions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-4">
          
          {sent ? (
            <div className="text-center space-y-3.5">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>. Please check your inbox and spam folders.
              </p>
              <Button
                variant="outline"
                className="w-full h-9 text-xs font-bold active-scale"
                onClick={() => setSent(false)}
              >
                Send Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
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

              <Button
                type="submit"
                variant="hero"
                className="w-full h-10 text-xs font-bold shadow-glow active-scale"
                disabled={loading}
              >
                {loading ? "Sending link..." : "Send Reset Link"}
                <Send className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </form>
          )}

        </CardContent>
      </Card>

      {/* Return to sign-in */}
      <div className="text-center py-6">
        <Link to="/login" className="text-xs text-primary font-black hover:underline inline-flex items-center gap-1 active-scale">
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Sign In
        </Link>
      </div>

    </div>
  );
};

export default MobileForgotPassword;
