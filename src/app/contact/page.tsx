"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle, Mail, Send } from "lucide-react"

function PillIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#10B981"/>
      <rect x="16" y="10" width="14" height="12" rx="6" fill="#059669"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, send to backend/email service
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <PillIcon />
            <span>MediBudget</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-600 transition-colors px-3 py-2">Sign In</Link>
            <Link href="/signup" className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Contact Us</h1>
            <p className="text-gray-500 dark:text-gray-400">Have a question or need support? We're here to help.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Get in Touch</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Our support team is available Monday to Saturday, 9 AM to 6 PM IST. We typically respond within 24 hours.
              </p>

              <div className="space-y-4">
                <a
                  href="https://wa.me/919381987307"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">+91 93819 87307</p>
                  </div>
                </a>

                <a
                  href="mailto:medibudget@gmail.com"
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">medibudget@gmail.com</p>
                  </div>
                </a>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                <strong>Medical Emergency?</strong> Please call 112 (India Emergency) or visit the nearest hospital immediately. MediBudget is not a medical emergency service.
              </div>
            </div>

            {/* Contact Form */}
            <div>
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-emerald-200 dark:border-emerald-800 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4">
                    <Send className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 p-6 border border-gray-100 dark:border-gray-800 rounded-xl">
                  <h2 className="text-xl font-bold mb-2">Send a Message</h2>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="How can we help?"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your issue or question..."
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all"
                  >
                    <Send className="h-4 w-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-sm text-gray-400">
        <p>© 2026 MediBudget. All rights reserved. | <Link href="/privacy" className="hover:text-emerald-500">Privacy</Link> · <Link href="/terms" className="hover:text-emerald-500">Terms</Link></p>
      </footer>
    </div>
  )
}
