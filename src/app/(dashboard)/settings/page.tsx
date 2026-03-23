"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Settings, User, Bell, Shield, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        })
      }
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Display Name</label>
          <input
            type="text"
            value={user?.name || ""}
            onChange={e => setUser(u => u ? { ...u, name: e.target.value } : u)}
            placeholder="Your name"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support.</p>
        </div>
        <button
          onClick={() => toast.success("Profile updated")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">Receive updates about new features and your estimates</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold">Privacy & Security</h2>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
        >
          <span>Sign out of all devices</span>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
        <button
          onClick={() => toast.error("Account deletion requires contacting support at medibudget@gmail.com")}
          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-500"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </button>
      </div>

      {/* App info */}
      <p className="text-xs text-center text-gray-400">MediBudget v1.0.0 · <a href="mailto:medibudget@gmail.com" className="hover:text-emerald-500">medibudget@gmail.com</a></p>
    </div>
  )
}
