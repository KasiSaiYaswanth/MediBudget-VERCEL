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

export const metadata = {
  title: "Privacy Policy | MediBudget",
}

export default function PrivacyPage() {
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
        <div className="container mx-auto px-4 md:px-6 max-w-3xl prose prose-gray dark:prose-invert">
          <h1 className="text-4xl font-extrabold mb-2 not-prose">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8 not-prose">Last updated: March 2026</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3 text-emerald-600">1. Information We Collect</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                We collect information you provide directly to us, such as when you create an account (email address, name), use our services (medical condition queries, city, cost estimates), or contact us for support. We also automatically collect usage data including pages visited, features used, and device information.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-emerald-600">2. How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                We use your information to: provide and improve our services; save your estimation history; send service-related communications; personalize your experience; and comply with legal obligations. We do <strong>not</strong> use your health-related query data for advertising or sell it to third parties.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-emerald-600">3. Data Security</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                All data is encrypted in transit using TLS and at rest using AES-256 encryption via Supabase infrastructure. We implement industry-standard security practices including regular security audits and access controls.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-emerald-600">4. Cookies</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                We use essential cookies for authentication and session management. We use analytics cookies (anonymized) to understand how users interact with our platform. You can disable cookies in your browser, but this may affect functionality.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-emerald-600">5. Third-Party Services</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                We use Supabase for database and authentication, Google OAuth for social login, and Google Gemini AI for medicine scanning features. Each of these services has their own privacy policies which we encourage you to review.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-emerald-600">6. Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                You have the right to: access your personal data; correct inaccurate data; request deletion of your account and data; export your data; and withdraw consent at any time. Contact us at <a href="mailto:medibudget@gmail.com" className="text-emerald-600 hover:underline">medibudget@gmail.com</a> to exercise these rights.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-emerald-600">7. Contact</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                For privacy concerns, contact us at <a href="mailto:medibudget@gmail.com" className="text-emerald-600 hover:underline">medibudget@gmail.com</a> or via WhatsApp at +91 93819 87307.
              </p>
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-sm text-gray-400">
        <p>© 2026 MediBudget. | <Link href="/terms" className="hover:text-emerald-500">Terms</Link> · <Link href="/disclaimer" className="hover:text-emerald-500">Disclaimer</Link></p>
      </footer>
    </div>
  )
}
