// Comprehensive Indian medicine database — works offline without Supabase DB dependency
export interface MedicineInfo {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  composition: string;
  uses: string[];
  side_effects: string[];
  dosage: string;
  warnings: string[];
  price_range: string;
  prescription_required: boolean;
  manufacturer?: string;
  alternatives?: string[];
}

const MEDICINES: MedicineInfo[] = [
  // Analgesics / Pain Relief
  { id:"1", name:"Crocin 500mg", generic_name:"Paracetamol", category:"Analgesic", composition:"Paracetamol 500mg", uses:["Fever","Headache","Body pain","Cold"], side_effects:["Nausea","Liver damage (overdose)"], dosage:"1 tablet every 4-6 hours. Max 4g/day.", warnings:["Do not exceed recommended dose","Avoid alcohol","Caution in liver disease"], price_range:"₹12 – ₹25", prescription_required:false, manufacturer:"GSK", alternatives:["Dolo 650","Calpol","Paracip"] },
  { id:"2", name:"Dolo 650", generic_name:"Paracetamol", category:"Analgesic", composition:"Paracetamol 650mg", uses:["Fever","Headache","Body pain","Dengue fever"], side_effects:["Nausea","Liver damage (overdose)"], dosage:"1 tablet every 4-6 hours. Max 3 tablets/day.", warnings:["Avoid in severe liver disease","Do not exceed dose"], price_range:"₹30 – ₹45", prescription_required:false, manufacturer:"Micro Labs", alternatives:["Crocin 500","Paracip 500","Calpol"] },
  { id:"3", name:"Combiflam", generic_name:"Ibuprofen + Paracetamol", category:"Analgesic", composition:"Ibuprofen 400mg + Paracetamol 325mg", uses:["Pain","Fever","Dental pain","Arthritis","Muscle pain"], side_effects:["Stomach upset","Nausea","Dizziness"], dosage:"1 tablet 3 times a day after food.", warnings:["Take after food","Avoid in kidney disease","Avoid in peptic ulcer"], price_range:"₹30 – ₹55", prescription_required:false, manufacturer:"Sanofi", alternatives:["Ibugesic Plus","Brufen","Hifenac P"] },
  { id:"4", name:"Volini Gel", generic_name:"Diclofenac Diethylammonium", category:"Analgesic (Topical)", composition:"Diclofenac Diethylammonium 1.16% w/w", uses:["Joint pain","Sprains","Muscle pain","Sports injuries"], side_effects:["Skin irritation","Redness at application site"], dosage:"Apply 3-4 times daily to affected area.", warnings:["Do not apply on open wounds","Do not use in children under 14"], price_range:"₹80 – ₹150", prescription_required:false, alternatives:["Moov","Omnigel","Flexon Gel"] },
  { id:"5", name:"Disprin", generic_name:"Aspirin", category:"Analgesic / Antiplatelet", composition:"Aspirin 350mg", uses:["Headache","Fever","Pain relief","Heart attack prevention"], side_effects:["Stomach irritation","Bleeding risk","Ringing in ears"], dosage:"1-2 tablets every 4-6 hours.", warnings:["Do not give to children below 12","Avoid in peptic ulcer","Caution in asthma"], price_range:"₹10 – ₹20", prescription_required:false, alternatives:["Ecosprin","Aspirin 75"] },
  // Antibiotics
  { id:"6", name:"Amoxicillin 500mg", generic_name:"Amoxicillin", category:"Antibiotic", composition:"Amoxicillin 500mg", uses:["Bacterial infections","Throat infection","Ear infection","Pneumonia","UTI"], side_effects:["Diarrhea","Nausea","Rash","Allergic reaction"], dosage:"1 capsule 3 times daily for 5-7 days.", warnings:["Complete full course","Inform if penicillin allergic","Avoid if allergic to penicillin"], price_range:"₹50 – ₹120", prescription_required:true, manufacturer:"Various", alternatives:["Mox 500","Amox 500","Novamox"] },
  { id:"7", name:"Augmentin 625", generic_name:"Amoxicillin + Clavulanic Acid", category:"Antibiotic", composition:"Amoxicillin 500mg + Clavulanic Acid 125mg", uses:["Severe bacterial infections","Sinusitis","Skin infections","Respiratory infections"], side_effects:["Diarrhea","Nausea","Vomiting","Liver enzyme changes"], dosage:"1 tablet twice daily after food for 5-7 days.", warnings:["Take with food","Complete full course","Penicillin allergy risk"], price_range:"₹180 – ₹350", prescription_required:true, manufacturer:"GSK" },
  { id:"8", name:"Azithromycin 500mg", generic_name:"Azithromycin", category:"Antibiotic", composition:"Azithromycin 500mg", uses:["Respiratory infections","Typhoid","STIs","Skin infections"], side_effects:["Nausea","Diarrhea","Stomach pain","Headache"], dosage:"1 tablet once daily for 3-5 days.", warnings:["Avoid antacids 2h before/after","QT prolongation risk","Avoid in liver disease"], price_range:"₹60 – ₹150", prescription_required:true, alternatives:["Azithral 500","Zithromax","Azee 500"] },
  { id:"9", name:"Ciprofloxacin 500mg", generic_name:"Ciprofloxacin", category:"Antibiotic", composition:"Ciprofloxacin 500mg", uses:["UTI","Typhoid","Diarrhea","Respiratory infections"], side_effects:["Nausea","Dizziness","Tendon rupture","Photosensitivity"], dosage:"1 tablet twice daily for 5-7 days.", warnings:["Avoid sun exposure","Do not take with antacids","Not for children"], price_range:"₹40 – ₹100", prescription_required:true },
  { id:"10", name:"Metronidazole 400mg", generic_name:"Metronidazole", category:"Antibiotic / Antiprotozoal", composition:"Metronidazole 400mg", uses:["Amoebiasis","Giardia","Bacterial infections","Dental infections"], side_effects:["Metallic taste","Nausea","Headache","Dizziness"], dosage:"1-2 tablets 3 times daily after food for 5-7 days.", warnings:["Avoid alcohol completely","May darken urine"], price_range:"₹20 – ₹60", prescription_required:true },
  // Antacids / GI
  { id:"11", name:"Pantoprazole 40mg", generic_name:"Pantoprazole", category:"Antacid / PPI", composition:"Pantoprazole 40mg", uses:["Acidity","GERD","Peptic ulcer","Stomach pain"], side_effects:["Headache","Diarrhea","Nausea","Vitamin B12 deficiency (long term)"], dosage:"1 tablet before breakfast daily.", warnings:["Long-term use causes B12 deficiency","Regular monitoring needed"], price_range:"₹30 – ₹80", prescription_required:false, alternatives:["Pan 40","Pantodac","Nexpro"] },
  { id:"12", name:"Omeprazole 20mg", generic_name:"Omeprazole", category:"Antacid / PPI", composition:"Omeprazole 20mg", uses:["Acidity","Ulcers","GERD","H.pylori treatment"], side_effects:["Headache","Diarrhea","Stomach pain","Reduced magnesium"], dosage:"1 capsule 30 min before breakfast.", warnings:["Avoid long-term use without medical advice"], price_range:"₹25 – ₹70", prescription_required:false },
  { id:"13", name:"Gelusil", generic_name:"Aluminium Hydroxide + Magnesium Hydroxide + Simethicone", category:"Antacid", composition:"Aluminium Hydroxide 250mg + Magnesium Hydroxide 250mg + Simethicone 25mg", uses:["Acidity","Heartburn","Gas","Bloating"], side_effects:["Constipation","Diarrhea"], dosage:"1-2 tablets after meals and at bedtime.", warnings:["Do not take within 2h of other medications"], price_range:"₹30 – ₹60", prescription_required:false },
  { id:"14", name:"ORS Sachet", generic_name:"Oral Rehydration Salts", category:"Rehydration", composition:"Sodium Chloride + Potassium Chloride + Sodium Citrate + Glucose", uses:["Diarrhea","Dehydration","Vomiting","Cholera"], side_effects:["Hypernatremia if overused"], dosage:"1 sachet dissolved in 1 litre of clean water. Drink slowly.", warnings:["Use clean water only","Seek medical help if not improving in 24h"], price_range:"₹5 – ₹20", prescription_required:false },
  // Antihistamines
  { id:"15", name:"Cetirizine 10mg", generic_name:"Cetirizine", category:"Antihistamine", composition:"Cetirizine Hydrochloride 10mg", uses:["Allergies","Hay fever","Itching","Urticaria","Cold symptoms"], side_effects:["Drowsiness","Dry mouth","Dizziness"], dosage:"1 tablet at bedtime (causes drowsiness).", warnings:["Avoid driving","Avoid alcohol","Caution in kidney disease"], price_range:"₹15 – ₹40", prescription_required:false, alternatives:["Cetzine","Zyrtec","Alerid"] },
  { id:"16", name:"Loratadine 10mg", generic_name:"Loratadine", category:"Antihistamine", composition:"Loratadine 10mg", uses:["Allergic rhinitis","Urticaria","Hay fever"], side_effects:["Headache","Dry mouth","Mild drowsiness"], dosage:"1 tablet once daily.", warnings:["Less sedating than older antihistamines"], price_range:"₹30 – ₹70", prescription_required:false },
  // Diabetes
  { id:"17", name:"Metformin 500mg", generic_name:"Metformin", category:"Antidiabetic", composition:"Metformin Hydrochloride 500mg", uses:["Type 2 Diabetes","Insulin resistance","PCOS"], side_effects:["Nausea","Diarrhea","Stomach upset","Metallic taste"], dosage:"1 tablet twice daily with meals.", warnings:["Monitor kidney function","Hold before contrast dye procedures","Risk of lactic acidosis"], price_range:"₹20 – ₹60", prescription_required:true },
  { id:"18", name:"Glimepiride 1mg", generic_name:"Glimepiride", category:"Antidiabetic", composition:"Glimepiride 1mg", uses:["Type 2 Diabetes"], side_effects:["Hypoglycemia","Weight gain","Nausea"], dosage:"1 tablet before breakfast.", warnings:["Check blood sugar regularly","Avoid alcohol","Risk of hypoglycemia"], price_range:"₹30 – ₹80", prescription_required:true },
  // Cardiac
  { id:"19", name:"Ecosprin 75mg", generic_name:"Aspirin", category:"Antiplatelet", composition:"Aspirin 75mg (EC coated)", uses:["Heart attack prevention","Blood clot prevention","Post-cardiac surgery"], side_effects:["GI bleeding","Stomach irritation"], dosage:"1 tablet daily after food.", warnings:["Do not crush EC tablets","Bleeding risk","Avoid NSAIDs"], price_range:"₹15 – ₹35", prescription_required:true },
  { id:"20", name:"Atorvastatin 10mg", generic_name:"Atorvastatin", category:"Statin", composition:"Atorvastatin 10mg", uses:["High cholesterol","Cardiovascular risk reduction"], side_effects:["Muscle pain","Liver damage","Nausea"], dosage:"1 tablet at night.", warnings:["Report muscle pain","Monitor liver function","Avoid grapefruit juice"], price_range:"₹40 – ₹150", prescription_required:true },
  { id:"21", name:"Amlodipine 5mg", generic_name:"Amlodipine", category:"Calcium Channel Blocker", composition:"Amlodipine Besylate 5mg", uses:["Hypertension","Angina"], side_effects:["Ankle swelling","Flushing","Headache","Dizziness"], dosage:"1 tablet once daily.", warnings:["Do not stop abruptly","Monitor blood pressure"], price_range:"₹30 – ₹80", prescription_required:true },
  { id:"22", name:"Metoprolol 25mg", generic_name:"Metoprolol Succinate", category:"Beta Blocker", composition:"Metoprolol Succinate 25mg", uses:["Hypertension","Heart failure","Angina","Arrhythmia"], side_effects:["Bradycardia","Fatigue","Dizziness","Cold extremities"], dosage:"1 tablet once daily.", warnings:["Do not stop abruptly","Monitor pulse","Caution in asthma"], price_range:"₹30 – ₹90", prescription_required:true },
  // Thyroid
  { id:"23", name:"Eltroxin 50mcg", generic_name:"Levothyroxine Sodium", category:"Thyroid Hormone", composition:"Levothyroxine Sodium 50mcg", uses:["Hypothyroidism","Goiter","Post-thyroid surgery"], side_effects:["Palpitations","Tremors","Weight loss if overdosed"], dosage:"1 tablet daily on empty stomach 30 min before breakfast.", warnings:["Take on empty stomach","Do not skip dose","Antacids reduce absorption"], price_range:"₹25 – ₹60", prescription_required:true },
  // Vitamins / Supplements
  { id:"24", name:"Shelcal 500", generic_name:"Calcium + Vitamin D3", category:"Supplement", composition:"Calcium Carbonate 1250mg (eq 500mg Calcium) + Vitamin D3 250IU", uses:["Calcium deficiency","Osteoporosis","Post-fracture","Pregnancy"], side_effects:["Constipation","Gas","Kidney stones (high dose)"], dosage:"1 tablet twice daily after meals.", warnings:["Do not exceed 2g calcium daily","Adequate hydration needed"], price_range:"₹60 – ₹120", prescription_required:false },
  { id:"25", name:"Becosules", generic_name:"B-Complex Vitamins", category:"Supplement", composition:"Thiamine + Riboflavin + Niacinamide + Pyridoxine + Cyanocobalamin + Folic Acid + Vitamin C", uses:["Vitamin B deficiency","Weakness","Hair loss","Nerve health"], side_effects:["Yellow urine (harmless)","Nausea"], dosage:"1 capsule daily after food.", warnings:["Urine may turn yellow - normal"], price_range:"₹50 – ₹100", prescription_required:false },
  // Respiratory
  { id:"26", name:"Asthalin Inhaler", generic_name:"Salbutamol", category:"Bronchodilator", composition:"Salbutamol 100mcg per actuation", uses:["Asthma","COPD","Wheezing","Breathlessness"], side_effects:["Palpitations","Tremors","Headache","Low potassium"], dosage:"1-2 puffs as needed. Shake before use.", warnings:["Do not exceed 8 puffs/day","Inform doctor if using more than 3x/week"], price_range:"₹100 – ₹200", prescription_required:true },
  { id:"27", name:"Montair LC", generic_name:"Montelukast + Levocetirizine", category:"Antiasthmatic / Antihistamine", composition:"Montelukast 10mg + Levocetirizine 5mg", uses:["Allergic rhinitis","Asthma","Urticaria"], side_effects:["Drowsiness","Headache","Dry mouth"], dosage:"1 tablet at night.", warnings:["May cause mood changes","Avoid driving"], price_range:"₹80 – ₹200", prescription_required:true },
  // Skin
  { id:"28", name:"Betadine", generic_name:"Povidone Iodine", category:"Antiseptic", composition:"Povidone Iodine 10% w/v", uses:["Wound cleaning","Skin infection","Pre-surgical scrub"], side_effects:["Skin irritation","Iodine allergy"], dosage:"Apply to clean wound as needed.", warnings:["For external use only","Do not use in thyroid patients long term"], price_range:"₹30 – ₹80", prescription_required:false },
  { id:"29", name:"Soframycin Cream", generic_name:"Framycetin", category:"Antibiotic (Topical)", composition:"Framycetin Sulphate 1% w/w", uses:["Minor skin infections","Burns","Cuts","Wounds"], side_effects:["Skin sensitization","Hearing damage (large area/long term)"], dosage:"Apply thinly 2-3 times daily.", warnings:["For external use only","Avoid on large areas"], price_range:"₹40 – ₹90", prescription_required:false },
  // Nerve Pain
  { id:"30", name:"Pregabalin 75mg", generic_name:"Pregabalin", category:"Neuropathic Pain", composition:"Pregabalin 75mg", uses:["Nerve pain","Diabetic neuropathy","Fibromyalgia","Epilepsy","Anxiety"], side_effects:["Dizziness","Drowsiness","Weight gain","Blurred vision"], dosage:"1 capsule twice daily.", warnings:["Do not stop abruptly","Causes drowsiness","Addiction potential"], price_range:"₹80 – ₹200", prescription_required:true },
  // Cough / Cold
  { id:"31", name:"Benadryl Cough Syrup", generic_name:"Diphenhydramine + Ammonium Chloride", category:"Cough Suppressant", composition:"Diphenhydramine 14.08mg + Ammonium Chloride 138mg + Sodium Citrate 57.03mg per 5ml", uses:["Cough","Cold","Allergic cough"], side_effects:["Drowsiness","Dry mouth","Dizziness"], dosage:"10ml 3-4 times daily.", warnings:["Causes drowsiness","Avoid driving","Avoid alcohol"], price_range:"₹50 – ₹100", prescription_required:false },
  { id:"32", name:"Mucinac 600mg", generic_name:"N-Acetylcysteine", category:"Mucolytic", composition:"N-Acetylcysteine 600mg", uses:["Chest congestion","COPD","Paracetamol overdose antidote"], side_effects:["Nausea","Vomiting","Rash"], dosage:"1 effervescent tablet dissolved in water, once daily.", warnings:["Avoid in asthma","Contains sodium"], price_range:"₹80 – ₹150", prescription_required:false },
  // Anxiety / Sleep
  { id:"33", name:"Alprazolam 0.25mg", generic_name:"Alprazolam", category:"Anxiolytic / Benzodiazepine", composition:"Alprazolam 0.25mg", uses:["Anxiety","Panic disorder","Insomnia"], side_effects:["Drowsiness","Addiction","Cognitive impairment","Withdrawal"], dosage:"As prescribed by doctor.", warnings:["Schedule H — requires prescription","High addiction potential","Do not stop abruptly","Avoid alcohol"], price_range:"₹15 – ₹50", prescription_required:true },
  // Anti-infective
  { id:"34", name:"Fluconazole 150mg", generic_name:"Fluconazole", category:"Antifungal", composition:"Fluconazole 150mg", uses:["Vaginal candidiasis","Oral thrush","Fungal skin infection"], side_effects:["Nausea","Headache","Stomach pain","Liver damage"], dosage:"Single dose for vaginal candidiasis. As prescribed for other infections.", warnings:["Liver function monitoring","Drug interactions possible","Avoid in pregnancy"], price_range:"₹30 – ₹80", prescription_required:true},
  // Insulin
  { id:"35", name:"Human Mixtard 30/70", generic_name:"Biphasic Isophane Insulin", category:"Insulin (Antidiabetic)", composition:"Soluble Human Insulin 30% + Isophane Insulin 70%", uses:["Type 1 Diabetes","Type 2 Diabetes (insulin requiring)"], side_effects:["Hypoglycemia","Injection site reactions","Weight gain"], dosage:"As prescribed based on blood glucose monitoring.", warnings:["Requires blood glucose monitoring","Never share needles","Refrigerate"], price_range:"₹150 – ₹400", prescription_required:true },
];

/** Fuzzy search across all medicine fields */
export async function searchMedicines(query: string): Promise<MedicineInfo[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // First try exact/partial name match
  const exact = MEDICINES.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.generic_name.toLowerCase().includes(q) ||
    m.composition.toLowerCase().includes(q)
  );
  if (exact.length > 0) return exact;

  // Then try category or use case match
  return MEDICINES.filter(m =>
    m.category.toLowerCase().includes(q) ||
    m.uses.some(u => u.toLowerCase().includes(q)) ||
    (m.manufacturer || '').toLowerCase().includes(q)
  );
}

export async function getCategories(): Promise<string[]> {
  const unique = [...new Set(MEDICINES.map(m => m.category))];
  return unique.sort();
}

export async function getMedicinesByCategory(category: string): Promise<MedicineInfo[]> {
  if (!category) return MEDICINES;
  return MEDICINES.filter(m => m.category === category);
}

export async function getMedicineById(id: string): Promise<MedicineInfo | null> {
  return MEDICINES.find(m => m.id === id) || null;
}
