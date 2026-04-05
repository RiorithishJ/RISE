"use client"

import { useEffect, useMemo, useRef, useState } from "react"

interface VoiceModeProps {
  open: boolean
  onClose: () => void
  onSendText: (text: string) => void
}

export function VoiceMode({ open, onClose, onSendText }: VoiceModeProps) {
  const [volume, setVolume] = useState(0)
  const [transcript, setTranscript] = useState("")
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)

  const orbScale = useMemo(() => 1 + (volume / 255) * 0.4, [volume])

  useEffect(() => {
    if (!open) return

    let mounted = true

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (!mounted) return
        streamRef.current = stream

        const audioCtx = new AudioContext()
        audioCtxRef.current = audioCtx

        const analyser = audioCtx.createAnalyser()
        const source = audioCtx.createMediaStreamSource(stream)
        source.connect(analyser)
        analyser.fftSize = 256

        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const tick = () => {
          analyser.getByteFrequencyData(dataArray)
          const next = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
          setVolume(next)
          rafRef.current = requestAnimationFrame(tick)
        }

        tick()

        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (SpeechRecognition) {
          const recognition = new SpeechRecognition()
          recognitionRef.current = recognition
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = "en-IN"

          recognition.onresult = (event: any) => {
            const full = Array.from(event.results)
              .map((r: any) => r[0]?.transcript || "")
              .join(" ")
            setTranscript(full.trim())
          }

          recognition.start()
        }
      } catch {
        setTranscript("Microphone permission denied.")
      }
    }

    start()

    return () => {
      mounted = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      recognitionRef.current?.stop?.()
      audioCtxRef.current?.close?.()
      streamRef.current = null
      recognitionRef.current = null
      audioCtxRef.current = null
      rafRef.current = null
      setVolume(0)
    }
  }, [open])

  if (!open) return null

  const stopAndSend = () => {
    const text = transcript.trim()
    if (text) {
      onSendText(text)
    }
    onClose()
  }

  const ringStyle = (base: number, opacity: number) => ({
    width: `${base + (volume / 255) * 180}px`,
    height: `${base + (volume / 255) * 180}px`,
    border: `1px solid rgba(0,245,255,${opacity})`,
    boxShadow: `0 0 20px rgba(123,47,255,${opacity * 0.7})`,
  })

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center w-[420px] h-[420px]">
          <div className="absolute rounded-full animate-pulse" style={ringStyle(170, 0.35)} />
          <div className="absolute rounded-full animate-pulse" style={ringStyle(230, 0.25)} />
          <div className="absolute rounded-full animate-pulse" style={ringStyle(290, 0.18)} />
          <div className="absolute rounded-full animate-pulse" style={ringStyle(350, 0.12)} />

          <div
            className="w-[200px] h-[200px] rounded-full flex items-center justify-center text-3xl font-semibold tracking-[0.15em]"
            style={{
              transform: `scale(${orbScale})`,
              transition: "transform .08s linear",
              color: "#e8fcff",
              background:
                "radial-gradient(circle at 30% 20%, rgba(0,245,255,.95), rgba(123,47,255,.65) 55%, rgba(10,20,35,.9) 100%)",
              boxShadow: `0 0 ${20 + (volume / 255) * 40}px rgba(0,245,255,.7)`,
            }}
          >
            RISE
          </div>
        </div>

        <div className="text-[#a9f3ff] text-lg mt-2">Listening...</div>
        <div className="text-[#92a4b5] text-sm mt-1 max-w-[560px] text-center min-h-[24px] px-3">{transcript}</div>

        <button
          onClick={stopAndSend}
          className="mt-8 w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "#ff2e43",
            boxShadow: "0 0 22px rgba(255,46,67,.65)",
            color: "white",
            fontWeight: 700,
          }}
        >
          ■
        </button>
      </div>
    </div>
  )
}
