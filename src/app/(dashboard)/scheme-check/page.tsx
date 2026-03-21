"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2, XCircle } from "lucide-react"

const SCHEMES = [
  {
    id: "pmjay",
    name: "Ayushman Bharat (PM-JAY)",
    desc: "Provides health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.",
    check: (income: number, cardHolder: boolean, occupation: string) => income < 100000 || cardHolder || occupation === 'laborer'
  },
  {
    id: "cgss",
    name: "Central Government Health Scheme (CGHS)",
    desc: "Comprehensive health care facilities for Central Govt. employees and pensioners.",
    check: (income: number, cardHolder: boolean, occupation: string) => occupation === 'government'
  },
  {
    id: "jsy",
    name: "Janani Suraksha Yojana (JSY)",
    desc: "Safe motherhood intervention under the National Health Mission (NHM).",
    check: (income: number, cardHolder: boolean, occupation: string) => income < 50000 && cardHolder
  }
]

export default function SchemeChecker() {
  const [income, setIncome] = useState<number>(0)
  const [occupation, setOccupation] = useState("private")
  const [bplCard, setBplCard] = useState(false)
  
  const [results, setResults] = useState<any>(null)

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault()
    const evaluation = SCHEMES.map(scheme => ({
      ...scheme,
      eligible: scheme.check(income, bplCard, occupation)
    }))
    setResults(evaluation)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Government Scheme Eligibility</h1>
      </div>
      <p className="text-muted-foreground">Check your eligibility across central and state healthcare schemes in India.</p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Your Demographics</CardTitle>
            <CardDescription>Enter details to evaluate eligibility</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="space-y-2">
                <Label>Annual Family Income (₹)</Label>
                <Input type="number" required min="0" value={income || ""} onChange={e => setIncome(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Occupation Type</Label>
                <select
                  required
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option className="bg-background text-foreground" value="private">Private Sector</option>
                  <option className="bg-background text-foreground" value="government">Government Employee</option>
                  <option className="bg-background text-foreground" value="laborer">Daily Wage/Laborer</option>
                  <option className="bg-background text-foreground" value="unemployed">Unemployed / Student</option>
                </select>
              </div>
              <div className="space-y-2 flex items-center gap-2 pt-2">
                <input type="checkbox" id="bpl" checked={bplCard} onChange={e => setBplCard(e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="bpl" className="mb-0">Hold BPL / Ration Card?</Label>
              </div>
              <Button type="submit" className="w-full">Check Eligibility</Button>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          {!results ? (
            <Card className="h-full flex items-center justify-center min-h-[300px] border-dashed">
              <span className="text-muted-foreground">Fill out your details to see eligible schemes.</span>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Evaluation Results</h2>
              {results.map((r: any) => (
                <Card key={r.id} className={r.eligible ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "opacity-75"}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="mt-1">
                      {r.eligible ? <CheckCircle2 className="text-green-600 w-6 h-6" /> : <XCircle className="text-muted-foreground w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{r.name}</h3>
                      <p className="text-sm mt-1 mb-2 text-muted-foreground">{r.desc}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${r.eligible ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-700'}`}>
                        {r.eligible ? "Eligible" : "Not Eligible based on criteria"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
