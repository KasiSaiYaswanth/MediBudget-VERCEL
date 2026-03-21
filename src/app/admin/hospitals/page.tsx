"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Plus, Edit2, Trash2 } from "lucide-react"
import { toast } from "sonner"

type Hospital = {
  id: string
  name: string
  city: string
  category: string
  pricing_tier: string
}

export default function HospitalsCRUD() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('hospitals').select('*').limit(50)
    if (error) {
      toast.error('Failed to load hospitals')
    } else {
      setHospitals(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to delete this hospital?')) return
    const { error } = await supabase.from('hospitals').delete().eq('id', id)
    if (error) {
       toast.error(error.message)
    } else {
       toast.success('Deleted successfully')
       fetchHospitals()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Hospitals Directory</h1>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Hospital</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Database</CardTitle>
          <CardDescription>View, Edit, or Remove active healthcare providers.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="p-8 text-center text-muted-foreground animate-pulse">Loading database records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 font-medium text-muted-foreground">Name</th>
                    <th className="p-3 font-medium text-muted-foreground">City</th>
                    <th className="p-3 font-medium text-muted-foreground">Category</th>
                    <th className="p-3 font-medium text-muted-foreground">Tier</th>
                    <th className="p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No hospitals found in database.</td></tr>
                  ) : (
                    hospitals.map(h => (
                      <tr key={h.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">{h.name}</td>
                        <td className="p-3">{h.city}</td>
                        <td className="p-3">{h.category}</td>
                        <td className="p-3">{h.pricing_tier}</td>
                        <td className="p-3 flex gap-2">
                           <Button variant="outline" size="sm" className="h-8"><Edit2 className="w-4 h-4" /></Button>
                           <Button variant="destructive" size="sm" className="h-8" onClick={() => handleDelete(h.id)}><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
