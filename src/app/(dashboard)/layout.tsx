"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calculator, Scan, Stethoscope, FileText, Shield, History, Settings, Bell, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

function PillIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="28" height="12" rx="6" fill="#10B981"/>
      <rect x="16" y="10" width="14" height="12" rx="6" fill="#059669"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Symptom Assistant", href: "/symptom-chat", icon: Stethoscope },
  { name: "Medicine Scanner", href: "/scanner", icon: Scan },
  { name: "Cost Estimation", href: "/estimate", icon: Calculator },
  { name: "Insurance", href: "/insurance", icon: Shield },
  { name: "Scheme Checker", href: "/scheme-check", icon: FileText },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4">
          <PillIcon />
          <span className="text-lg font-extrabold tracking-tight">MediBudget</span>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-auto py-3 px-3">
          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-0.5">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell className="h-4 w-4" />
            Notifications
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">2</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 md:hidden">
          <PillIcon />
          <span className="text-lg font-bold">MediBudget</span>
        </header>

        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
