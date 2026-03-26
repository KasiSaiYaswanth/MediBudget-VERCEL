export const SYMTPOM_KB = {
  conditions: [
    {
      id: "tension_headache",
      name: "Tension Headache",
      symptoms: ["headache", "dull pain", "tightness", "scalp tenderness"],
      severity: "low",
      recommended_doctor: "General Physician",
      hospital_type: "Outpatient Clinic",
      next_steps: "Rest, hydrate, and try OTC pain relievers if needed. Monitor symptoms.",
    },
    {
      id: "migraine",
      name: "Migraine",
      symptoms: ["severe headache", "throbbing pain", "nausea", "sensitivity to light", "sensitivity to sound"],
      severity: "moderate",
      recommended_doctor: "Neurologist or General Physician",
      hospital_type: "Outpatient Clinic",
      next_steps: "Rest in a quiet, dark room. Consider using prescribed migraine medication.",
    },
    {
      id: "viral_fever",
      name: "Viral Infection",
      symptoms: ["fever", "body ache", "fatigue", "chills", "runny nose"],
      severity: "low",
      recommended_doctor: "General Physician",
      hospital_type: "Outpatient Clinic",
      next_steps: "Stay hydrated, rest, and use fever reducers if necessary. Seek medical care if fever persists beyond 3 days.",
    },
    {
      id: "gastroenteritis",
      name: "Gastroenteritis (Stomach Flu)",
      symptoms: ["stomach pain", "nausea", "vomiting", "diarrhea", "cramps"],
      severity: "moderate",
      recommended_doctor: "General Physician or Gastroenterologist",
      hospital_type: "Outpatient Clinic",
      next_steps: "Maintain hydration with ORS. Avoid solid foods initially. Consult a doctor if you cannot retain fluids.",
    },
    {
      id: "cardiac_event",
      name: "Possible Cardiac Event",
      symptoms: ["chest pain", "shortness of breath", "pain radiating to arm", "sweating", "dizziness"],
      severity: "emergency",
      recommended_doctor: "Cardiologist",
      hospital_type: "Emergency Room",
      next_steps: "Seek immediate emergency medical attention. Do not drive yourself to the hospital.",
    },
    {
      id: "stroke",
      name: "Possible Stroke",
      symptoms: ["sudden numbness", "weakness in face", "weakness in arm", "weakness in leg", "confusion", "trouble speaking", "loss of balance"],
      severity: "emergency",
      recommended_doctor: "Neurologist",
      hospital_type: "Emergency Room",
      next_steps: "Call emergency services immediately. Time is critical.",
    },
    {
      id: "asthma_exacerbation",
      name: "Asthma Exacerbation",
      symptoms: ["wheezing", "shortness of breath", "chest tightness", "coughing"],
      severity: "moderate", // Or high depending on severity
      recommended_doctor: "Pulmonologist or General Physician",
      hospital_type: "Outpatient Clinic or ER if severe",
      next_steps: "Use your rescue inhaler as prescribed. Seek immediate help if breathing does not improve.",
    },
    {
       id: "appendicitis",
       name: "Appendicitis",
       symptoms: ["stomach pain", "abdominal pain", "right lower quadrant pain", "fever", "nausea"],
       severity: "high",
       recommended_doctor: "General Surgeon",
       hospital_type: "Emergency Room / Hospital",
       next_steps: "Go to the nearest emergency room immediately for evaluation.",
    },
    {
       id: "dengue",
       name: "Possible Dengue/Malaria",
       symptoms: ["high fever", "severe headache", "pain behind eyes", "joint pain", "muscle pain", "rash"],
       severity: "moderate",
       recommended_doctor: "General Physician / Infectious Disease Specialist",
       hospital_type: "Outpatient Clinic / Hospital",
       next_steps: "Consult a doctor immediately, stay highly hydrated, do not take aspirin or ibuprofen.",
    }
  ]
};

export function getEmergencyKeywords() {
  return [
    "chest pain", "heart attack", "stroke", "paralysis", "breathing difficulty", 
    "can't breathe", "severe bleeding", "unconscious", "fainted", "seizure", 
    "sudden numbness", "slurred speech", "vomiting blood", "suicidal"
  ];
}
