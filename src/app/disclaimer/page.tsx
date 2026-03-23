import Link from "next/link"
import { AlertTriangle } from "lucide-react"

function PillIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#10B981"/>
      <rect x="16" y="10" width="14" height="12" rx="6" fill="#059669"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <PillIcon /><span>MediBudget</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-4xl font-extrabold mb-2">Medical Disclaimer</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-4 mb-10">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <strong className="block mb-1">Important Notice:</strong>
              MediBudget is a financial planning tool and does <strong>not</strong> provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified healthcare professional.
            </div>
          </div>

          <div className="space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Not Medical Advice</h2>
              <p>The information provided on MediBudget, including cost estimates, medicine information, and scheme eligibility, is for general informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Never disregard professional medical advice or delay in seeking it because of something you have read on MediBudget.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Cost Estimates Are Approximations</h2>
              <p>All cost estimates provided by MediBudget are algorithmic approximations based on historical, publicly available data and user-reported information. Actual hospital bills may vary significantly based on individual patient conditions, specific treatment requirements, hospital policies, insurance coverage, and other factors outside our control.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Medicine Information</h2>
              <p>Medicine information provided through our scanner feature, including generic alternatives, pricing, and uses, is based on AI analysis and publicly available pharmaceutical data. Always verify medicine information with a registered pharmacist or doctor before making any medication decisions.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Government Scheme Eligibility</h2>
              <p>Scheme eligibility determinations are based on general eligibility criteria and the information you provide. Official eligibility can only be confirmed by the respective government authorities. MediBudget's checks are indicative only.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Emergency Situations</h2>
              <p>If you are experiencing a medical emergency, please immediately call <strong>112</strong> (India's national emergency number) or proceed to the nearest emergency room. Do not use MediBudget in an emergency situation.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">No Doctor-Patient Relationship</h2>
              <p>Use of MediBudget does not create a doctor-patient or any other health provider-patient relationship. MediBudget is not a licensed medical provider.</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-sm text-gray-400">
        <p>© 2026 MediBudget. | <Link href="/privacy" className="hover:text-emerald-500">Privacy</Link> · <Link href="/terms" className="hover:text-emerald-500">Terms</Link></p>
      </footer>
    </div>
  )
}
