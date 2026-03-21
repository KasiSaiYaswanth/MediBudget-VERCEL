"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Stethoscope, Send, AlertTriangle } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function SymptomChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello. I am the MediBudget AI Triage Assistant. Please describe your symptoms in detail." }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessages: Message[] = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")
    setIsTyping(true)
    setAnalysis(null)

    try {
      const res = await fetch("/api/symptom-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(1) // exclude welcome message
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
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error processing your request." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Symptom Checker</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Chat with our AI to understand your symptoms and get recommendations.
        </p>

        <Card className="flex flex-col h-[600px]">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg animate-pulse">
                  AI is typing...
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex w-full gap-2">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="E.g., I have a bad headache and fever..." 
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" disabled={isTyping}><Send className="w-4 h-4" /></Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        {analysis ? (
          <Card className={analysis.severity === 'emergency' ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-primary/20'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {analysis.severity === 'emergency' && <AlertTriangle className="text-red-500" />}
                Triage Analysis
              </CardTitle>
              <CardDescription>Based on your conversation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                <span className="font-semibold block text-sm">Identified Symptoms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.symptoms?.map((s: string) => (
                     <span key={s} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div className="py-2 border-y">
                <span className="font-semibold block text-sm">Severity:</span>
                <span className={`text-lg font-bold capitalize ${analysis.severity === 'emergency' ? 'text-red-600' : 'text-primary'}`}>
                  {analysis.severity}
                </span>
                {analysis.severity === 'emergency' && (
                  <p className="text-sm text-red-600 font-bold mt-2">
                    Please visit an emergency room immediately or call 108.
                  </p>
                )}
              </div>
              <div>
                <span className="font-semibold block text-sm">Predicted Condition:</span>
                <span className="text-muted-foreground">{analysis.predicted_condition}</span>
              </div>
              <div>
                <span className="font-semibold block text-sm">Recommended Doctor:</span>
                <span className="text-muted-foreground">{analysis.recommended_doctor}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="opacity-50 h-full flex items-center justify-center">
             <CardContent className="text-center p-6 text-muted-foreground">
               <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
               Complete the symptom chat to see the triage analysis here.
             </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
