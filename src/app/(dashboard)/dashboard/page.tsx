"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Calculator, Scan, Stethoscope, FileText, Shield, History, Sparkles, TrendingDown } from "lucide-react"

const quickActions = [
  { name: "Symptom Assistant", href: "/symptom-chat", icon: Stethoscope, desc: "AI-powered symptom analysis & guidance", color: "bg-violet-500" },
  { name: "Medicine Scanner", href: "/scanner", icon: Scan, desc: "Scan or search any medicine", color: "bg-emerald-500" },
  { name: "Cost Estimation", href: "/estimate", icon: Calculator, desc: "Estimate treatment costs", color: "bg-blue-500" },
  { name: "Scheme Checker", href: "/scheme-check", icon: FileText, desc: "Check government scheme eligibility", color: "bg-orange-500" },
  { name: "Insurance Calculator", href: "/insurance", icon: Shield, desc: "Check your insurance coverage", color: "bg-blue-600" },
  { name: "History", href: "/history", icon: History, desc: "View past estimations", color: "bg-teal-500" },
]

export default function Dashboard() {
  const supabase = createClient()
  const [userName, setUserName] = useState<string>("User")
  const [stats, setStats] = useState({ estimations: 0, avgEstimate: 0, schemesChecked: 0 })

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User"
        setUserName(displayName)

        // Load stats from supabase
        try {
          const { data: estimations } = await supabase
            .from("cost_estimation_logs")
            .select("estimated_cost")
            .eq("user_id", user.id)
          
          if (estimations && estimations.length > 0) {
            const total = estimations.reduce((sum, e) => sum + (e.estimated_cost || 0), 0)
            setStats({
              estimations: estimations.length,
              avgEstimate: Math.round(total / estimations.length),
              schemesChecked: 0,
            })
          }
        } catch {
          // Table may not exist yet
        }
      }
    }
    loadUserData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Hello, {userName} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">What would you like to estimate today?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-start gap-4">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Calculator className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.estimations}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Estimations Made</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-start gap-4">
          <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
            <TrendingDown className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {stats.avgEstimate > 0 ? `₹${stats.avgEstimate.toLocaleString('en-IN')}` : '₹0'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Estimate</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-start gap-4">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.schemesChecked}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Schemes Checked</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
            >
              <div className={`${action.color} p-3 rounded-xl flex-shrink-0`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{action.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{action.desc}</p>
              </div>
              <svg className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-gray-400 dark:text-gray-500 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start gap-2">
        <span className="text-emerald-500 flex-shrink-0">↑</span>
        MediBudget provides cost estimates only and does not constitute medical advice. Always consult a qualified healthcare professional for medical decisions.
      </div>
    </div>
  )
}
