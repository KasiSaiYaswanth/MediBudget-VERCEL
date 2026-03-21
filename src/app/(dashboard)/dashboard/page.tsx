"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Scan, Stethoscope, FileText, Shield } from "lucide-react"
import Link from "next/link"

const features = [
  { name: "Estimate Costs", href: "/estimate", icon: Calculator, desc: "Calculate treatment costs across hospitals" },
  { name: "Medicine Scanner", href: "/scanner", icon: Scan, desc: "Find generic alternatives via OCR mapping" },
  { name: "Symptom Checker", href: "/symptom-chat", icon: Stethoscope, desc: "AI conversational medical triage" },
  { name: "Scheme Check", href: "/scheme-check", icon: FileText, desc: "Evaluate government scheme eligibility" },
  { name: "Insurance", href: "/insurance", icon: Shield, desc: "Estimate out-of-pocket insurance coverage" },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to MediBudget</h1>
        <p className="text-muted-foreground mt-2">
          Your comprehensive healthcare financial planning platform. Select a module below to get started.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((item) => (
          <Link href={item.href} key={item.name}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <item.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
