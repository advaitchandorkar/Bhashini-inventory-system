"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

const defaultItem = { name: "", quantity: 1, unit: "pcs", price_per_unit: "" }

const AddItemsPanel = ({ onSaved }) => {
  const [manualItem, setManualItem] = useState(defaultItem)
  const [manualLoading, setManualLoading] = useState(false)

  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [audioBlob, setAudioBlob] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [voiceItems, setVoiceItems] = useState([])
  const [voiceErrors, setVoiceErrors] = useState([])
  const [voiceLoading, setVoiceLoading] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState("")
  const [imageItems, setImageItems] = useState([])
  const [imageErrors, setImageErrors] = useState([])
  const [imageLoading, setImageLoading] = useState(false)

  const [barcode, setBarcode] = useState("")
  const [barcodeItem, setBarcodeItem] = useState(null)
  const [barcodeError, setBarcodeError] = useState("")
  const [barcodeLoading, setBarcodeLoading] = useState(false)
  const videoRef = useRef(null)
  const [scannerActive, setScannerActive] = useState(false)

  const resetVoice = () => {
    setAudioUrl("")
    setAudioBlob(null)
    setTranscript("")
    setVoiceItems([])
    setVoiceErrors([])
  }

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const startRecording = async () => {
    resetVoice()
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      setAudioBlob(blob)
      setAudioUrl(URL.createObjectURL(blob))
      stream.getTracks().forEach((track) => track.stop())
    }
    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const submitManual = async () => {
    setManualLoading(true)
    try {
      await api.post("/api/inventory", {
        name: manualItem.name,
        quantity: Number(manualItem.quantity),
        unit: manualItem.unit,
        price_per_unit: manualItem.price_per_unit ? Number(manualItem.price_per_unit) : null,
        currency: "INR",
        source: "manual",
      })
      setManualItem(defaultItem)
      onSaved?.()
    } catch (error) {
      console.error(error)
    } finally {
      setManualLoading(false)
    }
  }

  const transcribeVoice = async () => {
    if (!audioBlob) return
    setVoiceLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", audioBlob, "recording.webm")
      const { transcript: text } = await api.post("/api/voice/transcribe", formData)
      setTranscript(text)
      const parsed = await api.post("/api/voice/parse", { transcript: text })
      setVoiceItems(parsed.items || [])
      setVoiceErrors(parsed.errors || [])
    } catch (error) {
      console.error(error)
    } finally {
      setVoiceLoading(false)
    }
  }

  const confirmVoice = async () => {
    if (!voiceItems.length) return
    await api.post("/api/inventory/bulk_upsert", { items: voiceItems })
    resetVoice()
    onSaved?.()
  }

  const handleImageSelect = (file) => {
    setImageFile(file)
    setImageUrl(file ? URL.createObjectURL(file) : "")
    setImageItems([])
    setImageErrors([])
  }

  const extractImage = async () => {
    if (!imageFile) return
    setImageLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", imageFile)
      const parsed = await api.post("/api/image/extract", formData)
      setImageItems(parsed.items || [])
      setImageErrors(parsed.errors || [])
    } catch (error) {
      console.error(error)
    } finally {
      setImageLoading(false)
    }
  }

  const confirmImage = async () => {
    if (!imageItems.length) return
    await api.post("/api/inventory/bulk_upsert", { items: imageItems })
    setImageFile(null)
    setImageUrl("")
    setImageItems([])
    setImageErrors([])
    onSaved?.()
  }

  const lookupBarcode = async () => {
    setBarcodeLoading(true)
    setBarcodeError("")
    try {
      const result = await api.post("/api/barcode/lookup", { barcode })
      setBarcodeItem(result.item)
    } catch (error) {
      setBarcodeError(error.message)
      setBarcodeItem(null)
    } finally {
      setBarcodeLoading(false)
    }
  }

  const confirmBarcode = async () => {
    if (!barcodeItem) return
    await api.post("/api/inventory/bulk_upsert", { items: [barcodeItem] })
    setBarcode("")
    setBarcodeItem(null)
    onSaved?.()
  }

  useEffect(() => {
    if (!scannerActive || !videoRef.current || !window.BarcodeDetector) return
    let stream
    const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a"] })
    const scan = async () => {
      if (!videoRef.current) return
      try {
        const barcodes = await detector.detect(videoRef.current)
        if (barcodes.length > 0) {
          setBarcode(barcodes[0].rawValue)
          setScannerActive(false)
        }
      } catch (error) {
        console.error(error)
      }
    }
    const start = async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      const interval = setInterval(scan, 800)
      return () => clearInterval(interval)
    }
    let cleanup
    start().then((stopper) => {
      cleanup = stopper
    })
    return () => {
      cleanup?.()
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [scannerActive])

  const renderItemsEditor = (items, setItems) => (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.name}-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <Input
            value={item.name}
            onChange={(event) => {
              const updated = [...items]
              updated[index] = { ...updated[index], name: event.target.value }
              setItems(updated)
            }}
            placeholder="Item name"
          />
          <Input
            value={item.quantity}
            onChange={(event) => {
              const updated = [...items]
              updated[index] = { ...updated[index], quantity: event.target.value }
              setItems(updated)
            }}
            placeholder="Quantity"
          />
          <Input
            value={item.unit}
            onChange={(event) => {
              const updated = [...items]
              updated[index] = { ...updated[index], unit: event.target.value }
              setItems(updated)
            }}
            placeholder="Unit"
          />
          <Input
            value={item.price_per_unit || ""}
            onChange={(event) => {
              const updated = [...items]
              updated[index] = { ...updated[index], price_per_unit: event.target.value }
              setItems(updated)
            }}
            placeholder="Price per unit"
          />
        </div>
      ))}
    </div>
  )

  return (
    <Card className="border-muted bg-white/80">
      <CardHeader>
        <CardTitle>Add Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="barcode">Barcode</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Input
                value={manualItem.name}
                onChange={(event) => setManualItem({ ...manualItem, name: event.target.value })}
                placeholder="Item name"
              />
              <Input
                type="number"
                value={manualItem.quantity}
                onChange={(event) => setManualItem({ ...manualItem, quantity: event.target.value })}
                placeholder="Quantity"
              />
              <Input
                value={manualItem.unit}
                onChange={(event) => setManualItem({ ...manualItem, unit: event.target.value })}
                placeholder="Unit"
              />
              <Input
                type="number"
                value={manualItem.price_per_unit}
                onChange={(event) =>
                  setManualItem({ ...manualItem, price_per_unit: event.target.value })
                }
                placeholder="Price per unit"
              />
            </div>
            <Button onClick={submitManual} disabled={manualLoading}>
              {manualLoading ? "Saving..." : "Save item"}
            </Button>
          </TabsContent>

          <TabsContent value="voice" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={startRecording} disabled={recording}>
                Start recording
              </Button>
              <Button onClick={stopRecording} disabled={!recording} variant="outline">
                Stop
              </Button>
              <Button onClick={resetVoice} variant="ghost">
                Cancel
              </Button>
            </div>
            {audioUrl && <audio controls src={audioUrl} className="w-full" />}
            <div className="flex flex-wrap gap-3">
              <Button onClick={transcribeVoice} disabled={!audioBlob || voiceLoading}>
                {voiceLoading ? "Processing..." : "Transcribe + Parse"}
              </Button>
            </div>
            {transcript && (
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Transcript</p>
                <p className="text-muted-foreground">{transcript}</p>
              </div>
            )}
            {voiceItems.length > 0 && renderItemsEditor(voiceItems, setVoiceItems)}
            {voiceErrors.length > 0 && (
              <div className="text-sm text-red-500">
                {voiceErrors.map((error, index) => (
                  <div key={index}>{error.message}</div>
                ))}
              </div>
            )}
            <Button onClick={confirmVoice} disabled={!voiceItems.length}>
              Confirm and save
            </Button>
          </TabsContent>

          <TabsContent value="image" className="mt-4 space-y-4">
            <Input type="file" accept="image/*" onChange={(event) => handleImageSelect(event.target.files?.[0])} />
            {imageUrl && <img src={imageUrl} alt="Preview" className="max-h-64 rounded-md object-contain" />}
            <div className="flex flex-wrap gap-3">
              <Button onClick={extractImage} disabled={!imageFile || imageLoading}>
                {imageLoading ? "Extracting..." : "Extract items"}
              </Button>
            </div>
            {imageItems.length > 0 && renderItemsEditor(imageItems, setImageItems)}
            {imageErrors.length > 0 && (
              <div className="text-sm text-red-500">
                {imageErrors.map((error, index) => (
                  <div key={index}>{error.message}</div>
                ))}
              </div>
            )}
            <Button onClick={confirmImage} disabled={!imageItems.length}>
              Confirm and save
            </Button>
          </TabsContent>

          <TabsContent value="barcode" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              <Input
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                placeholder="Scan or enter barcode"
              />
              <Button onClick={lookupBarcode} disabled={!barcode || barcodeLoading}>
                {barcodeLoading ? "Looking up..." : "Lookup"}
              </Button>
            </div>
            {typeof window !== "undefined" && window.BarcodeDetector && (
              <div className="space-y-3">
                <Button variant="outline" onClick={() => setScannerActive((prev) => !prev)}>
                  {scannerActive ? "Stop camera scan (beta)" : "Start camera scan (beta)"}
                </Button>
                {scannerActive && <video ref={videoRef} className="w-full rounded-md border" />}
              </div>
            )}
            {barcodeError && <div className="text-sm text-red-500">{barcodeError}</div>}
            {barcodeItem && (
              <div className="space-y-3">
                {renderItemsEditor([barcodeItem], (items) => setBarcodeItem(items[0]))}
                <Button onClick={confirmBarcode}>Confirm and save</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AddItemsPanel
