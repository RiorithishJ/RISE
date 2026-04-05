"use client"

import { useEffect, useState } from "react"

interface ProgressRingProps {
  value: number
  max?: number
  label: string
  sublabel?: string
  size?: number
}

export function ProgressRing({ 
  value, 
  max = 100, 
  label, 
  sublabel,
  size = 140 
}: ProgressRingProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  const percentage = (displayValue / max) * 100
  const strokeWidth = 8
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Outer glow ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 4}
            fill="none"
            stroke="rgba(0, 245, 255, 0.1)"
            strokeWidth={1}
          />

          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0, 245, 255, 0.1)"
            strokeWidth={strokeWidth}
          />

          {/* Progress gradient ring */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f5ff" />
              <stop offset="50%" stopColor="#7b2fff" />
              <stop offset="100%" stopColor="#00f5ff" />
            </linearGradient>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 1.5s ease-out",
              filter: "drop-shadow(0 0 10px #00f5ff)",
            }}
          />

          {/* Inner decorative ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth - 4}
            fill="none"
            stroke="rgba(0, 245, 255, 0.15)"
            strokeWidth={1}
            strokeDasharray="5,5"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-3xl font-bold font-mono"
            style={{
              color: "#00f5ff",
              textShadow: "0 0 20px #00f5ff",
            }}
          >
            {Math.round(displayValue)}%
          </span>
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider mt-1">
            Complete
          </span>
        </div>
      </div>

      <div className="text-center mt-3">
        <span 
          className="block text-sm font-mono font-bold"
          style={{ color: "#00f5ff" }}
        >
          {label}
        </span>
        {sublabel && (
          <span className="block text-xs font-mono text-white/40 mt-1">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
