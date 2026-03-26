"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Stethoscope, Send, AlertTriangle, ArrowRight, User, HeartPulse, ShieldAlert, CheckCircle } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

type TriageAnalysis = {
  symptoms: string[]
  severity: "low" | "moderate" | "high" | "emergency"
  predicted_condition: string
  confidence: number
  recommended_doctor: string
  suggested_next_steps: string
  hospital_type: string
  is_complete: boolean
}

export default function SymptomChatbot() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm MediBot, your triage assistant. I'm here to help you understand your symptoms. What seems to be bothering you today?" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [analysis, setAnalysis] = useState<TriageAnalysis | null>(null)
  
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return

    const newMessages: Message[] = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/symptom-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages // send all for context
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessages([...newMessages, { role: "assistant", content: data.reply }])
      
      if (data.symptomData) {
        setAnalysis(data.symptomData)
      }
    } catch (err) {
      console.error(err)
      setMessages([...newMessages, { role: "assistant", content: "I'm sorry, I encountered an error processing your request. Please try again." }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleEstimateCost = () => {
    if (analysis) {
      localStorage.setItem("medibudget_triage_result", JSON.stringify({
        predicted_condition: analysis.predicted_condition,
        severity: analysis.severity,
        recommended_doctor: analysis.recommended_doctor
      }))
      router.push("/estimate?from=symptom-chat")
    }
  }

  const quickReplies = ["Mild pain", "Moderate pain", "Severe pain", "Started today", "Started a few days ago", "Yes", "No"]

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'low': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500 border-emerald-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500 border-orange-200'
      case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
      {/* Chat Column */}
      <div className="lg:col-span-2 space-y-4 flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
            <HeartPulse className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Triage Assistant</h1>
            <p className="text-sm text-muted-foreground">Chat with MediBot to understand your symptoms</p>
          </div>
        </div>

        <Card className="flex-1 flex flex-col shadow-sm border-gray-200/60 dark:border-gray-800 overflow-hidden relative">
          {/* Emergency Alert Overlay Background */}
          {analysis?.severity === 'emergency' && (
            <div className="absolute inset-0 border-4 border-red-500/50 pointer-events-none rounded-xl z-10 animate-pulse" />
          )}
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-950/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-emerald-100 text-emerald-700" : "bg-violet-600 text-white"}`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`p-3.5 rounded-2xl text-sm ${
                    msg.role === "user" 
                      ? "bg-emerald-600 text-white rounded-tr-sm shadow-sm" 
                      : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%] flex-row">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center gap-1.5 shadow-sm">
                    <div className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </CardContent>

          <CardFooter className="p-4 bg-white dark:bg-gray-900 border-t flex flex-col gap-3">
            {!analysis && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !isTyping && (
              <div className="flex flex-wrap gap-2 w-full">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSend(reply)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex w-full gap-2 relative">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={analysis ? "Triage completed." : "Describe your symptoms in detail..."} 
                className="flex-1 pr-12 rounded-full border-gray-300 dark:border-gray-700 focus-visible:ring-violet-500"
                disabled={isTyping || !!analysis}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isTyping || !input.trim() || !!analysis}
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
        
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          Disclaimer: This AI assistant provides guidance only and is not a substitute for professional medical advice, diagnosis, or treatment.
        </div>
      </div>

      {/* Analysis Panel Column */}
      <div className="space-y-4 pt-10 lg:pt-0">
        {analysis ? (
          <Card className={`h-full flex flex-col ${analysis.severity === 'emergency' ? 'border-red-500 bg-red-50 dark:bg-red-950/20 shadow-red-100 dark:shadow-red-900/20' : 'border-violet-200 dark:border-violet-900 shadow-md'}`}>
            {analysis.severity === 'emergency' && (
              <div className="bg-red-500 text-white text-center p-3 font-bold flex items-center justify-center gap-2 rounded-t-xl">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                EMERGENCY MEDICAL ATTENTION REQUIRED
              </div>
            )}
            
            <CardHeader className={analysis.severity === 'emergency' ? 'pt-4' : ''}>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  Triage Analysis
                </CardTitle>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${getSeverityColor(analysis.severity)}`}>
                  {analysis.severity}
                </span>
              </div>
              <CardDescription>Based on your conversation with MediBot</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 flex-1">
               {/* Symptoms */}
               <div>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 block mb-2">Identified Symptoms</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.symptoms?.map((s: string) => (
                     <span key={s} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-md text-sm border border-gray-200 dark:border-gray-700 capitalize">
                       {s}
                     </span>
                  ))}
                </div>
              </div>

              {/* Predicted Condition */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 block mb-1">Probable Condition</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white block">{analysis.predicted_condition}</span>
                {analysis.confidence && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, analysis.confidence * 100)}%` }} 
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{Math.round(analysis.confidence * 100)}% match</span>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg shrink-0 mt-0.5 border border-blue-100 dark:border-blue-800">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block text-gray-900 dark:text-gray-100">Recommended Specialist</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{analysis.recommended_doctor}</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg shrink-0 mt-0.5 border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block text-gray-900 dark:text-gray-100">Suggested Next Steps</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">{analysis.suggested_next_steps}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl border-t border-gray-100 dark:border-gray-800 mt-auto">
              {analysis.severity === 'emergency' ? (
                <div className="w-full text-center space-y-3">
                  <p className="text-sm text-red-600 font-bold">Please call 108 or visit an emergency room.</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-md font-bold shadow-lg shadow-red-200 dark:shadow-red-900/20 hover:-translate-y-0.5 transition-all">
                    Call 108 Now
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleEstimateCost}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all hover:scale-[1.02] text-md font-semibold"
                >
                  Estimate Treatment Cost <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
             <CardContent className="text-center p-8 flex flex-col items-center">
               <div className="h-20 w-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
                 <ShieldAlert className="w-10 h-10 text-violet-400 dark:text-violet-600" />
               </div>
               <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-2">Awaiting Analysis</h3>
               <p className="text-sm leading-relaxed max-w-[250px] text-gray-500 dark:text-gray-400">
                 Describe your symptoms to MediBot on the left to receive your personalised triage report here.
               </p>
             </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
