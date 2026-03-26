import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYMTPOM_KB, getEmergencyKeywords } from '@/lib/symptom-intelligence'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { message, conversationHistory } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: "This is a mock response because GEMINI_API_KEY is missing. In a real environment, I would carefully assess your symptoms.",
        symptomData: {
          symptoms: ["mock symptom"],
          severity: "low",
          predicted_condition: "Mock condition",
          confidence: 0.8,
          recommended_doctor: "General Physician",
          suggested_next_steps: "This is a mock next step.",
          hospital_type: "Clinic",
          is_complete: true
        }
      })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Build chat history
    const history = conversationHistory ? conversationHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    })) : []

    // Calculate conversation turns to know when to conclude
    const userMessageCount = history.filter((msg: any) => msg.role === 'user').length + 1; // +1 for the current message

    const systemInstruction = `You are "MediBot", an AI Symptom Triage assistant for MediBudget.
    
    PERSONA AND TONE:
    - You are a calm, highly empathetic, and thoughtful healthcare triage assistant.
    - Always acknowledge the user's pain or discomfort before asking questions (e.g., "I'm sorry to hear you're feeling that way.", "That sounds uncomfortable.").
    - Use clear, friendly, human-like, non-jargon language.
    - NEVER provide a final definitive medical diagnosis.
    - NEVER prescribe medication dosages.
    - ALWAYS remind them this is for guidance, not professional advice.

    TRIAGE PROCESS:
    1. **Clarify**: If symptoms are vague, ask 1-2 clarifying questions (e.g., duration, severity, accompanying symptoms).
    2. **Analyze**: Rely on typical medical knowledge to identify potential conditions. Reference this knowledge base sample if relevant: ${JSON.stringify(SYMTPOM_KB.conditions.map(c => c.name))}
    3. **Conclude**: Once you have enough information (usually after 2-3 user messages), conclude the triage. At this point, the user has sent ${userMessageCount} messages. If userMessageCount >= 3, you MUST conclude the triage now.
    
    EMERGENCY DETECTION:
    If the user mentions any of these: ${getEmergencyKeywords().join(", ")}, or if you detect a life-threatening emergency, you MUST immediately warn them to seek emergency medical attention or call an ambulance (108 in India). Set severity to "emergency" in the JSON.
    
    JSON OUTPUT (ONLY WHEN CONCLUDING):
    When the assessment is complete, and you have enough information (or if userMessageCount >= 3), append a structured JSON block at the very end of your response inside a block formatted EXACTLY like this:
    ===JSON===
    {
      "symptoms": ["list of up to 5 identified symptoms"],
      "severity": "low|moderate|high|emergency",
      "predicted_condition": "String name of most likely condition (e.g., 'Tension Headache')",
      "confidence": 0.85,
      "recommended_doctor": "Specialist type (e.g., Cardiologist, General Physician)",
      "suggested_next_steps": "Short actionable advice (e.g., Rest, monitor 24h).",
      "hospital_type": "Outpatient Clinic|Hospital|Emergency Room",
      "is_complete": true
    }
    ===/JSON===
    
    IMPORTANT: 
    - Only output the ===JSON=== block when the triage is FINISHED (i.e. you have enough info, or reached 3+ turns). 
    - If you are still asking questions, do NOT output the JSON block.
    - Always provide your empathetic conversational reply BEFORE the JSON block.`;

    const chat = model.startChat({
      history,
      systemInstruction
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
