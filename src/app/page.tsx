"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Shield, Calculator, Activity, ArrowRight, Scan, Building2, Clock, ChevronDown, ChevronUp } from "lucide-react"

// MediBudget Pill Logo SVG
function PillIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#10B981"/>
      <rect x="16" y="10" width="14" height="12" rx="6" fill="#059669"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

// Google SVG
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// Hospital illustration SVG
function HospitalIllustration() {
  return (
    <svg viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
      {/* Background glow */}
      <ellipse cx="200" cy="300" rx="150" ry="30" fill="#10B981" fillOpacity="0.1"/>
      {/* Hospital building */}
      <rect x="100" y="140" width="200" height="160" rx="4" fill="#0D9488"/>
      <rect x="130" y="160" width="30" height="30" rx="2" fill="white" fillOpacity="0.4"/>
      <rect x="185" y="160" width="30" height="30" rx="2" fill="white" fillOpacity="0.4"/>
      <rect x="240" y="160" width="30" height="30" rx="2" fill="white" fillOpacity="0.4"/>
      <rect x="130" y="210" width="30" height="30" rx="2" fill="white" fillOpacity="0.4"/>
      <rect x="240" y="210" width="30" height="30" rx="2" fill="white" fillOpacity="0.4"/>
      {/* Door */}
      <rect x="175" y="240" width="50" height="60" rx="2" fill="#065F46"/>
      {/* Plus sign on building */}
      <rect x="188" y="100" width="24" height="8" rx="2" fill="#10B981"/>
      <rect x="197" y="91" width="8" height="24" rx="2" fill="#10B981"/>
      {/* Roof */}
      <rect x="80" y="130" width="240" height="18" rx="3" fill="#0F766E"/>
      {/* Stethoscope */}
      <circle cx="310" cy="80" r="20" fill="none" stroke="#10B981" strokeWidth="4"/>
      <path d="M310 100 Q310 140 280 150 Q260 158 255 180" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="255" cy="185" r="8" fill="#059669"/>
      {/* Pills floating */}
      <ellipse cx="60" cy="110" rx="18" ry="10" rx="18" ry="10" fill="#34D399" opacity="0.8" transform="rotate(-30 60 110)"/>
      <ellipse cx="70" cy="110" rx="9" ry="10" fill="#10B981" opacity="0.8" transform="rotate(-30 70 110)"/>
      <ellipse cx="340" cy="180" rx="14" ry="8" fill="#6EE7B7" opacity="0.7" transform="rotate(20 340 180)"/>
      {/* Bar chart */}
      <rect x="310" y="240" width="12" height="40" rx="2" fill="#10B981" opacity="0.7"/>
      <rect x="328" y="225" width="12" height="55" rx="2" fill="#10B981" opacity="0.85"/>
      <rect x="346" y="210" width="12" height="70" rx="2" fill="#10B981"/>
      {/* Trend arrow */}
      <path d="M300 270 L340 240" stroke="#6EE7B7" strokeWidth="2" strokeDasharray="4 2"/>
      {/* Small circles decoration */}
      <circle cx="80" cy="60" r="5" fill="#A7F3D0" opacity="0.6"/>
      <circle cx="350" cy="100" r="4" fill="#6EE7B7" opacity="0.5"/>
      <circle cx="370" cy="230" r="6" fill="#34D399" opacity="0.4"/>
      <circle cx="40" cy="200" r="4" fill="#A7F3D0" opacity="0.5"/>
      {/* Plus decorations */}
      <text x="350" y="145" fontSize="18" fill="#10B981" opacity="0.6">+</text>
      <text x="50" y="155" fontSize="14" fill="#34D399" opacity="0.5">+</text>
    </svg>
  )
}

const features = [
  {
    icon: Scan,
    title: "AI Medicine Scanner",
    desc: "Scan medicine packaging to get generic alternatives, pricing, and side effects instantly.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Calculator,
    title: "Cost Estimation",
    desc: "Estimate medical treatment costs based on city, hospital type, and locality.",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: Shield,
    title: "Government Schemes",
    desc: "Automated check for Ayushman Bharat, ESI, CGHS, and state-specific programs.",
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    icon: Activity,
    title: "Insurance Calculator",
    desc: "Calculates exactly how much insurance covers and your final out-of-pocket expense.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Building2,
    title: "Hospital Finder",
    desc: "Find and compare hospitals near you with cost estimates and facility comparisons.",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: Clock,
    title: "Estimation History",
    desc: "Track and download all your past medical cost reports in one convenient place.",
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
]

const steps = [
  { number: "01", title: "Choose Service", desc: "Select from cost estimation, medicine scanner, or scheme checker." },
  { number: "02", title: "Enter Details", desc: "Provide your city, hospital type, and medical condition or symptoms." },
  { number: "03", title: "Get Results", desc: "Receive instant AI-powered estimates with detailed cost breakdowns." },
]

const faqs = [
  {
    q: "How accurate are the cost estimates?",
    a: "Our estimates are based on historical data and current market rates. They are typically accurate within ±15-20% of actual costs and serve as a solid planning baseline.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is encrypted end-to-end and stored securely using Supabase. We never sell your personal health information to third parties.",
  },
  {
    q: "Which government schemes does MediBudget check?",
    a: "We check Ayushman Bharat PM-JAY, ESIC, CGHS, and major state government health schemes across all Indian states.",
  },
  {
    q: "Is MediBudget free to use?",
    a: "Yes! MediBudget is completely free. Sign up with your email or Google account and start estimating immediately.",
  },
  {
    q: "Does MediBudget provide medical advice?",
    a: "No. MediBudget provides cost estimates and financial planning tools only. Always consult a qualified healthcare professional for medical decisions.",
  },
]

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <PillIcon />
            <span className="tracking-tight">MediBudget</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex ml-10 gap-6">
            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How it Works</a>
            <Link href="/faq" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</Link>
          </nav>

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-3">
            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-emerald-200 dark:hover:shadow-emerald-900"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                {/* Trust badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Trusted by <strong>10,000+</strong> users across India
                </div>

                {/* Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                  Estimate Before{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">You Visit</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg">
                  Know your medical costs upfront. Scan medicines, estimate treatments, check government scheme eligibility — all in one platform.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900 text-sm"
                  >
                    Start Free <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 border border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500 font-semibold px-6 py-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm"
                  >
                    See How it Works
                  </a>
                </div>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><Scan className="h-4 w-4 text-emerald-500" /> Medicine Scanner</span>
                  <span className="flex items-center gap-1.5"><Activity className="h-4 w-4 text-emerald-500" /> Cost Estimation</span>
                  <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> Scheme Checker</span>
                </div>
              </div>

              {/* Right Illustration */}
              <div className="hidden md:flex justify-center items-center">
                <HospitalIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="w-full py-16 md:py-24 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything You Need to Plan Healthcare Costs</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">From medicine scanning to insurance calculations — MediBudget is your complete healthcare finance companion.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-gray-100 dark:border-gray-800 p-6 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md transition-all group">
                  <div className={`inline-flex p-3 rounded-xl ${f.bg} mb-4`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-slate-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How it Works</h2>
              <p className="text-gray-500 dark:text-gray-400">Get accurate estimates in 3 simple steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="w-full py-16 md:py-24 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-500 dark:text-gray-400">Got questions? We've got answers.</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="h-4 w-4 text-emerald-500 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/faq" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                View all FAQs →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="w-full py-16 bg-emerald-600 dark:bg-emerald-700">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Take Control of Your Medical Expenses?</h2>
            <p className="text-emerald-100 max-w-xl mx-auto">Join 10,000+ Indians who plan smarter with MediBudget.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-lg hover:bg-emerald-50 transition-colors shadow-md"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <PillIcon />
                <span>MediBudget</span>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Know your medical costs upfront. Empowering Indians to plan healthcare finances with confidence.
              </p>
            </div>
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="/signup" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Get Started</Link></li>
                <li><a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How it Works</a></li>
                <li><Link href="/faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Medical Disclaimer</Link></li>
              </ul>
            </div>
            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                <li>
                  <a href="https://wa.me/919381987307" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    WhatsApp: +91 93819 87307
                  </a>
                </li>
                <li>
                  <a href="mailto:medibudget@gmail.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    medibudget@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© 2026 MediBudget. All rights reserved.</p>
            <p>Made with ❤️ for India's healthcare</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
