"use client"

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react'

function PillIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#10B981"/>
      <rect x="16" y="10" width="14" height="12" rx="6" fill="#059669"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Basic client-side email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.")
      setLoading(false)
      return
    }

    // Determine the correct base URL. Vercel provides NEXT_PUBLIC_VERCEL_URL automatically.
    const getURL = () => {
      let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
        (process?.env?.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null) ?? // Automatically set by Vercel.
        location.origin // Fallback to current browser origin (localhost or deployed)
      
      // Make sure we include `https://` when not localhost
      url = url.includes('http') ? url : `https://${url}`
      return url
    }

    // Call Supabase to send the reset email
    // It creates a secure, single-use, 15-minute token link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getURL()}/auth/callback?next=/reset-password`,
    })

    if (error) {
      // In production we usually don't reveal if an account exists to 
      // prevent enumeration, so we might just log this internally and show success regardless.
      // But for ratelimits, we show the generic error.
      if (error.message.includes('rate limit')) {
        setErrorMsg("Too many requests. Please wait a moment and try again.")
      } else {
        setIsSubmitted(true) // Generic success to prevent enumeration
      }
    } else {
      setIsSubmitted(true)
    }
    
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl p-6 sm:p-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <PillIcon />
            <span>MediBudget</span>
          </Link>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If an account exists for <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>, a password reset link has been sent. This link will expire in 15 minutes.
            </p>
            <div className="pt-4">
              <Link href="/login" className="text-emerald-600 font-semibold hover:underline text-sm flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Login
              </Link>
            </div>
            {/* Generic security notice */}
            <p className="border-t border-gray-100 dark:border-gray-800 pt-6 text-xs text-gray-400 text-left mt-6 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              For security reasons, we do not confirm whether the email exists in our system. Make sure you check your spam folder.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleResetRequest} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errorMsg && <p className="text-red-500 text-xs mt-2 font-medium">{errorMsg}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 flex items-center justify-center rounded-xl transition-all shadow-sm hover:shadow-emerald-200 dark:hover:shadow-emerald-900 disabled:opacity-60 text-sm disabled:cursor-not-allowed"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link href="/login" className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
