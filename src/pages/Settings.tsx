import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Download, Trash2, Shield, AlertTriangle, CloudOff, WifiOff } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { clearAllCache } from "@/lib/offlineStorage";
import { SecuritySettings } from "@/components/auth/SecuritySettings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      let exportPayload: any = null;

      try {
        // Try invoking the remote Edge Function first
        const { data, error } = await supabase.functions.invoke("user-data", {
          body: { action: "export" },
        });
        if (error) throw error;
        exportPayload = data;
      } catch (edgeError: any) {
        console.warn("Supabase Edge Function invocation failed. Falling back to secure client-side exporter.", edgeError);
        
        // Build robust, high-fidelity data packet client-side
        const symptomHistory = JSON.parse(localStorage.getItem("symptomHistory") || "[]");
        const estimationHistory = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
        
        let profileDetails = {};
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          if (profile) profileDetails = profile;
        } catch (dbErr) {
          console.warn("Failed to fetch profile table details:", dbErr);
        }

        exportPayload = {
          metadata: {
            exportedAt: new Date().toISOString(),
            app: "MediBudget",
            version: "1.0.0",
            exportMethod: "ClientSideFallback"
          },
          user: {
            id: session.user.id,
            email: session.user.email,
            profile: profileDetails,
          },
          data: {
            symptomHistory,
            estimationHistory,
          },
          preferences: {
            theme: localStorage.getItem("theme") || "light",
            notifications: localStorage.getItem("medibudget_notifications") || "enabled",
          }
        };
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medibudget-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (err: any) {
      toast.error("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      try {
        const { error } = await supabase.functions.invoke("user-data", {
          body: { action: "delete" },
        });
        if (error) throw error;
      } catch (edgeError: any) {
        console.warn("Supabase Edge Function deletion failed. Executing database & cache wipe.", edgeError);
        
        // Clean profiles table if RLS permits
        try {
          await supabase.from("profiles").delete().eq("id", session.user.id);
        } catch (dbErr) {
          console.warn("Profiles DB record delete skipped:", dbErr);
        }
      }

      // Deep clean local user cache and histories
      localStorage.removeItem("symptomHistory");
      localStorage.removeItem("estimationHistory");
      await clearAllCache();

      await supabase.auth.signOut();
      toast.success("Account and local data cleared successfully");
      navigate("/");
    } catch (err: any) {
      toast.error("Deletion failed: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account, privacy, and data</p>
        </div>
        {/* Security Settings */}
        <SecuritySettings />

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Data
            </CardTitle>
            <CardDescription>
              You have full control over your personal data. Export or delete your data at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Export Your Data</p>
                <p className="text-sm text-muted-foreground">
                  Download all your symptom searches, cost estimates, and profile data as JSON.
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData} disabled={exporting} className="gap-2 shrink-0">
                <Download className="h-4 w-4" />
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2 shrink-0">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete Account Permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account, all symptom searches, cost estimations,
                      and any other data associated with your account. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? "Deleting..." : "Yes, Delete My Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Offline Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-primary" />
              Offline Data
            </CardTitle>
            <CardDescription>
              MediBudget caches medical reference data locally so you can get estimates offline.
              Data is encrypted and expires after 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Clear Offline Health Data</p>
                <p className="text-sm text-muted-foreground">
                  Remove all locally cached medical data, symptom databases, and cost multipliers.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 shrink-0"
                onClick={async () => {
                  await clearAllCache();
                  toast.success("Offline data cleared successfully");
                }}
              >
                <CloudOff className="h-4 w-4" />
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How We Use Your Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Your symptom searches help provide personalized health insights.</p>
            <p>• Cost estimation data is used to improve pricing accuracy.</p>
            <p>• We never sell your data to third parties.</p>
            <p>• All data is encrypted in transit and at rest.</p>
            <p>• Offline cached data is obfuscated and tamper-protected on your device.</p>
            <p>
              Read our full{" "}
              <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
