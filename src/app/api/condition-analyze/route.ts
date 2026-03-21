import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { description } = await req.json()

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mock mode if no key provided yet
      return NextResponse.json({
        conditions: [
          { condition: "mock_condition", label: "Mock Condition Detected", probability: 95 }
        ]
      })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
      You are a medical categorization AI. Analyze the following symptom description and return a JSON array of the top 2 possible medical conditions or fields from this predefined list that best match:
      [Cardiac Surgery (Bypass), Angioplasty, Knee Replacement, Appendectomy, Gallbladder Removal, Cataract Surgery, Normal Delivery, C-Section Delivery, Dengue Treatment, Chemotherapy (per session)].
      
      Output format MUST be valid JSON:
      {
        "conditions": [
          { "condition": "internal_id", "label": "Human Readable Label (e.g., Cardiac check-up)", "probability": 85 }
        ]
      }

      Description: "${description}"
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Attempt to parse JSON from markdown code blocks
    let parsedJson = { conditions: [] }
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/)
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        parsedJson = JSON.parse(responseText)
      }
    } catch (e) {
      console.error("Failed to parse Gemini JSON", responseText)
    }

    return NextResponse.json(parsedJson)
  } catch (error) {
    console.error('AI Analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze condition' }, { status: 500 })
  }
}
