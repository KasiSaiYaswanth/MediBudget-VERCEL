"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Lock, Check, X, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

function PillIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#10B981"/>
      <rect x="16" y="10" width="14" height="12" rx="6" fill="#059669"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  
  // Checking session validity
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSessionError(true)
      }
    }
    checkSession()
  }, [])

  // Password validation checks
  const minLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const isPasswordValid = minLength && hasUpperCase && hasNumber && hasSpecial
  const passwordsMatch = password === confirmPassword && password.length > 0

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordValid) {
      toast.error('Please fulfill all password strength requirements')
      return
    }
    
    if (!passwordsMatch) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    
    // Supabase automatically hashes the password using its secure endpoint
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Password updated successfully!')
      // Force logout and send to login so they use their new credentials
      await supabase.auth.signOut()
      router.push('/login?reset=success')
    }
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <X className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold">Invalid or Expired Link</h1>
          <p className="text-sm text-gray-500">
             This password reset link has expired or is invalid. Reset links are valid for exactly 15 minutes and can only be used once. Please request a new one.
          </p>
          <div className="pt-4">
            <Link href="/forgot-password" className="block w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Container */}
      <div className="flex w-full max-w-lg mx-auto items-center justify-center p-6 md:p-12">
        <div className="w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <PillIcon />
            <span className="text-xl font-extrabold">MediBudget</span>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">Create New Password</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-6 mb-2">
              Please enter your strong new password below.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                <Lock className="h-4 w-4" /> New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Password Rules UI */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-2 text-sm">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Security Requirements
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 ${minLength ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {minLength ? <Check className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-current opacity-30" />}
                  Minimum 8 chars
                </div>
                <div className={`flex items-center gap-2 ${hasUpperCase ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {hasUpperCase ? <Check className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-current opacity-30" />}
                  Uppercase letter
                </div>
                <div className={`flex items-center gap-2 ${hasNumber ? 'textemerald-600' : 'text-gray-500'}`}>
                  {hasNumber ? <Check className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-current opacity-30" />}
                  Numeric digit
                </div>
                <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {hasSpecial ? <Check className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-current opacity-30" />}
                  Special char (@$!%*?)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-800 ${
                  confirmPassword.length > 0 
                    ? (passwordsMatch ? 'border-emerald-500' : 'border-red-500')
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900 disabled:opacity-60 text-sm disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Password...' : 'Reset My Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
