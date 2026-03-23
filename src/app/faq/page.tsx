"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"

function PillIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#10B981"/>
      <rect x="16" y="10" width="14" height="12" rx="6" fill="#059669"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

const faqs = [
  {
    category: "General",
    items: [
      { q: "What is MediBudget?", a: "MediBudget is a healthcare financial planning platform that helps you estimate medical treatment costs, scan medicine packaging for cheaper alternatives, check government scheme eligibility, and calculate insurance coverage — all before you visit a hospital." },
      { q: "Is MediBudget free to use?", a: "Yes! MediBudget is completely free. Simply sign up with your email or Google account and start using all features immediately." },
      { q: "Does MediBudget provide medical advice?", a: "No. MediBudget provides cost estimates and financial planning tools only. Always consult a qualified healthcare professional for medical advice or treatment decisions." },
    ]
  },
  {
    category: "Cost Estimation",
    items: [
      { q: "How accurate are the cost estimates?", a: "Our estimates are based on aggregated historical data and current market rates across Indian cities and hospital types. They are typically accurate within ±15-20% of actual costs. They serve as a solid planning baseline, not a guaranteed quote." },
      { q: "Which cities and hospital types are supported?", a: "We support all major Indian cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, and more) and all hospital types — Government, Private Economy, Corporate, Trust/Charitable, and Super-Specialty." },
      { q: "Can I save my estimates for later?", a: "Yes! After calculating an estimate, you can save it to your History. Go to the History section in your dashboard to view all past estimates and download them as reports." },
    ]
  },
  {
    category: "Medicine Scanner",
    items: [
      { q: "How does the Medicine Scanner work?", a: "Upload a photo or use your camera to capture medicine packaging. Our AI (powered by Google Gemini) reads the packaging, identifies the medicine, and provides generic alternatives, pricing information, and usage details." },
      { q: "Can I search by medicine name instead of scanning?", a: "Absolutely! You can type the medicine name directly in the search field on the Scanner page without needing to upload an image." },
    ]
  },
  {
    category: "Government Schemes",
    items: [
      { q: "Which government schemes does MediBudget check?", a: "We check eligibility for Ayushman Bharat PM-JAY, ESIC (Employee State Insurance), CGHS (Central Government Health Scheme), and major state-specific schemes across all Indian states." },
      { q: "How do I check my eligibility?", a: "Navigate to the Scheme Checker section, enter your state, annual household income, ration card status, employment type, and social category. The system will instantly determine which schemes you qualify for." },
    ]
  },
  {
    category: "Privacy & Security",
    items: [
      { q: "Is my personal health data secure?", a: "Absolutely. All data is encrypted in transit and at rest using industry-standard AES-256 encryption via Supabase. We never sell, share, or use your personal health information for advertising purposes." },
      { q: "Can I delete my account and data?", a: "Yes. Contact us at medibudget@gmail.com to request complete account deletion. All your data will be permanently removed within 30 days." },
    ]
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <PillIcon />
            <span>MediBudget</span>
          </Link>
          <nav className="hidden md:flex ml-10 gap-6">
            <a href="/#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors">Features</a>
            <Link href="/faq" className="text-sm font-medium text-emerald-600">FAQ</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-600 transition-colors px-3 py-2">Sign In</Link>
            <Link href="/signup" className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-500 dark:text-gray-400">Everything you need to know about MediBudget.</p>
          </div>

          <div className="space-y-8">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-3">{section.category}</h2>
                <div className="space-y-2">
                  {section.items.map((item, i) => {
                    const key = `${section.category}-${i}`
                    return (
                      <div key={key} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggle(key)}
                          className="w-full flex items-center justify-between px-6 py-4 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          <span>{item.q}</span>
                          {openItems[key] ? <ChevronUp className="h-4 w-4 text-emerald-500 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                        </button>
                        {openItems[key] && (
                          <div className="px-6 pb-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
            <p className="font-semibold mb-2">Still have questions?</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Our team is happy to help you out.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-sm text-gray-400">
        <p>© 2026 MediBudget. All rights reserved. | <Link href="/privacy" className="hover:text-emerald-500">Privacy</Link> · <Link href="/terms" className="hover:text-emerald-500">Terms</Link></p>
      </footer>
    </div>
  )
}
