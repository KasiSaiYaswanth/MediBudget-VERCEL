"use client"

import Link from "next/link"
import { Shield, Calculator, Activity, ArrowRight, HeartPulse } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2 font-bold text-xl" href="#">
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="tracking-tight">MediBudget</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors" href="/signup">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50 dark:bg-zinc-950">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Healthcare Financial Planning, Democratized.
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mt-4">
                  Estimate treatment costs, find generic medicine alternatives, check government schemes, and triage symptoms with AI before stepping into a hospital.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Cost Estimation</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Compare historical treatment costs across cities and government, private, and super-specialty hospitals.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">AI Symptom Check</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Chat with our medical AI to understand symptom severity and predict required specialist visits.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Financial Security</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Discover matching government schemes (PMJAY) and calculate exact out-of-pocket insurance costs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2026 MediBudget. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
