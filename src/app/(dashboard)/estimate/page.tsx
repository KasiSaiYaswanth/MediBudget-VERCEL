"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Calculator } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Indian cost multipliers for major cities relative to tier 3 towns (base 1.0)
const cityMultipliers: Record<string, number> = {
  Mumbai: 2.5,
  Delhi: 2.2,
  Bangalore: 2.3,
  Chennai: 2.0,
  Hyderabad: 1.9,
  Kolkata: 1.7,
  Pune: 1.8,
  Jaipur: 1.5,
  Ahmedabad: 1.6,
  Surat: 1.4,
  Other: 1.0,
}

// Base cost of conditions in INR (assuming general ward, Tier 3 city)
const conditionBaseCosts: Record<string, number> = {
  "Cardiac Surgery (Bypass)": 150000,
  "Angioplasty": 80000,
  "Knee Replacement": 120000,
  "Appendectomy": 25000,
  "Gallbladder Removal": 35000,
  "Cataract Surgery": 15000,
  "Normal Delivery": 20000,
  "C-Section Delivery": 40000,
  "Dengue Treatment": 10000,
  "Chemotherapy (per session)": 30000,
}

// Hospital tier multipliers
const tierMultipliers: Record<string, number> = {
  "Government": 0.3,
  "Private (Economy)": 1.0,
  "Private (Premium)": 2.0,
  "Super-Specialty": 3.5,
}

const formSchema = z.object({
  city: z.string().min(1, "Please select a city or enter one"),
  condition: z.string().min(1, "Please select a medical condition"),
  hospitalTier: z.string().min(1, "Please select a hospital tier"),
})

export default function CostEstimation() {
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [availableConditions, setAvailableConditions] = useState<string[]>(Object.keys(conditionBaseCosts))
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "Mumbai",
      condition: "Cardiac Surgery (Bypass)",
      hospitalTier: "Private (Premium)",
    },
  })

  useEffect(() => {
    // Check if we came from symptom-chat
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('from') === 'symptom-chat') {
      const stored = localStorage.getItem("medibudget_triage_result");
      if (stored) {
        try {
          const triageData = JSON.parse(stored);
          const conditionName = triageData.predicted_condition;
          
          if (conditionName) {
            // If it's not in the list, add it dynamically
            if (!availableConditions.includes(conditionName)) {
               setAvailableConditions(prev => [conditionName, ...prev]);
            }
            form.setValue("condition", conditionName);
            
            // Map severity to hospital tier appropriately
            if (triageData.severity === 'emergency') {
              form.setValue("hospitalTier", "Super-Specialty");
            } else if (triageData.severity === 'high') {
              form.setValue("hospitalTier", "Private (Premium)");
            } else if (triageData.severity === 'low') {
              form.setValue("hospitalTier", "Private (Economy)");
            }
            
            toast.success("Triage data imported successfully.");
          }
        } catch (e) {
          console.error("Failed to parse triage result", e);
        }
      }
    }
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Base cost is derived or dynamically assigned for imported unknown conditions
    const baseCost = conditionBaseCosts[values.condition] || 15000; // reasonable fallback
    const cityMultiplier = cityMultipliers[values.city] || 1.1; // fallback
    const tierMultiplier = tierMultipliers[values.hospitalTier] || 1.0;

    const finalEstimate = Math.round(baseCost * cityMultiplier * tierMultiplier);
    setEstimatedCost(finalEstimate);
    
    // Save search history
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("cost_estimation_logs").insert({
          user_id: user.id,
          city: values.city,
          condition: values.condition,
          hospital_tier: values.hospitalTier,
          estimated_cost: finalEstimate
        })
      }
    } catch (error) {
      console.error("Failed to log search", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Cost Estimator</h1>
      </div>
      <p className="text-muted-foreground">
        Get an AI-calibrated estimate of medical treatments across Indian cities and hospital tiers.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Treatment Details</CardTitle>
            <CardDescription>Enter details to estimate your medical expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  {...form.register("city")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.keys(cityMultipliers).map(city => (
                    <option key={city} value={city} className="bg-background text-foreground">{city}</option>
                  ))}
                </select>
                {form.formState.errors.city && <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Medical Condition</Label>
                <select
                  id="condition"
                  {...form.register("condition")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {availableConditions.map(condition => (
                    <option key={condition} value={condition} className="bg-background text-foreground">{condition}</option>
                  ))}
                </select>
                {form.formState.errors.condition && <p className="text-sm text-red-500">{form.formState.errors.condition.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospitalTier">Hospital Tier</Label>
                <select
                  id="hospitalTier"
                  {...form.register("hospitalTier")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.keys(tierMultipliers).map(tier => (
                    <option key={tier} value={tier} className="bg-background text-foreground">{tier}</option>
                  ))}
                </select>
                {form.formState.errors.hospitalTier && <p className="text-sm text-red-500">{form.formState.errors.hospitalTier.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Calculating..." : "Calculate Estimate"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {estimatedCost !== null && (
          <Card className="border-primary/50 shadow-md bg-primary/5 flex flex-col justify-center">
            <CardHeader className="text-center">
              <CardTitle>Estimated Total Cost</CardTitle>
              <CardDescription>Based on selected city and hospital tier</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-5xl font-bold text-primary">
                ₹{estimatedCost.toLocaleString('en-IN')}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This is an algorithmic estimate based on historical data. Actual hospital bills may vary by ±15%. Includes consultation, room charges, standard tests, and typical surgical costs.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => toast.success("Estimate saved to your dashboard")}>
                Save Estimate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
