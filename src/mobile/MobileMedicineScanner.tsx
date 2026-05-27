import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Search, Pill, AlertTriangle, Info, ChevronLeft, Filter, ShieldCheck, ScanLine, ArrowRight, DollarSign, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";
import { searchMedicines, getCategories, getMedicinesByCategory, type MedicineInfo } from "@/lib/medicineService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import CameraScanner from "@/components/scanner/CameraScanner";
import ScanResultCard, { type ScannedMedicine } from "@/components/scanner/ScanResultCard";
import SymptomMedicineGuide from "@/components/scanner/SymptomMedicineGuide";

export const MobileMedicineScanner = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MedicineInfo[]>([]);
  const [selected, setSelected] = useState<MedicineInfo | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScannedMedicine | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() && !selectedCategory) return;
    setSearching(true);
    setSelected(null);
    setScanResult(null);
    try {
      let data: MedicineInfo[];
      if (selectedCategory && !query.trim()) {
        data = await getMedicinesByCategory(selectedCategory);
      } else {
        data = await searchMedicines(query);
        if (selectedCategory) {
          data = data.filter((m) => m.category === selectedCategory);
        }
      }
      setResults(data);
      if (data.length === 1) setSelected(data[0]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleCategoryChange = async (cat: string) => {
    setSelectedCategory(cat === "all" ? "" : cat);
    if (cat && cat !== "all") {
      setSearching(true);
      setSelected(null);
      const data = await getMedicinesByCategory(cat);
      setResults(data);
      setSearching(false);
    }
  };

  const handleScanResult = (result: ScannedMedicine, image: string) => {
    setScanResult(result);
    setCapturedImage(image);
    setShowCamera(false);
    setSelected(null);
  };

  const handleSearchFromScan = async (name: string) => {
    setQuery(name);
    setScanResult(null);
    setSearching(true);
    const data = await searchMedicines(name);
    setResults(data);
    if (data.length > 0) setSelected(data[0]);
    setSearching(false);
  };

  return (
    <MobileDashboardLayout>
      <div className="space-y-4">
        {/* Top Header info */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale shrink-0">
            <ChevronLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground">Medicine Scanner</h1>
            <p className="text-[10px] text-muted-foreground">Scan details or generic drug alternates</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showCamera ? (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-50 relative">
              <CameraScanner
                onScanResult={handleScanResult}
                onClose={() => setShowCamera(false)}
              />
            </motion.div>
          ) : scanResult ? (
            <motion.div key="scan-result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ScanResultCard
                result={scanResult}
                capturedImage={capturedImage}
                onScanAgain={() => {
                  setScanResult(null);
                  setShowCamera(true);
                }}
                onSearchInDb={handleSearchFromScan}
              />
            </motion.div>
          ) : (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Scan Trigger Card */}
              <Card className="shadow-sm border border-border/40 overflow-hidden">
                <CardContent className="p-4 space-y-3.5">
                  <Button
                    variant="hero"
                    className="w-full h-12 text-sm font-bold shadow-glow relative overflow-hidden active-scale"
                    onClick={() => setShowCamera(true)}
                  >
                    <ScanLine className="h-4.5 w-4.5 mr-2" />
                    Scan Medicine Pack
                  </Button>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border/60" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold">or search by name</span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. Paracetamol..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Horizontal Category badge filters */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-bounce">
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full shrink-0 border transition-all ${
                        !selectedCategory ? "bg-primary text-white border-primary" : "bg-secondary text-muted-foreground border-transparent"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full shrink-0 border transition-all ${
                          selectedCategory === cat ? "bg-primary text-white border-primary" : "bg-secondary text-muted-foreground border-transparent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instant Search Results */}
              {results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-semibold px-1">{results.length} medicines found</p>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {results.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => setSelected(med)}
                        className={`w-full text-left p-3 rounded-xl border transition-all active-scale ${
                          selected?.id === med.id ? "border-primary bg-primary/5" : "border-border/40 bg-card hover:border-primary/30"
                        }`}
                      >
                        <p className="text-xs font-bold text-foreground">{med.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{med.generic_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[8px] px-1 py-0">{med.category}</Badge>
                          {med.prescription_required && (
                            <Badge variant="destructive" className="text-[8px] px-1 py-0">Rx Required</Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicine details slide up/card */}
              {selected && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="shadow-md border-primary/20 bg-card relative overflow-hidden">
                    <button onClick={() => setSelected(null)} className="absolute right-3 top-3 h-7 w-7 rounded-full bg-secondary/80 flex items-center justify-center active-scale">
                      <X className="h-3.5 w-3.5 text-foreground" />
                    </button>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                          <Pill className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div className="min-w-0 pr-8">
                          <CardTitle className="text-sm font-black text-foreground truncate">{selected.name}</CardTitle>
                          <CardDescription className="text-[9px] truncate">{selected.generic_name}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 space-y-3.5">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[8px]">{selected.category}</Badge>
                        {selected.prescription_required && (
                          <Badge variant="destructive" className="text-[8px] flex items-center gap-0.5">
                            <ShieldCheck className="h-2.5 w-2.5" /> Rx Required
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-foreground flex items-center gap-1">
                          <Info className="h-3.5 w-3.5 text-primary shrink-0" /> Uses
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selected.uses.map((u) => (
                            <span key={u} className="text-[9px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{u}</span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 border-t border-border/40 pt-3">
                        <div>
                          <h4 className="text-[10px] font-bold text-foreground">💊 Dosage</h4>
                          <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{selected.dosage}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-foreground">⚠️ Warnings</h4>
                          <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed truncate">{selected.warnings[0]}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-foreground">Estimated Cost</span>
                          <span className="text-xs font-black text-primary">{selected.price_range}</span>
                        </div>

                        {selected.alternatives && selected.alternatives.length > 0 && (
                          <div className="space-y-1">
                            <h4 className="text-[9px] font-bold text-emerald-600">💡 Save Money: Cheaper Generic Drugs</h4>
                            <div className="flex flex-wrap gap-1">
                              {selected.alternatives.map((alt) => (
                                <button
                                  key={alt}
                                  onClick={() => { setQuery(alt); setSelected(null); }}
                                  className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-colors"
                                >
                                  {alt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          variant="hero"
                          className="w-full h-9 text-[10px] font-bold active-scale mt-1.5"
                          onClick={() => navigate('/estimate', { state: { description: `Need treatment cost estimate matching generic medicine ${selected.name} (${selected.generic_name}) for ${selected.uses.join(', ')}.` } })}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Compare Hospital Treatment Cost
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Symptom guide container */}
              {!selected && (
                <div className="pt-2">
                  <SymptomMedicineGuide onMedicineSearch={handleSearchFromScan} />
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Info footer */}
        <div className="p-3 rounded-2xl bg-secondary/30 text-center">
          <p className="text-[8px] leading-relaxed text-muted-foreground font-semibold">
            ⚕️ Information is for educational use only. Always consult a certified healthcare professional.
          </p>
        </div>
      </div>
    </MobileDashboardLayout>
  );
};

// Simple Layout wrapper locally to support index imports cleanly
const MobileMedicineScannerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="min-h-screen bg-background pb-20">{children}</div>;
};

export default MobileMedicineScanner;
