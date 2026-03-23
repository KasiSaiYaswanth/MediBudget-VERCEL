import Link from "next/link"

function PillIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#10B981"/>
      <rect x="16" y="10" width="14" height="12" rx="6" fill="#059669"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

export default function TermsPage() {
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
          <h1 className="text-4xl font-extrabold mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-10">Last updated: March 2026</p>
          <div className="space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using MediBudget, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">2. Description of Service</h2>
              <p>MediBudget provides healthcare financial planning tools including medical cost estimation, medicine scanning, government scheme eligibility checking, and insurance calculation. These are informational tools only and do not constitute medical or financial advice.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to notify us immediately of any unauthorized use of your account at medibudget@gmail.com.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">4. Accuracy of Information</h2>
              <p>Cost estimates provided by MediBudget are algorithmic approximations based on historical data. Actual costs may vary significantly. MediBudget makes no warranties about the accuracy, completeness, or reliability of any estimates.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">5. Prohibited Uses</h2>
              <p>You may not use MediBudget to: submit false information; reverse-engineer the platform; scrape data; harass other users; or use the service for any unlawful purpose.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">6. Limitation of Liability</h2>
              <p>MediBudget shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service or reliance on cost estimates provided. Maximum liability shall not exceed INR 1,000.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">7. Governing Law</h2>
              <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">8. Changes to Terms</h2>
              <p>We may update these Terms at any time. Continued use of MediBudget after changes constitutes acceptance of the new Terms.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">9. Contact</h2>
              <p>For questions about these Terms, contact us at <a href="mailto:medibudget@gmail.com" className="text-emerald-600 hover:underline">medibudget@gmail.com</a>.</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-sm text-gray-400">
        <p>© 2026 MediBudget. | <Link href="/privacy" className="hover:text-emerald-500">Privacy</Link> · <Link href="/disclaimer" className="hover:text-emerald-500">Disclaimer</Link></p>
      </footer>
    </div>
  )
}
