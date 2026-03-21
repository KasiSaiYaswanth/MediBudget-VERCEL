"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, XCircle } from "lucide-react"

export default function InsuranceCalculator() {
  const [provider, setProvider] = useState("")
  const [treatmentCost, setTreatmentCost] = useState(0)
  const [maxCoverage, setMaxCoverage] = useState(500000)
  const [copayPercent, setCopayPercent] = useState(10)
  const [deductible, setDeductible] = useState(5000)
  
  const [result, setResult] = useState<any>(null)

  const calculate = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple logic
    let remainingCost = treatmentCost - deductible
    let covered = 0
    let outOfPocket = deductible

    if (remainingCost > 0) {
      let copayAmount = remainingCost * (copayPercent / 100)
      outOfPocket += copayAmount
      covered = remainingCost - copayAmount

      if (covered > maxCoverage) {
        let excess = covered - maxCoverage
        outOfPocket += excess
        covered = maxCoverage
      }
    } else {
      covered = 0
      outOfPocket = treatmentCost
    }

    setResult({
      treatmentCost,
      covered: Math.round(covered),
      outOfPocket: Math.round(outOfPocket),
      deductible,
      copayAmount: Math.round(treatmentCost > deductible ? (treatmentCost - deductible) * (copayPercent / 100) : 0)
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Insurance Estimator</h1>
      </div>
      <p className="text-muted-foreground">Calculate your out-of-pocket expenses based on your Indian health insurance policy terms.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Policy Details</CardTitle>
            <CardDescription>Enter your treatment and policy numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculate} className="space-y-4">
              <div className="space-y-2">
                <Label>Estimated Treatment Cost (₹)</Label>
                <Input type="number" required min="0" value={treatmentCost || ""} onChange={e => setTreatmentCost(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Policy Max Coverage / Sum Insured (₹)</Label>
                <Input type="number" required min="0" value={maxCoverage || ""} onChange={e => setMaxCoverage(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Co-pay Percentage (%)</Label>
                <Input type="number" required min="0" max="100" value={copayPercent || ""} onChange={e => setCopayPercent(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Deductible (₹) - Baseline you pay before coverage starts</Label>
                <Input type="number" required min="0" value={deductible || ""} onChange={e => setDeductible(Number(e.target.value))} />
              </div>
              <Button type="submit" className="w-full">Calculate</Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-primary/50 shadow-md">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle>Estimation Results</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="flex justify-between items-center py-2 border-b">
                 <span className="text-muted-foreground">Total Hospital Bill</span>
                 <span className="font-medium text-lg">₹{result.treatmentCost.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b">
                 <span className="text-muted-foreground">Insurance Pays (Covered)</span>
                 <span className="font-bold text-green-600 text-lg">₹{result.covered.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center py-2 pt-4 bg-red-50 dark:bg-red-950/20 px-4 rounded-md">
                 <span className="font-semibold">You Pay (Out-of-Pocket)</span>
                 <span className="font-bold text-red-600 text-2xl">₹{result.outOfPocket.toLocaleString('en-IN')}</span>
               </div>
               
               <div className="text-sm text-muted-foreground mt-4 space-y-1">
                 <p><strong>Breakdown of what you pay:</strong></p>
                 <p>• Deductible: ₹{result.deductible.toLocaleString()}</p>
                 <p>• Co-pay ({copayPercent}% after deductible): ₹{result.copayAmount.toLocaleString()}</p>
                 {result.covered >= maxCoverage && <p>• Exceeded Sum Insured limit</p>}
               </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
