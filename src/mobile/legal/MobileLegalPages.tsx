import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ShieldAlert, 
  ChevronDown, 
  Mail, 
  MailCheck,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ==========================================
// PREMIUM FULL-PAGE MOBILE LAYOUT WRAPPER
// ==========================================
export const MobileSettingsPageLayout: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ type: "spring", damping: 25, stiffness: 280 }}
      className="min-h-screen bg-[#070e11] text-foreground flex flex-col safe-top pb-10"
    >
      {/* Sticky Premium Android Top Bar */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#070e11]/90 backdrop-blur-md border-b border-border/40 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/settings")}
          className="h-9 w-9 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-black tracking-tight text-foreground">{title}</h1>
        </div>
      </header>

      {/* Scrollable page body */}
      <main className="flex-1 px-4 py-5 overflow-y-auto scroll-bounce select-none">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>
    </motion.div>
  );
};

// ==========================================
// 1. ABOUT MEDIBUDGET FULL SCREEN
// ==========================================
export const MobileAboutPage: React.FC = () => {
  return (
    <MobileSettingsPageLayout title="About MediBudget">
      <div className="space-y-5 text-xs leading-relaxed text-muted-foreground">
        <p className="text-foreground font-black text-sm">Your Trusted Healthcare Cost Auditor</p>
        <p>
          MediBudget is an advanced mobile health assistant designed to make medical costs transparent, predictable, and fair for every citizen in India.
        </p>
        <p>
          Whether you are scanning a paper medical bill, analyzing symptoms with our AI assistant, calculating out-of-pocket insurance co-pays, or exploring state-sponsored healthcare schemes, MediBudget puts financial power back in your hands.
        </p>
        <div className="bg-card border border-border/40 p-5 rounded-2xl space-y-3.5 shadow-sm">
          <p className="font-black text-foreground text-[10px] uppercase tracking-wider text-teal-400">Core Features Included</p>
          <ul className="list-disc pl-5 space-y-2 text-[11px]">
            <li>Generic Medicine OCR & Alternative Suggestion</li>
            <li>Interactive Regional Procedure Cost Estimator</li>
            <li>Dynamic Health Insurance Co-pay Tracker</li>
            <li>National & State Health Scheme Evaluator</li>
            <li>Offline-ready Cache & Secure local-first audits</li>
          </ul>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/60 font-semibold pt-6">
          MediBudget Mobile &bull; Designed and engineered in India.
        </p>
      </div>
    </MobileSettingsPageLayout>
  );
};

// ==========================================
// 2. PRIVACY POLICY FULL SCREEN
// ==========================================
export const MobilePrivacyPage: React.FC = () => {
  return (
    <MobileSettingsPageLayout title="Privacy Policy">
      <div className="space-y-5 text-xs leading-relaxed text-muted-foreground">
        <p className="text-foreground font-black text-sm">Privacy First by Design</p>
        <p>
          At MediBudget, we believe that your health history and financial audits are deeply private. That's why our application enforces a strict data minimization protocol.
        </p>
        <div className="space-y-4 pt-2">
          <div className="bg-card border border-border/40 p-4.5 rounded-2xl shadow-sm">
            <p className="font-black text-foreground text-xs mb-1.5">🛡️ 1. Local Sandboxing</p>
            <p className="text-[11px] leading-relaxed">
              Your symptom prediction logs and medicine OCR scanning invoices are cached locally inside secure app storage. We do not store or read your prescription scans on cloud databases.
            </p>
          </div>
          
          <div className="bg-card border border-border/40 p-4.5 rounded-2xl shadow-sm">
            <p className="font-black text-foreground text-xs mb-1.5">🌐 2. Data Transmission</p>
            <p className="text-[11px] leading-relaxed">
              Any diagnostic predictions or cost lookups query optimized APIs through anonymous endpoints. Your personal identity is never tied to cost calculation requests.
            </p>
          </div>
          
          <div className="bg-card border border-border/40 p-4.5 rounded-2xl shadow-sm">
            <p className="font-black text-foreground text-xs mb-1.5">📧 3. Support Inquiries</p>
            <p className="text-[11px] leading-relaxed">
              If you reach out to our team at <a href="mailto:medibudget@gmail.com" className="text-primary font-bold hover:underline">medibudget@gmail.com</a>, your correspondence history is encrypted and only used to answer technical support inquiries.
            </p>
          </div>
        </div>
      </div>
    </MobileSettingsPageLayout>
  );
};

// ==========================================
// 3. TERMS OF SERVICE FULL SCREEN
// ==========================================
export const MobileTermsPage: React.FC = () => {
  return (
    <MobileSettingsPageLayout title="Terms of Service">
      <div className="space-y-5 text-xs leading-relaxed text-muted-foreground">
        <p className="text-foreground font-black text-sm">Agreement of Fair Use</p>
        <p>
          By creating an account on MediBudget Mobile, you agree to comply with our fair-use standards and guidelines.
        </p>
        <div className="space-y-4 pt-2">
          <div className="bg-card border border-border/40 p-4.5 rounded-2xl shadow-sm">
            <p className="font-black text-foreground text-xs mb-1.5">⚖️ 1. Educational Scope</p>
            <p className="text-[11px] leading-relaxed">
              All costs, scheme checklists, and medicine generic recommendations generated by MediBudget are strictly for reference and educational use. We are not a medical billing service nor an insurance underwriting agency.
            </p>
          </div>
          
          <div className="bg-card border border-border/40 p-4.5 rounded-2xl shadow-sm">
            <p className="font-black text-foreground text-xs mb-1.5">🚫 2. Acceptable Actions</p>
            <p className="text-[11px] leading-relaxed">
              You may not scrape our cost catalogs, reverse-engineer the OCR processing flows, or send automated spam requests to our systems.
            </p>
          </div>
        </div>
      </div>
    </MobileSettingsPageLayout>
  );
};

// ==========================================
// 4. MEDICAL DISCLAIMER FULL SCREEN
// ==========================================
export const MobileDisclaimerPage: React.FC = () => {
  return (
    <MobileSettingsPageLayout title="Medical Disclaimer">
      <div className="space-y-5 text-xs leading-relaxed text-muted-foreground">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-3 items-start">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-[10px] uppercase tracking-wider">CRITICAL NOTICE</p>
            <p className="text-[11px] leading-relaxed font-semibold mt-1">
              MediBudget is NOT a medical advisory application. Its contents do not substitute professional clinical advice.
            </p>
          </div>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-2xl space-y-3.5 shadow-sm">
          <p className="text-foreground font-black text-xs">1. No Medical Treatment Advice</p>
          <p className="text-[11px] leading-relaxed">
            The symptom checker and AI consultation guides are diagnostic aggregators designed to suggest potential categories for standard cost estimation ONLY. They do not constitute actual treatment prescriptions or professional medical diagnosis.
          </p>
        </div>
        <div className="bg-card border border-border/40 p-5 rounded-2xl space-y-3.5 shadow-sm">
          <p className="text-foreground font-black text-xs">2. Always Consult a Practitioner</p>
          <p className="text-[11px] leading-relaxed">
            If you are experiencing severe symptoms, chest pain, or need urgent clinical help, immediately visit the nearest emergency medical facility or consult a certified licensed physician.
          </p>
        </div>
      </div>
    </MobileSettingsPageLayout>
  );
};

// ==========================================
// 5. FAQ FULL SCREEN ACCORDIONS
// ==========================================
export const MobileFAQPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      q: "What is MediBudget and is it free?",
      a: "MediBudget is a completely free consumer cost-auditing tool. Our mission is to eliminate surprise bills by giving users transparency over Indian healthcare charges, procedures, and alternatives."
    },
    {
      q: "How accurate are regional procedure costs?",
      a: "Procedure costs are compiled using historical treatment rates, adjusted in real time based on your selected City Tier (Tiers 1/2/3) and hospital setup (Private/Corporate/Govt) to offer a reliable, real-world baseline."
    },
    {
      q: "How does the generic medicine alternative scanner work?",
      a: "By uploading a clear image of your prescription or medicine box, our OCR engine extracts active salt formulas and searches our database to suggest equivalent generic medicines at a fraction of the cost."
    },
    {
      q: "Does the app support offline mode?",
      a: "Yes! If you check a region's procedure cost or search for generic medicines once, the metrics are cached locally. You can access essential calculator utilities and offline indexes even when traveling without signal."
    }
  ];

  return (
    <MobileSettingsPageLayout title="Frequently Asked Questions">
      <div className="space-y-3 max-w-full">
        {faqs.map((faq, idx) => {
          const isOpen = activeIndex === idx;
          return (
            <div key={idx} className="rounded-2xl border border-border/40 bg-card overflow-hidden transition-all duration-300 shadow-sm">
              <button
                onClick={() => setActiveIndex(isOpen ? null : idx)}
                className="w-full flex justify-between items-center p-4 text-xs font-bold text-foreground text-left active:bg-secondary/40 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-4 pb-4 pt-1 text-[11px] text-muted-foreground leading-relaxed border-t border-border/20">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </MobileSettingsPageLayout>
  );
};

// ==========================================
// 6. CONTACT SUPPORT FULL SCREEN
// ==========================================
export const MobileSupportPage: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const navigate = useNavigate();

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Prefill mailto with details of the support feedback form
    const subject = encodeURIComponent("MediBudget Support Request - Technical Support");
    const body = encodeURIComponent(
      `Hello MediBudget Support,\n\nI need assistance regarding the application. Here is my query:\n\n"${message}"\n\n---\nPlatform: Android Mobile App\nVersion: 1.2.0 (Build 41)`
    );
    
    // Launch default email client
    window.location.href = `mailto:medibudget@gmail.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
    setTimeout(() => {
      setMessage("");
      setSubmitted(false);
      navigate("/settings");
    }, 2000);
  };

  const emailSubject = encodeURIComponent("MediBudget Support Request - Technical Support");
  const emailBody = encodeURIComponent(
    `Hello MediBudget Support,\n\nI am using the MediBudget mobile application and would like to request technical support.\n\n---\nPlatform: Android Mobile App\nVersion: 1.2.0 (Build 41)`
  );

  return (
    <MobileSettingsPageLayout title="Contact Support">
      {submitted ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="py-12 flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-pulse">
            <MailCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">Email Client Opened!</p>
            <p className="text-xs text-muted-foreground mt-1 px-6 leading-relaxed">
              We have launched your system's email application with your prefilled query. Please tap send in your email app.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-foreground">Technical Support & General Inquiries</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Have questions, found a billing mismatch, or need technical assistance? Reach our dedicated support team instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {/* Email Support directly */}
            <a
              href={`mailto:medibudget@gmail.com?subject=${emailSubject}&body=${emailBody}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-card border border-border/40 text-xs text-foreground active-scale hover:bg-secondary/20 transition-colors shadow-sm"
            >
              <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">Email Support Directly</p>
                <p className="text-[11px] text-teal-400 font-bold">medibudget@gmail.com</p>
              </div>
            </a>

            {/* Premium WhatsApp Support option */}
            <a
              href="https://wa.me/919381987307?text=Hello%20MediBudget%20Support%2C%20I%20need%20assistance%20regarding%20the%20application."
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-card border border-green-500/20 text-xs text-foreground active-scale hover:bg-green-500/5 transition-colors shadow-sm"
            >
              <div className="h-9 w-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">Chat on WhatsApp</p>
                <p className="text-[11px] text-green-400 font-bold">+91 93819 87307</p>
              </div>
            </a>
          </div>

          <form onSubmit={handleFeedback} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider px-1">Quick Feedback Note</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help optimize your MediBudget experience today?"
                className="w-full rounded-2xl border border-border/40 bg-card p-4 text-xs text-foreground focus:outline-none focus:border-teal-400 placeholder:text-muted-foreground/60 resize-none shadow-sm"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-xs font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground">
              Send Email Query
            </Button>
          </form>
        </div>
      )}
    </MobileSettingsPageLayout>
  );
};
