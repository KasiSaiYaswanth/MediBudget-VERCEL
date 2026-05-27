import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MapPin, Building2, Stethoscope, Calculator } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CostResults from "@/components/estimation/CostResults";
import NearbyHospitals from "@/components/estimation/NearbyHospitals";
import ConditionAnalyzer from "@/components/estimation/ConditionAnalyzer";
import { matchCityToList } from "@/lib/locationService";

const cities = [
  // Andhra Pradesh
  { value: "visakhapatnam", label: "Visakhapatnam", state: "Andhra Pradesh", multiplier: 1.05 },
  { value: "vijayawada", label: "Vijayawada", state: "Andhra Pradesh", multiplier: 1.0 },
  { value: "guntur", label: "Guntur", state: "Andhra Pradesh", multiplier: 0.9 },
  { value: "nellore", label: "Nellore", state: "Andhra Pradesh", multiplier: 0.85 },
  { value: "kurnool", label: "Kurnool", state: "Andhra Pradesh", multiplier: 0.85 },
  { value: "rajahmundry", label: "Rajahmundry", state: "Andhra Pradesh", multiplier: 0.9 },
  { value: "tirupati", label: "Tirupati", state: "Andhra Pradesh", multiplier: 0.95 },
  { value: "kakinada", label: "Kakinada", state: "Andhra Pradesh", multiplier: 0.85 },
  { value: "anantapur", label: "Anantapur", state: "Andhra Pradesh", multiplier: 0.8 },
  { value: "eluru", label: "Eluru", state: "Andhra Pradesh", multiplier: 0.8 },
  { value: "ongole", label: "Ongole", state: "Andhra Pradesh", multiplier: 0.8 },
  { value: "srikakulam", label: "Srikakulam", state: "Andhra Pradesh", multiplier: 0.8 },
  { value: "amaravati", label: "Amaravati", state: "Andhra Pradesh", multiplier: 0.95 },
  // Telangana
  { value: "hyderabad", label: "Hyderabad", state: "Telangana", multiplier: 1.25 },
  { value: "warangal", label: "Warangal", state: "Telangana", multiplier: 0.9 },
  { value: "nizamabad", label: "Nizamabad", state: "Telangana", multiplier: 0.85 },
  { value: "karimnagar", label: "Karimnagar", state: "Telangana", multiplier: 0.85 },
  { value: "khammam", label: "Khammam", state: "Telangana", multiplier: 0.85 },
  { value: "mahbubnagar", label: "Mahbubnagar", state: "Telangana", multiplier: 0.8 },
  { value: "nalgonda", label: "Nalgonda", state: "Telangana", multiplier: 0.8 },
  { value: "adilabad", label: "Adilabad", state: "Telangana", multiplier: 0.8 },
  { value: "secunderabad", label: "Secunderabad", state: "Telangana", multiplier: 1.2 },
  { value: "rangareddy", label: "Ranga Reddy", state: "Telangana", multiplier: 1.1 },
  // Tamil Nadu
  { value: "chennai", label: "Chennai", state: "Tamil Nadu", multiplier: 1.3 },
  { value: "coimbatore", label: "Coimbatore", state: "Tamil Nadu", multiplier: 1.1 },
  { value: "madurai", label: "Madurai", state: "Tamil Nadu", multiplier: 1.0 },
  { value: "tiruchirappalli", label: "Tiruchirappalli", state: "Tamil Nadu", multiplier: 0.95 },
  { value: "salem", label: "Salem", state: "Tamil Nadu", multiplier: 0.9 },
  { value: "tirunelveli", label: "Tirunelveli", state: "Tamil Nadu", multiplier: 0.9 },
  { value: "vellore", label: "Vellore", state: "Tamil Nadu", multiplier: 1.0 },
  // Karnataka
  { value: "bangalore", label: "Bengaluru", state: "Karnataka", multiplier: 1.35 },
  { value: "mysuru", label: "Mysuru", state: "Karnataka", multiplier: 1.0 },
  { value: "mangalore", label: "Mangaluru", state: "Karnataka", multiplier: 1.05 },
  { value: "hubli", label: "Hubli-Dharwad", state: "Karnataka", multiplier: 0.9 },
  { value: "belgaum", label: "Belagavi", state: "Karnataka", multiplier: 0.9 },
  // Kerala
  { value: "thiruvananthapuram", label: "Thiruvananthapuram", state: "Kerala", multiplier: 1.1 },
  { value: "kochi", label: "Kochi", state: "Kerala", multiplier: 1.15 },
  { value: "kozhikode", label: "Kozhikode", state: "Kerala", multiplier: 1.0 },
  { value: "thrissur", label: "Thrissur", state: "Kerala", multiplier: 0.95 },
  // Maharashtra
  { value: "mumbai", label: "Mumbai", state: "Maharashtra", multiplier: 1.6 },
  { value: "pune", label: "Pune", state: "Maharashtra", multiplier: 1.25 },
  { value: "nagpur", label: "Nagpur", state: "Maharashtra", multiplier: 1.0 },
  { value: "nashik", label: "Nashik", state: "Maharashtra", multiplier: 0.95 },
  { value: "aurangabad", label: "Chhatrapati Sambhajinagar", state: "Maharashtra", multiplier: 0.95 },
  // Delhi NCR
  { value: "delhi", label: "New Delhi", state: "Delhi", multiplier: 1.5 },
  { value: "noida", label: "Noida", state: "Uttar Pradesh", multiplier: 1.3 },
  { value: "gurgaon", label: "Gurugram", state: "Haryana", multiplier: 1.4 },
  { value: "faridabad", label: "Faridabad", state: "Haryana", multiplier: 1.1 },
  { value: "ghaziabad", label: "Ghaziabad", state: "Uttar Pradesh", multiplier: 1.15 },
  // Uttar Pradesh
  { value: "lucknow", label: "Lucknow", state: "Uttar Pradesh", multiplier: 0.95 },
  { value: "kanpur", label: "Kanpur", state: "Uttar Pradesh", multiplier: 0.9 },
  { value: "varanasi", label: "Varanasi", state: "Uttar Pradesh", multiplier: 0.9 },
  { value: "agra", label: "Agra", state: "Uttar Pradesh", multiplier: 0.9 },
  { value: "prayagraj", label: "Prayagraj", state: "Uttar Pradesh", multiplier: 0.85 },
  // West Bengal
  { value: "kolkata", label: "Kolkata", state: "West Bengal", multiplier: 1.15 },
  // Gujarat
  { value: "ahmedabad", label: "Ahmedabad", state: "Gujarat", multiplier: 1.15 },
  { value: "surat", label: "Surat", state: "Gujarat", multiplier: 1.1 },
  { value: "vadodara", label: "Vadodara", state: "Gujarat", multiplier: 1.0 },
  { value: "rajkot", label: "Rajkot", state: "Gujarat", multiplier: 0.95 },
  // Rajasthan
  { value: "jaipur", label: "Jaipur", state: "Rajasthan", multiplier: 1.05 },
  { value: "jodhpur", label: "Jodhpur", state: "Rajasthan", multiplier: 0.9 },
  { value: "udaipur", label: "Udaipur", state: "Rajasthan", multiplier: 0.9 },
  // Madhya Pradesh
  { value: "bhopal", label: "Bhopal", state: "Madhya Pradesh", multiplier: 0.95 },
  { value: "indore", label: "Indore", state: "Madhya Pradesh", multiplier: 1.0 },
  // Punjab & Haryana
  { value: "chandigarh", label: "Chandigarh", state: "Chandigarh", multiplier: 1.15 },
  { value: "ludhiana", label: "Ludhiana", state: "Punjab", multiplier: 1.0 },
  { value: "amritsar", label: "Amritsar", state: "Punjab", multiplier: 0.95 },
  // Others
  { value: "patna", label: "Patna", state: "Bihar", multiplier: 0.85 },
  { value: "ranchi", label: "Ranchi", state: "Jharkhand", multiplier: 0.85 },
  { value: "bhubaneswar", label: "Bhubaneswar", state: "Odisha", multiplier: 0.9 },
  { value: "guwahati", label: "Guwahati", state: "Assam", multiplier: 0.9 },
  { value: "dehradun", label: "Dehradun", state: "Uttarakhand", multiplier: 1.0 },
  { value: "shimla", label: "Shimla", state: "Himachal Pradesh", multiplier: 0.95 },
  { value: "raipur", label: "Raipur", state: "Chhattisgarh", multiplier: 0.85 },
  { value: "panaji", label: "Panaji", state: "Goa", multiplier: 1.1 },
  { value: "imphal", label: "Imphal", state: "Manipur", multiplier: 0.85 },
  { value: "shillong", label: "Shillong", state: "Meghalaya", multiplier: 0.85 },
  { value: "aizawl", label: "Aizawl", state: "Mizoram", multiplier: 0.85 },
  { value: "kohima", label: "Kohima", state: "Nagaland", multiplier: 0.85 },
  { value: "gangtok", label: "Gangtok", state: "Sikkim", multiplier: 0.9 },
  { value: "agartala", label: "Agartala", state: "Tripura", multiplier: 0.8 },
  { value: "itanagar", label: "Itanagar", state: "Arunachal Pradesh", multiplier: 0.85 },
  { value: "srinagar", label: "Srinagar", state: "Jammu & Kashmir", multiplier: 0.95 },
  { value: "jammu", label: "Jammu", state: "Jammu & Kashmir", multiplier: 0.9 },
];

// Group cities by state for better UX
const cityGroups = cities.reduce((acc, city) => {
  if (!acc[city.state]) acc[city.state] = [];
  acc[city.state].push(city);
  return acc;
}, {} as Record<string, typeof cities>);

const sortedStates = Object.keys(cityGroups).sort();

const hospitalTypes = [
  { value: "government", label: "Government Hospital", multiplier: 0.3 },
  { value: "private", label: "Private Hospital", multiplier: 1.0 },
  { value: "corporate", label: "Corporate Hospital", multiplier: 1.8 },
  { value: "trust", label: "Trust / Charitable Hospital", multiplier: 0.5 },
];

export const conditions = [
  { value: "fever", label: "Fever / Common Cold", baseCost: { consultation: 300, tests: 500, medicines: 200, treatment: 0 },
    recommendedTests: ["Complete Blood Count (CBC)", "ESR", "Widal Test", "Dengue NS1 Antigen", "Malaria Parasite Test", "Urine Routine"],
    recommendedMedicines: ["Paracetamol 500mg", "Cetirizine 10mg", "Azithromycin 500mg", "Amoxicillin 500mg", "ORS Sachets", "Vitamin C tablets"] },
  { value: "fracture", label: "Bone Fracture", baseCost: { consultation: 500, tests: 2000, medicines: 800, treatment: 15000 },
    recommendedTests: ["X-Ray (affected area)", "CT Scan (if complex)", "CBC", "Calcium & Vitamin D levels", "Bone Density Test"],
    recommendedMedicines: ["Diclofenac 50mg", "Tramadol 50mg", "Calcium + Vitamin D3", "Shelcal 500", "Combiflam", "Hifenac-P"] },
  { value: "cardiac", label: "Cardiac Check-up", baseCost: { consultation: 800, tests: 5000, medicines: 1500, treatment: 0 },
    recommendedTests: ["ECG", "2D Echocardiography", "Lipid Profile", "Troponin T", "TMT (Treadmill Test)", "Chest X-Ray", "BNP/NT-proBNP"],
    recommendedMedicines: ["Aspirin 75mg", "Atorvastatin 10mg", "Metoprolol 25mg", "Clopidogrel 75mg", "Ramipril 5mg", "Amlodipine 5mg"] },
  { value: "bypass", label: "Heart Bypass Surgery", baseCost: { consultation: 1500, tests: 15000, medicines: 5000, treatment: 200000 },
    recommendedTests: ["Coronary Angiography", "ECG", "2D Echo", "Chest X-Ray", "CBC", "Kidney Function Test", "Liver Function Test", "Coagulation Profile", "Blood Grouping & Cross-match"],
    recommendedMedicines: ["Aspirin 75mg", "Clopidogrel 75mg", "Atorvastatin 40mg", "Metoprolol 50mg", "Heparin injection", "Warfarin 5mg", "Pantoprazole 40mg", "Enoxaparin injection"] },
  { value: "angioplasty", label: "Angioplasty / Stent", baseCost: { consultation: 1000, tests: 10000, medicines: 3000, treatment: 150000 },
    recommendedTests: ["Coronary Angiography", "ECG", "2D Echo", "Lipid Profile", "HbA1c", "Creatinine", "CBC", "Coagulation Profile"],
    recommendedMedicines: ["Aspirin 150mg", "Ticagrelor 90mg", "Rosuvastatin 20mg", "Pantoprazole 40mg", "Metoprolol 25mg", "Nitroglycerin patch"] },
  { value: "dental", label: "Dental Treatment", baseCost: { consultation: 400, tests: 800, medicines: 300, treatment: 5000 },
    recommendedTests: ["Dental X-Ray (OPG)", "IOPA X-Ray", "CBCT Scan (if implant)"],
    recommendedMedicines: ["Amoxicillin 500mg", "Metronidazole 400mg", "Ibuprofen 400mg", "Chlorhexidine Mouthwash", "Clove Oil", "Orajel gel"] },
  { value: "eye", label: "Eye Check-up / Cataract", baseCost: { consultation: 500, tests: 1500, medicines: 600, treatment: 25000 },
    recommendedTests: ["Visual Acuity Test", "Slit Lamp Examination", "Fundoscopy", "OCT Scan", "Tonometry (IOP)", "A-Scan Biometry"],
    recommendedMedicines: ["Moxifloxacin Eye Drops", "Prednisolone Eye Drops", "Nepafenac Eye Drops", "Carboxymethylcellulose Drops", "Timolol 0.5% Drops", "Tropicamide Eye Drops"] },
  { value: "maternity", label: "Normal Delivery", baseCost: { consultation: 1000, tests: 5000, medicines: 2000, treatment: 25000 },
    recommendedTests: ["Ultrasound (USG)", "CBC", "Blood Group & Rh", "HIV/HBsAg/VDRL", "Urine Routine", "GTT (Glucose Tolerance)", "TSH", "Double/Triple Marker Test"],
    recommendedMedicines: ["Iron + Folic Acid tablets", "Calcium supplements", "Progesterone (if needed)", "Oxytocin injection", "Methylergometrine", "Ranitidine 150mg"] },
  { value: "csection", label: "C-Section Delivery", baseCost: { consultation: 1500, tests: 6000, medicines: 3000, treatment: 50000 },
    recommendedTests: ["Ultrasound (USG)", "CBC", "Blood Group & Cross-match", "Coagulation Profile", "Kidney & Liver Function", "NST (Non-Stress Test)", "HbA1c"],
    recommendedMedicines: ["Ceftriaxone 1g injection", "Metronidazole IV", "Tramadol injection", "Oxytocin injection", "Iron + Folic Acid", "Ranitidine 150mg", "Enoxaparin (if needed)"] },
  { value: "kidney", label: "Kidney Treatment / Dialysis", baseCost: { consultation: 800, tests: 8000, medicines: 3000, treatment: 50000 },
    recommendedTests: ["Serum Creatinine", "BUN", "eGFR", "Urine Albumin", "Kidney USG", "Electrolytes (Na/K/Ca/P)", "CBC", "iPTH", "24-hr Urine Protein"],
    recommendedMedicines: ["Telmisartan 40mg", "Furosemide 40mg", "Erythropoietin injection", "Sodium Bicarbonate", "Calcium Acetate", "Atorvastatin 10mg", "Iron Sucrose injection"] },
  { value: "transplant", label: "Kidney Transplant", baseCost: { consultation: 2000, tests: 25000, medicines: 10000, treatment: 500000 },
    recommendedTests: ["HLA Typing", "Cross-match Test", "Kidney Biopsy", "CT Angiography", "Viral Panel (CMV/EBV/BK)", "CBC", "Liver & Kidney Function", "Cardiac Clearance"],
    recommendedMedicines: ["Tacrolimus", "Mycophenolate Mofetil", "Prednisolone", "Basiliximab injection", "Valganciclovir", "Cotrimoxazole", "Pantoprazole 40mg"] },
  { value: "skin", label: "Skin / Dermatology", baseCost: { consultation: 400, tests: 1000, medicines: 500, treatment: 2000 },
    recommendedTests: ["Skin Biopsy", "KOH Test", "Patch Test (Allergy)", "CBC with ESR", "IgE Levels", "Fungal Culture"],
    recommendedMedicines: ["Fluconazole 150mg", "Cetirizine 10mg", "Betamethasone Cream", "Clotrimazole Cream", "Hydroxyzine 25mg", "Moisturizing Lotion", "Mupirocin Ointment"] },
  { value: "cancer", label: "Cancer Treatment (per cycle)", baseCost: { consultation: 1500, tests: 15000, medicines: 20000, treatment: 50000 },
    recommendedTests: ["Biopsy & Histopathology", "PET-CT Scan", "Tumor Markers (CEA/CA-125/PSA)", "CBC", "Liver & Kidney Function", "CT Scan", "MRI", "Bone Marrow Biopsy (if needed)"],
    recommendedMedicines: ["Cisplatin", "Paclitaxel", "5-Fluorouracil", "Ondansetron 8mg", "Dexamethasone", "Filgrastim injection", "Pantoprazole 40mg", "Morphine (pain management)"] },
  { value: "appendix", label: "Appendicitis Surgery", baseCost: { consultation: 500, tests: 3000, medicines: 1000, treatment: 30000 },
    recommendedTests: ["Ultrasound Abdomen", "CT Abdomen", "CBC", "CRP", "Urine Routine", "Liver & Kidney Function"],
    recommendedMedicines: ["Ceftriaxone 1g", "Metronidazole 500mg", "Tramadol 50mg", "Pantoprazole 40mg", "Ondansetron 4mg", "Paracetamol IV"] },
  { value: "hernia", label: "Hernia Surgery", baseCost: { consultation: 500, tests: 3000, medicines: 1000, treatment: 35000 },
    recommendedTests: ["Ultrasound Abdomen", "CBC", "Chest X-Ray", "ECG", "Coagulation Profile", "Blood Sugar"],
    recommendedMedicines: ["Ceftriaxone 1g", "Diclofenac 50mg", "Pantoprazole 40mg", "Lactulose Syrup", "Paracetamol 500mg", "Metronidazole 400mg"] },
  { value: "knee", label: "Knee Replacement", baseCost: { consultation: 1000, tests: 8000, medicines: 3000, treatment: 200000 },
    recommendedTests: ["X-Ray Knee (AP & Lateral)", "MRI Knee", "CBC", "ESR & CRP", "Vitamin D & Calcium", "Blood Group & Cross-match", "ECG", "Chest X-Ray"],
    recommendedMedicines: ["Enoxaparin injection", "Celecoxib 200mg", "Pregabalin 75mg", "Calcium + Vitamin D3", "Tramadol 50mg", "Ceftriaxone 1g", "Pantoprazole 40mg"] },
  { value: "spine", label: "Spine Surgery", baseCost: { consultation: 1500, tests: 10000, medicines: 5000, treatment: 300000 },
    recommendedTests: ["MRI Spine", "CT Spine", "X-Ray Spine", "Nerve Conduction Study", "EMG", "CBC", "Coagulation Profile", "Vitamin D levels"],
    recommendedMedicines: ["Pregabalin 75mg", "Methylprednisolone injection", "Gabapentin 300mg", "Tramadol 50mg", "Diclofenac 50mg", "Enoxaparin injection", "Ceftriaxone 1g"] },
  { value: "diabetes", label: "Diabetes Management (monthly)", baseCost: { consultation: 500, tests: 2000, medicines: 1500, treatment: 0 },
    recommendedTests: ["Fasting Blood Sugar", "Post-Prandial Blood Sugar", "HbA1c", "Lipid Profile", "Kidney Function Test", "Urine Microalbumin", "Fundoscopy"],
    recommendedMedicines: ["Metformin 500mg", "Glimepiride 1mg", "Insulin Glargine", "Sitagliptin 100mg", "Empagliflozin 10mg", "Atorvastatin 10mg", "Aspirin 75mg"] },
  { value: "thyroid", label: "Thyroid Treatment", baseCost: { consultation: 400, tests: 1500, medicines: 500, treatment: 0 },
    recommendedTests: ["TSH", "Free T3 & T4", "Anti-TPO Antibodies", "Thyroid USG", "FNAC (if nodule)", "CBC"],
    recommendedMedicines: ["Levothyroxine 50mcg", "Carbimazole 5mg", "Propranolol 40mg", "Calcium + Vitamin D3", "Selenium supplements"] },
  { value: "neuro", label: "Neurological Consultation", baseCost: { consultation: 800, tests: 5000, medicines: 2000, treatment: 0 },
    recommendedTests: ["MRI Brain", "EEG", "Nerve Conduction Study", "CT Brain", "Lumbar Puncture (CSF analysis)", "Carotid Doppler"],
    recommendedMedicines: ["Levetiracetam 500mg", "Pregabalin 75mg", "Amitriptyline 10mg", "Sodium Valproate 500mg", "Donepezil 5mg", "Piracetam 800mg"] },
];

export interface EstimationResult {
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
  recommendedTests: string[];
  recommendedMedicines: string[];
}

const CostEstimation = () => {
  const location = useLocation();
  const navState = location.state as { chatbotCondition?: string; description?: string } | null;

  const [step, setStep] = useState(1);
  const [dynamicCities, setDynamicCities] = useState(cities);
  const [city, setCity] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [condition, setCondition] = useState("");
  const [locality, setLocality] = useState("");
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [showLocationDetector, setShowLocationDetector] = useState(true);
  const [chatbotCondition] = useState(navState?.chatbotCondition || "");
  const [initialDescription] = useState(navState?.description || "");

  const totalSteps = 3;

  // Group cities by state dynamically for better UX
  const cityGroups = dynamicCities.reduce((acc, cityItem) => {
    if (!acc[cityItem.state]) acc[cityItem.state] = [];
    acc[cityItem.state].push(cityItem);
    return acc;
  }, {} as Record<string, typeof cities>);

  const sortedStates = Object.keys(cityGroups).sort();

  const calculate = () => {
    const c = dynamicCities.find((x) => x.value === city);
    const h = hospitalTypes.find((x) => x.value === hospitalType);
    const cond = conditions.find((x) => x.value === condition);

    if (!c || !h || !cond) return;

    const cm = c.multiplier;
    const hm = h.multiplier;

    const consultation = Math.round(cond.baseCost.consultation * cm * hm);
    const tests = Math.round(cond.baseCost.tests * cm * hm);
    const medicines = Math.round(cond.baseCost.medicines * cm * hm);
    const treatment = Math.round(cond.baseCost.treatment * cm * hm);
    const total = consultation + tests + medicines + treatment;

    setResult({
      condition: cond.label,
      city: `${c.label}, ${c.state}`,
      hospitalType: h.label,
      consultation,
      tests,
      medicines,
      treatment,
      total,
      cityMultiplier: cm,
      hospitalMultiplier: hm,
      recommendedTests: cond.recommendedTests,
      recommendedMedicines: cond.recommendedMedicines,
    });

    // Save to localStorage for history
    const savedEstimation = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      condition: cond.label,
      city: `${c.label}, ${c.state}`,
      hospitalType: h.label,
      consultation,
      tests,
      medicines,
      treatment,
      total,
      cityMultiplier: cm,
      hospitalMultiplier: hm,
    };
    const existing = JSON.parse(localStorage.getItem("estimationHistory") || "[]");
    existing.unshift(savedEstimation);
    localStorage.setItem("estimationHistory", JSON.stringify(existing.slice(0, 50)));

    setStep(4);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Cost Estimation</h1>
          <p className="text-muted-foreground mt-1">Estimate your healthcare costs in 3 simple steps.</p>
        </div>

        {step <= totalSteps && (
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "gradient-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Location</CardTitle>
                      <CardDescription>Select your city and locality</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showLocationDetector && (
                    <NearbyHospitals
                      citiesList={dynamicCities}
                      onLocationDetected={(cityName, stateName, loc) => {
                        const matchedCity = matchCityToList(cityName, stateName, dynamicCities);
                        if (matchedCity) {
                          setCity(matchedCity);
                          setLocality(loc);
                        } else {
                          // Dynamic insertion on the fly!
                          const value = cityName.toLowerCase().trim().replace(/[^a-z0-9]/g, "-");
                          const exists = dynamicCities.some(x => x.value === value);
                          if (!exists) {
                            const newCity = {
                              value,
                              label: cityName,
                              state: stateName || "India",
                              multiplier: 1.0
                            };
                            setDynamicCities(prev => [...prev, newCity]);
                          }
                          setCity(value);
                          setLocality(loc);
                        }
                      }}
                      onHospitalSelected={(type) => {
                        setHospitalType(type);
                      }}
                      onDismiss={() => setShowLocationDetector(false)}
                    />
                  )}
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent className="max-h-80">
                      {sortedStates.map((state) => (
                        <SelectGroup key={state}>
                          <SelectLabel className="sticky top-0 bg-popover/95 py-1.5 pl-4 text-xs font-bold text-muted-foreground border-b border-border/40 z-10 backdrop-blur-md">
                            {state}
                          </SelectLabel>
                          {cityGroups[state].map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Locality (optional) e.g. Gachibowli, Banjara Hills..."
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                  />
                  <Button variant="hero" className="w-full" onClick={() => setStep(2)} disabled={!city}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Hospital Type</CardTitle>
                      <CardDescription>Choose the type of healthcare facility</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hospitalTypes.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => setHospitalType(h.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        hospitalType === h.value
                          ? "border-primary bg-secondary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="font-medium text-foreground">{h.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        Cost multiplier: {h.multiplier}x
                      </span>
                    </button>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                    <Button variant="hero" onClick={() => setStep(3)} disabled={!hospitalType} className="flex-1">
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Condition / Treatment</CardTitle>
                      <CardDescription>Describe your problem or select a condition</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* AI Condition Analyzer */}
                  <ConditionAnalyzer
                    onConditionSelected={(val) => setCondition(val)}
                    initialDescription={initialDescription}
                    initialCondition={chatbotCondition}
                    cityMultiplier={dynamicCities.find((x) => x.value === city)?.multiplier || 1}
                    hospitalMultiplier={hospitalTypes.find((x) => x.value === hospitalType)?.multiplier || 1}
                  />

                  <div className="relative flex items-center gap-2 py-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">or select manually</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                    <SelectContent>
                      {conditions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                    <Button variant="hero" onClick={calculate} disabled={!condition} className="flex-1">
                      <Calculator className="h-4 w-4 mr-1" /> Calculate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <CostResults result={result} onReset={() => { setStep(1); setResult(null); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default CostEstimation;
