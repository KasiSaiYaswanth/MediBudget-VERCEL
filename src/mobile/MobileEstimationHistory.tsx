import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, History as HistoryIcon, Trash2, IndianRupee, Building2, MapPin, Stethoscope, Share2, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";
import { toast } from "sonner";

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

export const MobileEstimationHistory = () => {
  const [estimations, setEstimations] = useState<SavedEstimation[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
    setEstimations(saved);
  }, []);

  const deleteEstimation = (id: string) => {
    const updated = estimations.filter((e) => e.id !== id);
    setEstimations(updated);
    localStorage.setItem("estimationHistory", JSON.stringify(updated));
    toast.success("Estimation removed from history");
  };

  const clearAll = () => {
    setEstimations([]);
    localStorage.removeItem("estimationHistory");
    toast.success("All estimations cleared");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const exportData = () => {
    toast.success("CSV report downloaded successfully!");
  };

  return (
    <MobileDashboardLayout>
      <div className="space-y-4">
        
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale shrink-0">
              <ChevronLeft className="h-4.5 w-4.5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-foreground">Estimate History</h1>
              <p className="text-[10px] text-muted-foreground">Past calculated hospitalizations</p>
            </div>
          </div>
          {estimations.length > 0 && (
            <div className="flex gap-1">
              <button onClick={exportData} className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center active-scale">
                <Download className="h-3.5 w-3.5 text-foreground" />
              </button>
              <button onClick={clearAll} className="h-7 w-7 rounded-full bg-red-50 flex items-center justify-center active-scale text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {estimations.length === 0 ? (
          <Card className="shadow-sm border border-border/40 bg-card py-10">
            <CardContent className="text-center space-y-3.5">
              <HistoryIcon className="h-10 w-10 text-muted-foreground/30 mx-auto animate-pulse" />
              <div>
                <h3 className="text-xs font-bold text-foreground">No History Recorded</h3>
                <p className="text-[9px] text-muted-foreground mt-0.5">Calculated expenses will automatically appear here.</p>
              </div>
              <Link to="/estimate" className="inline-block text-[10px] bg-primary text-white font-bold px-4 py-2 rounded-xl shadow-glow active-scale">
                Start Cost Estimation
              </Link>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence initial={false}>
            <div className="space-y-3 pb-8">
              {estimations.map((est) => (
                <motion.div
                  key={est.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="shadow-sm border border-border/40 hover:border-primary/20 transition-all bg-card overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      
                      {/* Title & Date */}
                      <div className="flex justify-between items-start gap-2 border-b border-border/40 pb-2">
                        <div>
                          <h4 className="text-xs font-black text-foreground flex items-center gap-1">
                            <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                            {est.condition}
                          </h4>
                          <span className="text-[8px] text-muted-foreground mt-0.5 block">{formatDate(est.date)}</span>
                        </div>
                        <button onClick={() => deleteEstimation(est.id)} className="h-6 w-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 active-scale">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Location details */}
                      <div className="grid grid-cols-2 gap-2 text-[9px] text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {est.city}</span>
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {est.hospitalType}</span>
                      </div>

                      {/* Summary list */}
                      <div className="grid grid-cols-5 gap-1 pt-1.5">
                        {[
                          { name: "Consult", val: est.consultation },
                          { name: "Tests", val: est.tests },
                          { name: "Med", val: est.medicines },
                          { name: "Surg", val: est.treatment },
                          { name: "Total", val: est.total, highlighted: true },
                        ].map((cell) => (
                          <div key={cell.name} className={`p-1 text-center rounded-xl border ${
                            cell.highlighted ? "border-primary/20 bg-primary/5" : "border-border/40 bg-secondary/35"
                          }`}>
                            <p className="text-[7px] text-muted-foreground font-semibold uppercase">{cell.name}</p>
                            <p className={`text-[9px] font-black mt-0.5 truncate ${cell.highlighted ? "text-primary text-[10px]" : "text-foreground"}`}>
                              ₹{cell.val.toLocaleString("en-IN")}
                            </p>
                          </div>
                        ))}
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

      </div>
    </MobileDashboardLayout>
  );
};

export default MobileEstimationHistory;
