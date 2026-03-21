import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ShieldAlert } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verify Admin Role
  const { data: roleData, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (error || roleData?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 dark:bg-red-950 p-4">
        <div className="text-center space-y-4 max-w-md">
           <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
           <h1 className="text-2xl font-bold text-red-700 dark:text-red-400">Access Denied</h1>
           <p className="text-red-600 dark:text-red-300">You do not have administrative privileges to view this section.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950">
      <header className="flex h-14 items-center gap-4 border-b bg-primary text-primary-foreground px-6 shadow-sm">
        <span className="text-lg font-bold">MediBudget Admin Control Center</span>
      </header>
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
