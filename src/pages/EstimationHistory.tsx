import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, History as HistoryIcon, Trash2, IndianRupee, Building2, MapPin, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { useRealtimeSync } from "@/context/RealtimeSyncContext";
import { reconstructEstimation } from "@/lib/reconstructEstimation";

interface SavedEstimation {
  id: string;
  date: string;
  condition: string;
  city: string;
  hospitalType: string;
  consultation: number;
  tests: number;
  medicines: number;
  treatment: number;
  total: number;
  cityMultiplier: number;
  hospitalMultiplier: number;
}

const EstimationHistory = () => {
  const { estimations: rawEstimations, deleteEstimation } = useRealtimeSync();

  const estimations = rawEstimations.map(reconstructEstimation);

  const handleDelete = async (id: string) => {
    try {
      await deleteEstimation(id);
      toast.success("Estimation removed from history");
    } catch {
      toast.error("Failed to delete estimation");
    }
  };

  const clearAll = async () => {
    try {
      for (const est of rawEstimations) {
        await deleteEstimation(est.id);
      }
      toast.success("All estimations cleared");
    } catch {
      toast.error("Failed to clear some estimations");
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Estimation History</h1>
            <p className="text-muted-foreground mt-1">View and compare your past estimations.</p>
          </div>
          {estimations.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Clear All
            </Button>
          )}
        </div>

        {estimations.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <HistoryIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No estimations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your cost estimations will appear here after you complete your first one.
              </p>
              <Link to="/estimate" className="text-sm text-primary font-medium hover:underline">
                Create your first estimation →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence initial={false}>
            <div className="grid gap-4">
              {estimations.map((est, i) => (
                <motion.div
                  key={est.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="shadow-card hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold text-foreground">{est.condition}</h3>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDate(est.date)}</span>
                          </div>

                          {/* Location & Hospital */}
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {est.city}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" /> {est.hospitalType}
                            </span>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                            {[
                              { label: "Consultation", value: est.consultation },
                              { label: "Tests", value: est.tests },
                              { label: "Medicines", value: est.medicines },
                              { label: "Treatment", value: est.treatment },
                              { label: "Total", value: est.total, highlight: true },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className={`rounded-lg p-2 text-center ${
                                  item.highlight ? "bg-primary/10 border border-primary/20" : "bg-secondary"
                                }`}
                              >
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                                <p className={`font-semibold ${item.highlight ? "text-primary" : "text-foreground"}`}>
                                  <IndianRupee className="h-3 w-3 inline -mt-0.5" />
                                  {item.value.toLocaleString("en-IN")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => handleDelete(est.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EstimationHistory;
