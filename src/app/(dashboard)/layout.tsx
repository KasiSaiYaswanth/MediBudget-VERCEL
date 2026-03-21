"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calculator, Scan, Stethoscope, FileText, Shield, Settings, LogOut, HeartPulse } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Estimate Costs", href: "/estimate", icon: Calculator },
  { name: "Medicine Scanner", href: "/scanner", icon: Scan },
  { name: "Symptom Checker", href: "/symptom-chat", icon: Stethoscope },
  { name: "Scheme Check", href: "/scheme-check", icon: FileText },
  { name: "Insurance", href: "/insurance", icon: Shield },
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
    <div className="flex h-screen bg-gray-50/50 dark:bg-zinc-950">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">MediBudget</span>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent" : "transparent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-2 border-b bg-background px-4 md:hidden">
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">MediBudget</span>
        </header>
        
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
