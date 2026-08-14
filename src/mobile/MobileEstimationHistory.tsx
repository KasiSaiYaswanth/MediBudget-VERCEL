import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";
import { useRealtimeSync } from "@/context/RealtimeSyncContext";
import {
  ChevronLeft,
  History as HistoryIcon,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  X,
  IndianRupee,
  Building2,
  MapPin,
  Stethoscope,
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Info,
} from "lucide-react";

interface CostLog {
  id: string;
  created_at: string;
  condition: string;
  city: string | null;
  hospital_type: string | null;
  estimated_cost: number;
  insurance_applied: boolean | null;
  insurance_coverage: number | null;
}

interface SymptomLog {
  id: string;
  created_at: string;
  symptom: string;
  predicted_condition: string | null;
  confidence_score: number | null;
  city: string | null;
}

export const MobileEstimationHistory = () => {
  const {
    estimations,
    symptoms,
    updateEstimation,
    deleteEstimation,
    updateSymptom,
    deleteSymptom,
    refreshData,
    syncStatus
  } = useRealtimeSync();

  const [activeTab, setActiveTab] = useState<"estimations" | "symptoms">("estimations");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Detailed sheet states
  const [selectedCost, setSelectedCost] = useState<CostLog | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomLog | null>(null);

  // Edit states
  const [editItem, setEditItem] = useState<{ id: string; type: "cost" | "symptom" } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Map to matching structures
  const costLogs: CostLog[] = estimations.map((item: any) => ({
    id: item.id,
    created_at: item.created_at,
    condition: item.condition,
    city: item.city,
    hospital_type: item.hospital_type,
    estimated_cost: Number(item.estimated_cost) || 0,
    insurance_applied: item.insurance_applied,
    insurance_coverage: Number(item.insurance_coverage) || 0
  }));

  const symptomLogs: SymptomLog[] = symptoms.map((item: any) => ({
    id: item.id,
    created_at: item.created_at,
    symptom: item.symptom,
    predicted_condition: item.predicted_condition,
    confidence_score: Number(item.confidence_score) || 0.85,
    city: item.city || "Unknown"
  }));

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast.success("History re-synced with cloud");
    } catch {
      toast.error("Sync failed");
    } finally {
      setRefreshing(false);
    }
  };

  const loading = syncStatus === "syncing" && estimations.length === 0 && symptoms.length === 0;

  // DELETE operation
  const handleDelete = async (id: string, type: "cost" | "symptom", e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening details Sheet

    try {
      if (type === "cost") {
        await deleteEstimation(id);
      } else {
        await deleteSymptom(id);
      }
      toast.success("Entry removed");
    } catch (err: any) {
      toast.error("Failed to delete entry: " + err.message);
    }
  };

  // EDIT / UPDATE operation
  const openEditDrawer = (id: string, currentVal: string, type: "cost" | "symptom", e: React.MouseEvent) => {
    e.stopPropagation();
    setEditItem({ id, type });
    setEditTitle(currentVal);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editItem) return;
    setEditLoading(true);

    try {
      if (editItem.type === "cost") {
        await updateEstimation(editItem.id, editTitle);
      } else {
        await updateSymptom(editItem.id, editTitle);
      }
      toast.success("Entry renamed");
      setEditItem(null);
    } catch (err: any) {
      toast.error("Failed to rename entry: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN")}`;

  // Filters logic
  const filteredCostLogs = costLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.condition.toLowerCase().includes(query) ||
      (log.city && log.city.toLowerCase().includes(query)) ||
      (log.hospital_type && log.hospital_type.toLowerCase().includes(query))
    );
  });

  const filteredSymptomLogs = symptomLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.symptom.toLowerCase().includes(query) ||
      (log.predicted_condition && log.predicted_condition.toLowerCase().includes(query))
    );
  });

  return (
    <MobileDashboardLayout>
      <div className="space-y-4">
        
        {/* Top Sticky Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale shrink-0">
              <ChevronLeft className="h-4.5 w-4.5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-foreground">History Center</h1>
              <p className="text-[10px] text-muted-foreground">Manage your dynamic audits & symptoms scans</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center active-scale text-foreground shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === "estimations" ? "Search calculations..." : "Search symptoms..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs rounded-2xl border border-border/40 bg-card/65 focus:border-primary/50"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Segments/Tabs selector */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-secondary border border-border/40">
          <button
            onClick={() => { setActiveTab("estimations"); setSearchQuery(""); }}
            className={`py-2 rounded-xl text-xs font-bold text-center transition-all ${
              activeTab === "estimations"
                ? "bg-card shadow-sm text-primary font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5" /> Cost Estimations
            </span>
          </button>
          <button
            onClick={() => { setActiveTab("symptoms"); setSearchQuery(""); }}
            className={`py-2 rounded-xl text-xs font-bold text-center transition-all ${
              activeTab === "symptoms"
                ? "bg-card shadow-sm text-primary font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Symptom AI Scans
            </span>
          </button>
        </div>

        {/* Main List Rendering */}
        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 w-full rounded-2xl border border-border/40 bg-card/40 animate-pulse flex flex-col p-4 justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-28 bg-muted/60 rounded-full" />
                  <div className="h-5 w-5 bg-muted/60 rounded-full" />
                </div>
                <div className="h-3 w-36 bg-muted/60 rounded-full" />
                <div className="flex gap-2">
                  <div className="h-8 flex-1 bg-muted/60 rounded-xl" />
                  <div className="h-8 flex-1 bg-muted/60 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "estimations" ? (
          filteredCostLogs.length === 0 ? (
            <Card className="shadow-sm border border-border/40 py-12 text-center bg-card">
              <CardContent className="space-y-3.5">
                <HistoryIcon className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <div>
                  <h3 className="text-xs font-bold text-foreground">No Estimations Found</h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Calculated expenses will appear here.</p>
                </div>
                <Link to="/estimate" className="inline-block text-[10px] bg-primary text-white font-bold px-4 py-2 rounded-xl shadow-glow active-scale">
                  Create First Estimate
                </Link>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-3 pb-24">
                {filteredCostLogs.map((log) => {
                  const isInsurance = log.insurance_applied;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedCost(log)}
                      className="active-scale cursor-pointer"
                    >
                      <Card className={`shadow-sm border transition-all overflow-hidden ${
                        isInsurance ? "border-emerald-500/20 hover:border-emerald-500/30" : "border-border/40 hover:border-primary/20"
                      }`}>
                        <CardContent className="p-4 space-y-3">
                          
                          {/* Title header */}
                          <div className="flex justify-between items-start gap-2 border-b border-border/30 pb-2">
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-foreground flex items-center gap-1.5 truncate">
                                {isInsurance ? (
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                                )}
                                {log.condition}
                              </h4>
                              <span className="text-[8px] text-muted-foreground mt-0.5 block flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" /> {formatDate(log.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => openEditDrawer(log.id, log.condition, "cost", e)}
                                className="h-6 w-6 rounded-full bg-secondary hover:bg-muted text-muted-foreground flex items-center justify-center shrink-0 active-scale"
                              >
                                <Edit3 className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(log.id, "cost", e)}
                                className="h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center shrink-0 active-scale"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Stats details */}
                          <div className="flex justify-between items-center text-[10px]">
                            <div className="space-y-0.5">
                              <p className="text-[8px] text-muted-foreground uppercase font-semibold">City & Hospital</p>
                              <p className="font-bold text-foreground truncate max-w-[150px] flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5 text-muted-foreground" /> {log.city || "Unknown City"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] text-muted-foreground uppercase font-semibold">
                                {isInsurance ? "Patient Payable" : "Estimated Cost"}
                              </p>
                              <p className={`font-black text-xs ${isInsurance ? "text-emerald-500" : "text-primary"}`}>
                                {formatCurrency(log.estimated_cost)}
                              </p>
                            </div>
                          </div>

                          {/* Insurance highlight tag if active */}
                          {isInsurance && log.insurance_coverage !== null && (
                            <div className="bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded-xl text-[9px] text-emerald-600 font-bold flex justify-between">
                              <span>Provider Covered Share:</span>
                              <span>{formatCurrency(log.insurance_coverage)}</span>
                            </div>
                          )}

                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )
        ) : (
          // Symptoms tab
          filteredSymptomLogs.length === 0 ? (
            <Card className="shadow-sm border border-border/40 py-12 text-center bg-card">
              <CardContent className="space-y-3.5">
                <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <div>
                  <h3 className="text-xs font-bold text-foreground">No Symptom AI Scans Found</h3>
                  <p className="text-[9px] text-muted-foreground mt-0.5">AI predictions will be cached here.</p>
                </div>
                <Link to="/symptoms" className="inline-block text-[10px] bg-primary text-white font-bold px-4 py-2 rounded-xl shadow-glow active-scale">
                  Start Symptom Audit
                </Link>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-3 pb-24">
                {filteredSymptomLogs.map((log) => {
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedSymptom(log)}
                      className="active-scale cursor-pointer"
                    >
                      <Card className="shadow-sm border border-border/40 hover:border-primary/20 transition-all bg-card overflow-hidden">
                        <CardContent className="p-4 space-y-2.5">
                          
                          {/* Title header */}
                          <div className="flex justify-between items-start gap-2 border-b border-border/30 pb-2">
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-foreground flex items-center gap-1.5 truncate">
                                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                                {log.symptom}
                              </h4>
                              <span className="text-[8px] text-muted-foreground mt-0.5 block flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" /> {formatDate(log.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => openEditDrawer(log.id, log.symptom, "symptom", e)}
                                className="h-6 w-6 rounded-full bg-secondary hover:bg-muted text-muted-foreground flex items-center justify-center shrink-0 active-scale"
                              >
                                <Edit3 className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(log.id, "symptom", e)}
                                className="h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center shrink-0 active-scale"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Prediction breakdown */}
                          <div className="flex justify-between items-end text-[10px]">
                            <div className="space-y-0.5">
                              <p className="text-[8px] text-muted-foreground uppercase font-semibold">AI Predicted Condition</p>
                              <p className="font-bold text-foreground truncate max-w-[170px]">{log.predicted_condition || "Analyzing..."}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-muted-foreground block mb-0.5">AI Confidence</span>
                              <span className="bg-primary/10 text-primary font-black px-2 py-0.5 rounded-full text-[9px]">
                                {log.confidence_score ? Math.round(log.confidence_score * 100) : 85}%
                              </span>
                            </div>
                          </div>

                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )
        )}

      </div>

      {/* RENDER BOTTOM DETAILS DRAWER (COST LOGS) */}
      <AnimatePresence>
        {selectedCost && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCost(null)} className="absolute inset-0 bg-[#070e11]/80 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className="relative w-full max-w-md bg-card border-t border-border/60 rounded-t-3xl p-5 pb-8 safe-bottom flex flex-col max-h-[80vh]">
              <div className="mx-auto w-10 h-1 bg-muted-foreground/20 rounded-full mb-3 shrink-0" />
              
              <div className="flex justify-between items-start mb-4 shrink-0 border-b border-border/30 pb-3">
                <div>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                    {selectedCost.insurance_applied ? (
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <Stethoscope className="h-4.5 w-4.5 text-primary" />
                    )}
                    {selectedCost.condition}
                  </h3>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> Calculated on {formatDate(selectedCost.created_at)}</p>
                </div>
                <button onClick={() => setSelectedCost(null)} className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-foreground active-scale"><X className="h-4 w-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {selectedCost.insurance_applied ? (
                  // Detailed insurance breakdown
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-[9px] text-muted-foreground">Insurer Cover</p>
                        <p className="text-lg font-black text-emerald-600 mt-0.5">{formatCurrency(selectedCost.insurance_coverage || 0)}</p>
                      </div>
                      <div className="text-center p-3 rounded-2xl bg-destructive/5 border border-destructive/10">
                        <p className="text-[9px] text-muted-foreground">Patient Out-of-Pocket</p>
                        <p className="text-lg font-black text-destructive mt-0.5">{formatCurrency(selectedCost.estimated_cost)}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/40 divide-y divide-border/40 text-xs">
                      <div className="flex justify-between p-3">
                        <span className="text-muted-foreground">Insurers Company</span>
                        <span className="font-bold text-foreground">{selectedCost.city || "Star Health"}</span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span className="text-muted-foreground">Audited Procedure Cost</span>
                        <span className="font-bold text-foreground">{formatCurrency((selectedCost.insurance_coverage || 0) + selectedCost.estimated_cost)}</span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span className="text-muted-foreground">Provider Share Paid</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(selectedCost.insurance_coverage || 0)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-500/5 font-black text-destructive">
                        <span>Patient Copays / Deductibles</span>
                        <span>{formatCurrency(selectedCost.estimated_cost)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Detailed hospitalization breakdown
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Estimated Cost Audited</p>
                      <p className="text-3xl font-black text-primary mt-1">{formatCurrency(selectedCost.estimated_cost)}</p>
                    </div>

                    <div className="rounded-2xl border border-border/40 divide-y divide-border/40 text-xs">
                      <div className="flex justify-between p-3">
                        <span className="text-muted-foreground">Regional Target City</span>
                        <span className="font-bold text-foreground">{selectedCost.city || "Unknown City"}</span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span className="text-muted-foreground">Hospital Facility Type</span>
                        <span className="font-bold text-foreground">{selectedCost.hospital_type || "Private General"}</span>
                      </div>
                    </div>

                    <div className="bg-secondary/40 p-3.5 rounded-2xl flex items-start gap-2.5 border border-border/20">
                      <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Procedural multiplier values are calculated against Tier 1 base standards. Always confirm direct billing eligibility with the reception desk before admission.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER BOTTOM DETAILS DRAWER (SYMPTOM LOGS) */}
      <AnimatePresence>
        {selectedSymptom && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSymptom(null)} className="absolute inset-0 bg-[#070e11]/80 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className="relative w-full max-w-md bg-card border-t border-border/60 rounded-t-3xl p-5 pb-8 safe-bottom flex flex-col max-h-[80vh]">
              <div className="mx-auto w-10 h-1 bg-muted-foreground/20 rounded-full mb-3 shrink-0" />
              
              <div className="flex justify-between items-start mb-4 shrink-0 border-b border-border/30 pb-3">
                <div>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                    Symptom AI Audit
                  </h3>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> Checked on {formatDate(selectedSymptom.created_at)}</p>
                </div>
                <button onClick={() => setSelectedSymptom(null)} className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-foreground active-scale"><X className="h-4 w-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-black px-1">Your Stated Symptoms</p>
                  <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border/40 text-xs font-semibold text-foreground leading-relaxed">
                    "{selectedSymptom.symptom}"
                  </div>
                </div>

                <div className="space-y-4 mt-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                      <p className="text-[9px] text-muted-foreground">Predicted Condition</p>
                      <p className="font-black text-xs text-primary mt-1 truncate">{selectedSymptom.predicted_condition || "General Issue"}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                      <p className="text-[9px] text-muted-foreground">AI Confidence Score</p>
                      <p className="font-black text-xs text-primary mt-1">{selectedSymptom.confidence_score ? Math.round(selectedSymptom.confidence_score * 100) : 85}%</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/40 p-4 space-y-3">
                    <h4 className="text-[10px] text-muted-foreground uppercase font-black">AI Recommendations</h4>
                    <p className="text-xs font-semibold text-foreground leading-relaxed flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      Consult standard General Physician clinic.
                    </p>
                    <p className="text-xs font-semibold text-foreground leading-relaxed flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      Crosscheck generic medications on OCR scanner.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                    <p className="text-[9px] leading-relaxed text-muted-foreground/80 font-medium">
                      ⚕️ Estimates only. Does not substitute professional medical diagnosis. Consult a qualified clinical specialist before taking decisions.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENDER EDIT TITLE SHEET (RENAME DRAWER) */}
      <AnimatePresence>
        {editItem && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditItem(null)} className="absolute inset-0 bg-[#070e11]/80 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className="relative w-full max-w-md bg-card border-t border-border/60 rounded-t-3xl p-5 pb-8 safe-bottom flex flex-col">
              <div className="mx-auto w-10 h-1 bg-muted-foreground/20 rounded-full mb-3 shrink-0" />
              
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  Rename Entry Title
                </h3>
                <button onClick={() => setEditItem(null)} className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-foreground active-scale"><X className="h-4 w-4" /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider px-1">Entry Title</label>
                  <Input
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-11 text-xs rounded-xl focus:border-primary/50"
                  />
                </div>
                <Button
                  onClick={handleUpdate}
                  disabled={editLoading || !editTitle.trim()}
                  className="w-full h-10 text-xs font-bold"
                >
                  {editLoading ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </MobileDashboardLayout>
  );
};

export default MobileEstimationHistory;
