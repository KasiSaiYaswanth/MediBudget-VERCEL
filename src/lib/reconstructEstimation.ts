import { conditions, cities, hospitalTypes } from "@/pages/CostEstimation";

export interface ReconstructedEstimation {
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
  insurance_applied?: boolean;
  insurance_coverage?: number;
}

export function reconstructEstimation(log: any): ReconstructedEstimation {
  // Find condition template
  const cond = conditions.find(
    (c) =>
      c.label.toLowerCase() === log.condition.toLowerCase() ||
      c.value.toLowerCase() === log.condition.toLowerCase()
  );

  // Parse city multiplier
  const cityLabel = log.city ? log.city.split(",")[0].trim() : "";
  const cityObj = cities.find(
    (c) =>
      c.label.toLowerCase() === cityLabel.toLowerCase() ||
      c.value.toLowerCase() === cityLabel.toLowerCase()
  );

  // Parse hospital multiplier
  const hospObj = hospitalTypes.find(
    (h) =>
      h.label.toLowerCase() === log.hospital_type?.toLowerCase() ||
      h.value.toLowerCase() === log.hospital_type?.toLowerCase()
  );

  const cm = cityObj ? cityObj.multiplier : 1.0;
  const hm = hospObj ? hospObj.multiplier : 1.0;

  if (cond) {
    const consultation = Math.round(cond.baseCost.consultation * cm * hm);
    const tests = Math.round(cond.baseCost.tests * cm * hm);
    const medicines = Math.round(cond.baseCost.medicines * cm * hm);
    const treatment = Math.round(cond.baseCost.treatment * cm * hm);
    const calculatedTotal = consultation + tests + medicines + treatment;
    
    // Use saved estimated_cost, or fall back to calculated total
    const total = log.estimated_cost ? Number(log.estimated_cost) : calculatedTotal;

    return {
      id: log.id,
      date: log.created_at || new Date().toISOString(),
      condition: cond.label,
      city: log.city || "Unknown City",
      hospitalType: log.hospital_type || "Private Hospital",
      consultation,
      tests,
      medicines,
      treatment,
      total,
      cityMultiplier: cm,
      hospitalMultiplier: hm,
      insurance_applied: log.insurance_applied,
      insurance_coverage: log.insurance_coverage
    };
  } else {
    // Fallback if condition not in list
    const total = log.estimated_cost ? Number(log.estimated_cost) : 0;
    return {
      id: log.id,
      date: log.created_at || new Date().toISOString(),
      condition: log.condition,
      city: log.city || "Unknown City",
      hospitalType: log.hospital_type || "Private Hospital",
      consultation: 0,
      tests: 0,
      medicines: 0,
      treatment: 0,
      total,
      cityMultiplier: cm,
      hospitalMultiplier: hm,
      insurance_applied: log.insurance_applied,
      insurance_coverage: log.insurance_coverage
    };
  }
}
