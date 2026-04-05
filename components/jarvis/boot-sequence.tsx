"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AIOrb } from "./ai-orb"

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const hasCompletedRef = useRef(false)

  const bootLogs = [
    "NEURAL CORE.......... ONLINE",
    "GPU ACCELERATION..... ACTIVE",
    "MEMORY BANKS......... LOADED",
    "OLLAMA ENGINE........ READY",
    "INITIALIZING RISE.... COMPLETE",
  ]

  const finishBoot = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    onComplete()
  }, [onComplete])

  const playRoboticBootSound = useCallback(() => {
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextCtor) return

      const ctx = new AudioContextCtor()
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {})
      }

      const master = ctx.createGain()
      master.connect(ctx.destination)
      master.gain.value = 0.4

      const now = ctx.currentTime

      // Layer 1: Deep industrial drone
      const drone = ctx.createOscillator()
      const droneGain = ctx.createGain()
      drone.connect(droneGain)
      droneGain.connect(master)
      drone.type = "sawtooth"
      drone.frequency.setValueAtTime(40, now)
      drone.frequency.linearRampToValueAtTime(80, now + 4)
      droneGain.gain.setValueAtTime(0.3, now)
      droneGain.gain.linearRampToValueAtTime(0, now + 5)
      drone.start(now)
      drone.stop(now + 5)

      // Layer 2: Robotic glitch beeps
      const beepTimes = [0.2, 0.4, 0.5, 0.8, 1.0, 1.4, 1.5, 1.6, 2.0, 2.5]
      const beepFreqs = [440, 880, 660, 1320, 440, 880, 1760, 440, 880, 1320]

      beepTimes.forEach((time, i) => {
        const beep = ctx.createOscillator()
        const beepGain = ctx.createGain()
        beep.connect(beepGain)
        beepGain.connect(master)
        beep.type = "square"
        beep.frequency.value = beepFreqs[i]
        beepGain.gain.setValueAtTime(0.15, now + time)
        beepGain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.08)
        beep.start(now + time)
        beep.stop(now + time + 0.1)
      })

      // Layer 3: Power charging sweep
      const sweep = ctx.createOscillator()
      const sweepGain = ctx.createGain()
      const sweepFilter = ctx.createBiquadFilter()
      sweep.connect(sweepFilter)
      sweepFilter.connect(sweepGain)
      sweepGain.connect(master)
      sweep.type = "sawtooth"
      sweepFilter.type = "bandpass"
      sweepFilter.frequency.value = 1000
      sweep.frequency.setValueAtTime(100, now + 2)
      sweep.frequency.exponentialRampToValueAtTime(2000, now + 4)
      sweepGain.gain.setValueAtTime(0, now + 2)
      sweepGain.gain.linearRampToValueAtTime(0.3, now + 3)
      sweepGain.gain.linearRampToValueAtTime(0, now + 4.5)
      sweep.start(now + 2)
      sweep.stop(now + 5)

      // Layer 4: Final power-on boom
      const boom = ctx.createOscillator()
      const boomGain = ctx.createGain()
      boom.connect(boomGain)
      boomGain.connect(master)
      boom.type = "sine"
      boom.frequency.setValueAtTime(60, now + 4)
      boom.frequency.exponentialRampToValueAtTime(20, now + 5)
      boomGain.gain.setValueAtTime(0.8, now + 4)
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 5.5)
      boom.start(now + 4)
      boom.stop(now + 6)

      setTimeout(() => {
        ctx.close().catch(() => {})
      }, 6200)
    } catch {
      // Ignore audio errors in restricted browser contexts.
    }
  }, [])

  useEffect(() => {
    if (!hasInitialized) return

    const logTimer = setInterval(() => {
      setPhase((prev) => {
        if (prev >= bootLogs.length) return prev
        setLogs((current) => {
          if (current.length > prev) return current
          return [...current, bootLogs[prev]]
        })
        return prev + 1
      })
    }, 900)

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100))
    }, 100)

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 4600)

    const completeTimer = setTimeout(() => {
      finishBoot()
    }, 5000)

    return () => {
      clearInterval(logTimer)
      clearInterval(progressTimer)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [hasInitialized, bootLogs, finishBoot])

  const handleInitialize = () => {
    if (hasInitialized) return
    setHasInitialized(true)
    setProgress(0)
    setPhase(0)
    setLogs([])
    playRoboticBootSound()
  }

  return (
    <div
      className="fixed inset-0 bg-[#000810] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ opacity: isFadingOut ? 0 : 1 }}
    >
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(30, 144, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30, 144, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {!hasInitialized ? (
        <div className="relative z-20 flex flex-col items-center gap-8">
          <h1
            className="text-4xl font-sans tracking-[0.5em]"
            style={{
              color: "#1e90ff",
              textShadow: "0 0 30px rgba(30, 144, 255, 0.5)",
            }}
          >
            R.I.S.E.
          </h1>

          <button
            onClick={handleInitialize}
            className="px-8 py-4 text-sm font-mono tracking-[0.2em] uppercase"
            style={{
              color: "#00d4ff",
              border: "1px solid rgba(0, 212, 255, 0.5)",
              background: "rgba(0, 212, 255, 0.08)",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.35)",
              animation: "pulse-glow 1.4s ease-in-out infinite",
            }}
          >
            [ CLICK TO INITIALIZE RISE ]
          </button>
        </div>
      ) : (
        <>
      {/* AI Orb */}
      <div className="mb-8">
        <AIOrb size={180} isThinking={phase < bootLogs.length} />
      </div>

      {/* Title */}
      <h1 
        className="text-4xl font-sans tracking-[0.5em] mb-2"
        style={{
          color: "#1e90ff",
          textShadow: "0 0 30px rgba(30, 144, 255, 0.5)",
          animation: "boot-sequence 1s ease-out forwards",
        }}
      >
        BOOTING RISE...
      </h1>
      <p 
        className="text-sm font-mono tracking-[0.3em] mb-12 opacity-60"
        style={{ color: "#00d4ff", animation: "hud-flicker 1.3s infinite" }}
      >
        REAL INTELLIGENCE FOR SELF EVOLUTION
      </p>

      {/* Boot Logs */}
      <div 
        className="w-[500px] h-[200px] overflow-hidden mb-8 p-4"
        style={{
          background: "rgba(30, 144, 255, 0.03)",
          border: "1px solid rgba(30, 144, 255, 0.2)",
        }}
      >
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div 
              key={`log-${index}`}
              className="text-xs font-mono flex items-center gap-2"
              style={{
                animation: "slide-in-left 0.3s ease-out",
                color: index === logs.length - 1 ? "#00d4ff" : "#1e90ff",
              }}
            >
              <span className="text-[#00d4ff]">{">>"}</span>
              <span>{log}</span>
              {index === logs.length - 1 && phase < bootLogs.length && (
                <span 
                  className="inline-block w-2 h-3 bg-[#1e90ff]"
                  style={{ animation: "typewriter-cursor 0.6s infinite" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-[500px]">
        <div className="flex justify-between mb-2">
          <span className="text-[10px] font-mono text-[rgba(30,144,255,0.6)] tracking-wider">
            SYSTEM INITIALIZATION
          </span>
          <span className="text-[10px] font-mono text-[#1e90ff]">
            {Math.round(progress)}%
          </span>
        </div>
        <div 
          className="h-1 w-full relative overflow-hidden"
          style={{ background: "rgba(30, 144, 255, 0.15)" }}
        >
          <div 
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #1e90ff, #00d4ff)",
              boxShadow: "0 0 20px rgba(30, 144, 255, 0.5)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 10px)",
            }}
          />
        </div>
      </div>
        </>
      )}

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[rgba(30,144,255,0.4)]" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[rgba(30,144,255,0.4)]" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[rgba(30,144,255,0.4)]" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[rgba(30,144,255,0.4)]" />
    </div>
  )
}
