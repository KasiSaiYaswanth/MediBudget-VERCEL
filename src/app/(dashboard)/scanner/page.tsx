"use client"

import { useState, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Camera, Search, Upload, Scan } from "lucide-react"
import { toast } from "sonner"

export default function MedicineScanner() {
  const [query, setQuery] = useState("")
  const [scanResult, setScanResult] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      analyzeMedicine(imageSrc)
    }
  }, [webcamRef])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        analyzeMedicine(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeMedicine = async (base64Image: string) => {
    try {
      setIsScanning(true)
      setUseCamera(false)
      const res = await fetch("/api/medicine-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, query })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to analyze")
      
      setScanResult(data)
      toast.success("Medicine identified successfully")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Scan className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Medicine Scanner</h1>
      </div>
      <p className="text-muted-foreground">
        Upload or capture a photo of medicine packaging to analyze contents and find cheaper alternatives.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Scan Medicine</CardTitle>
          <CardDescription>Use your camera or upload an image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Search by name explicitly (optional)" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </Button>
            <Button onClick={() => setUseCamera(!useCamera)}>
              <Camera className="w-4 h-4 mr-2" />
              {useCamera ? "Close Camera" : "Use Camera"}
            </Button>
          </div>

          {useCamera && (
            <div className="flex flex-col items-center gap-4 bg-black p-4 rounded-md">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="max-h-96 rounded-md"
              />
              <Button onClick={handleCapture} disabled={isScanning}>
                {isScanning ? "Scanning..." : "Capture"}
              </Button>
            </div>
          )}
          
          {isScanning && (
            <div className="p-8 text-center border rounded-md animate-pulse">
              <p className="text-primary font-medium">Analyzing medicine packaging with Gemini OCR...</p>
            </div>
          )}

        </CardContent>
      </Card>

      {scanResult && !isScanning && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">{scanResult.medicine_name}</CardTitle>
            <CardDescription className="text-lg">{scanResult.generic_name}</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="font-semibold block">Category:</span>
                <span className="text-muted-foreground">{scanResult.category}</span>
              </div>
              <div>
                <span className="font-semibold block">Manufacturer:</span>
                <span className="text-muted-foreground">{scanResult.manufacturer}</span>
              </div>
              <div>
                <span className="font-semibold block">Price (MRP):</span>
                <span className="text-muted-foreground">₹{scanResult.MRP}</span>
              </div>
              <div>
                <span className="font-semibold block">Prescription Required:</span>
                <span className="text-muted-foreground">{scanResult.prescription_required ? "Yes" : "No"}</span>
              </div>
            </div>
            <div className="space-y-4">
               <div>
                <span className="font-semibold block">Uses:</span>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {scanResult.uses?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-green-600 block">Cheaper Alternatives:</span>
                <ul className="list-disc pl-5 text-green-700 dark:text-green-400">
                  {scanResult.alternatives?.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
