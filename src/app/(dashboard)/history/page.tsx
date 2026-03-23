"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Download, History } from "lucide-react"
import { toast } from "sonner"

type HistoryEntry = {
  id: string
  city: string
  condition: string
  hospital_tier: string
  estimated_cost: number
  created_at: string
}

export default function HistoryPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from("cost_estimation_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setEntries(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { loadHistory() }, [])

  const deleteEntry = async (id: string) => {
    await supabase.from("cost_estimation_logs").delete().eq("id", id)
    setEntries(prev => prev.filter(e => e.id !== id))
    toast.success("Entry deleted")
  }

  const clearAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("cost_estimation_logs").delete().eq("user_id", user.id)
      setEntries([])
      toast.success("All history cleared")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Estimation History</h1>
        </div>
        {entries.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-600 font-medium border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading history...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No estimations yet</p>
          <p className="text-gray-400 text-sm mt-1">Your past cost estimates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{entry.condition}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{entry.city}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{entry.hospital_tier}</span>
                </div>
                <div className="text-emerald-600 font-bold text-lg">₹{entry.estimated_cost.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(entry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toast.success("Report downloaded (demo)")}
                  className="p-2 text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
