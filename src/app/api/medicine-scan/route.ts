import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { image, query } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'Image base64 is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        medicine_name: "Mockamol 500",
        generic_name: "Paracetamol",
        composition: "500mg Paracetamol",
        dosage: "Take 1 tablet every 6 hours",
        manufacturer: "Mock Pharma",
        expiry_date: "12-2027",
        MRP: 25,
        prescription_required: false,
        uses: ["Fever", "Headache"],
        side_effects: ["Nausea"],
        warnings: ["Do not exceed recommended dose"],
        category: "Analgesic",
        alternatives: ["Crocin", "Dolo 650"]
      })
    }

    // Strip data:image/... base64 prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "")

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
      You are an expert pharmaceutical analyst. Analyze this image of medicine packaging.
      ${query ? `User specific query: ${query}` : ''}
      
      Extract as much information as possible and return exactly this JSON structure (fill in the data, use "N/A" if unknown):
      {
        "medicine_name": "string",
        "generic_name": "string",
        "composition": "string",
        "dosage": "string",
        "manufacturer": "string",
        "expiry_date": "string",
        "MRP": number (or 0),
        "prescription_required": boolean,
        "uses": ["use1", "use2"],
        "side_effects": ["effect1"],
        "warnings": ["warning1"],
        "category": "string",
        "alternatives": ["alt1", "alt2"]
      }

      Return ONLY valid JSON.
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ])

    const responseText = result.response.text()
    
    let parsedJson = {}
    try {
      const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/)
      parsedJson = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText)
    } catch (e) {
      console.error("Failed to parse Gemini JSON", responseText)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    return NextResponse.json(parsedJson)
  } catch (error) {
    console.error('Medicine scan error:', error)
    return NextResponse.json({ error: 'Failed to scan medicine' }, { status: 500 })
  }
}
