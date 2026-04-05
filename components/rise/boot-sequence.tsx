"use client"

import { useState, useEffect } from "react"

interface BootSequenceProps {
  onComplete: () => void
}

const bootMessages = [
  "INITIALIZING RISE CORE...",
  "LOADING NEURAL PATHWAYS...",
  "CONNECTING TO MEMORY BANKS...",
  "CALIBRATING INTERFACE...",
  "ESTABLISHING SECURE LINK...",
  "RISE ONLINE",
]

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentLine, setCurrentLine] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentLine >= bootMessages.length) {
      setIsComplete(true)
      setTimeout(onComplete, 800)
      return
    }

    const message = bootMessages[currentLine]
    let charIndex = 0

    const typeInterval = setInterval(() => {
      if (charIndex <= message.length) {
        setDisplayedText(message.slice(0, charIndex))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setProgress(((currentLine + 1) / bootMessages.length) * 100)
        setTimeout(() => {
          setCurrentLine((prev) => prev + 1)
        }, 300)
      }
    }, 40)

    return () => clearInterval(typeInterval)
  }, [currentLine, onComplete])

  return (
    <div 
      className={`fixed inset-0 z-[2000] flex items-center justify-center transition-opacity duration-500 ${
        isComplete ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "#000" }}
    >
      {/* Animated grid background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          animation: "gradient-shift 20s linear infinite",
        }}
      />

      {/* Central boot content */}
      <div className="relative flex flex-col items-center">
        {/* RISE Logo */}
        <div className="mb-12">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Outer hexagon */}
            <polygon
              points="60,10 105,35 105,85 60,110 15,85 15,35"
              fill="none"
              stroke="#00f5ff"
              strokeWidth="2"
              style={{
                filter: "drop-shadow(0 0 10px #00f5ff)",
                animation: "rotate-slow 8s linear infinite reverse",
                transformOrigin: "center",
              }}
            />
            {/* Inner hexagon */}
            <polygon
              points="60,25 90,42 90,78 60,95 30,78 30,42"
              fill="none"
              stroke="#7b2fff"
              strokeWidth="1.5"
              style={{
                filter: "drop-shadow(0 0 8px #7b2fff)",
                animation: "rotate-slow 6s linear infinite",
                transformOrigin: "center",
              }}
            />
            {/* Center text */}
            <text
              x="60"
              y="65"
              textAnchor="middle"
              fill="#00f5ff"
              fontFamily="Orbitron, sans-serif"
              fontSize="18"
              fontWeight="bold"
              style={{
                filter: "drop-shadow(0 0 10px #00f5ff)",
              }}
            >
              RISE
            </text>
          </svg>
        </div>

        {/* Boot text */}
        <div 
          className="text-center mb-8 h-8"
          style={{ minWidth: 300 }}
        >
          <span 
            className="text-lg font-mono tracking-[0.3em]"
            style={{
              color: currentLine === bootMessages.length - 1 ? "#00ff88" : "#00f5ff",
              textShadow: `0 0 20px ${currentLine === bootMessages.length - 1 ? "#00ff88" : "#00f5ff"}`,
            }}
          >
            {displayedText}
            <span 
              className="inline-block w-3 h-5 ml-1 align-middle"
              style={{
                backgroundColor: "#00f5ff",
                animation: "typewriter-cursor 0.5s ease-in-out infinite",
              }}
            />
          </span>
        </div>

        {/* Progress bar */}
        <div 
          className="w-80 h-1 rounded-full overflow-hidden"
          style={{
            background: "rgba(0, 245, 255, 0.1)",
            border: "1px solid rgba(0, 245, 255, 0.2)",
          }}
        >
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #00f5ff, #7b2fff)",
              boxShadow: "0 0 20px #00f5ff",
            }}
          />
        </div>

        {/* Progress percentage */}
        <span 
          className="mt-4 text-xs font-mono"
          style={{ color: "rgba(0, 245, 255, 0.5)" }}
        >
          {Math.round(progress)}%
        </span>
      </div>

      {/* Corner decorations */}
      {[
        "top-8 left-8",
        "top-8 right-8 rotate-90",
        "bottom-8 left-8 -rotate-90",
        "bottom-8 right-8 rotate-180",
      ].map((position, i) => (
        <div
          key={i}
          className={`absolute w-16 h-16 ${position}`}
          style={{
            borderLeft: "2px solid rgba(0, 245, 255, 0.3)",
            borderTop: "2px solid rgba(0, 245, 255, 0.3)",
          }}
        />
      ))}
    </div>
  )
}
