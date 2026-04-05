"use client"

import { useEffect, useState } from "react"

interface CircularGaugeProps {
  value: number
  max?: number
  label: string
  color?: string
  size?: number
}

export function CircularGauge({ 
  value, 
  max = 100, 
  label, 
  color = "#00f5ff",
  size = 80 
}: CircularGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  const percentage = (displayValue / max) * 100
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
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
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0, 245, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 1s ease-out",
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
          
          {/* Inner glow circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth}
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.2}
          />
        </svg>

        {/* Center value */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
        >
          <span 
            className="text-sm font-mono font-bold"
            style={{ 
              color,
              textShadow: `0 0 10px ${color}`,
            }}
          >
            {Math.round(displayValue)}%
          </span>
        </div>
      </div>

      {/* Label */}
      <span 
        className="text-[10px] font-mono tracking-wider uppercase text-center"
        style={{ color: "rgba(0, 245, 255, 0.6)" }}
      >
        {label}
      </span>
    </div>
  )
}
