import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { message, conversationHistory } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: "This is a mock response. Setup GEMINI_API_KEY in .env.local to activate the AI symptom checker.",
        symptomData: {
          symptoms: ["headache", "fever"],
          severity: "moderate",
          predicted_condition: "Mock condition",
          confidence: 0.8,
          recommended_doctor: "General Physician"
        }
      })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Build chat history
    const history = conversationHistory ? conversationHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    })) : []

    const chat = model.startChat({
      history,
      systemInstruction: `You are an AI Symptom Triage assistant for MediBudget India.
      Your goal is to assess symptoms provided by the user in a conversational manner.
      If symptoms are incomplete or vague, ask clarifying questions (up to 3 turns maximum).
      If severe emergency symptoms (chest pain, stroke symptoms, severe bleeding) are detected, you must prominently warn the user to call 108 immediately.
      
      When the assessment is complete, append a structured JSON block at the very end of your response inside a block formatted EXACTLY like this:
      ===JSON===
      {
        "symptoms": ["list of identified symptoms"],
        "severity": "low|moderate|high|emergency",
        "predicted_condition": "String name of most likely condition or classification",
        "confidence": 0.85,
        "recommended_doctor": "Specialist type (e.g., Cardiologist, General Physician)"
      }
      ===/JSON===
      
      Always provide an empathetic textual reply before the structured JSON.`
    })

    const result = await chat.sendMessage([{text: message}])
    const responseText = result.response.text()

    // Extract JSON payload if present
    let reply = responseText
    let symptomData = null
    const jsonMatch = responseText.match(/===JSON===\n?([\s\S]*?)\n?===\/JSON===/)
    
    if (jsonMatch) {
      try {
        symptomData = JSON.parse(jsonMatch[1])
        reply = responseText.replace(jsonMatch[0], '').trim()
      } catch (e) {
        console.error("Failed to parse symptom JSON", jsonMatch[1])
      }
    }

    return NextResponse.json({ reply, symptomData })
  } catch (error) {
    console.error('Symptom chat error:', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
