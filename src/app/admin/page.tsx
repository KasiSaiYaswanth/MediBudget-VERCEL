"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Pill, FileText, Users, Activity } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { name: "Total Users", value: "2,543", icon: Users, trend: "+12%" },
    { name: "Hospitals Listed", value: "12,400", icon: Building2, trend: "+5%" },
    { name: "Medicines in DB", value: "85,210", icon: Pill, trend: "+1%" },
    { name: "AI Consultations", value: "14,200", icon: Activity, trend: "+25%" },
    { name: "Schemes Active", value: "48", icon: FileText, trend: "0%" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground mt-2">Manage MediBudget data entities and monitor analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
            <CardDescription>System actions performed by administrators</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                   <span>Admin updated hospital pricing for <strong>Apollo Delhi</strong></span>
                   <span className="text-muted-foreground">2 hours ago</span>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management (CRUD)</CardTitle>
            <CardDescription>Select an entity to manage records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 border rounded flex justify-between items-center hover:bg-muted cursor-pointer">
               <span className="font-medium">Hospitals Database</span>
               <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Edit</span>
            </div>
            <div className="p-3 border rounded flex justify-between items-center hover:bg-muted cursor-pointer">
               <span className="font-medium">Pharmaceuticals Database</span>
               <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Edit</span>
            </div>
            <div className="p-3 border rounded flex justify-between items-center hover:bg-muted cursor-pointer">
               <span className="font-medium">Government Schemes</span>
               <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Edit</span>
            </div>
            <div className="p-3 border rounded flex justify-between items-center hover:bg-muted cursor-pointer">
               <span className="font-medium">Role Based Access Control</span>
               <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Restricted</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
