"use client"

import { useEffect, useState, type ReactNode } from "react"

interface HUDPanelProps {
  children: ReactNode
  className?: string
  title?: string
  delay?: number
  variant?: "default" | "accent"
}

export function HUDPanel({ 
  children, 
  className = "", 
  title,
  delay = 0,
  variant = "default"
}: HUDPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const accentColor = variant === "accent" ? "#00d4ff" : "#1e90ff"

  return (
    <div
      className={`
        relative overflow-hidden
        transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        ${className}
      `}
      style={{
        background: `
          linear-gradient(
            135deg,
            rgba(30, 144, 255, 0.08) 0%,
            rgba(0, 8, 16, 0.95) 50%,
            rgba(30, 144, 255, 0.03) 100%
          )
        `,
        border: `1px solid rgba(30, 144, 255, 0.25)`,
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
      }}
    >
      {/* Corner cuts - top right */}
      <div 
        className="absolute top-0 right-0 w-[20px] h-[20px]"
        style={{
          background: `linear-gradient(135deg, transparent 50%, rgba(30, 144, 255, 0.3) 50%)`,
        }}
      />
      
      {/* Corner cuts - bottom left */}
      <div 
        className="absolute bottom-0 left-0 w-[20px] h-[20px]"
        style={{
          background: `linear-gradient(315deg, transparent 50%, rgba(30, 144, 255, 0.3) 50%)`,
        }}
      />

      {/* Top border glow */}
      <div 
        className="absolute top-0 left-0 right-[20px] h-[1px]"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, rgba(30, 144, 255, 0.5), transparent)`,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />

      {/* Left border glow */}
      <div 
        className="absolute top-0 left-0 w-[1px] bottom-[20px]"
        style={{
          background: `linear-gradient(180deg, ${accentColor}, rgba(30, 144, 255, 0.5), transparent)`,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />

      {/* Scan line effect */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden opacity-30"
      >
        <div 
          className="absolute inset-0"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(30, 144, 255, 0.03) 2px, rgba(30, 144, 255, 0.03) 4px)",
          }}
        />
      </div>

      {/* Panel title */}
      {title && (
        <div 
          className="absolute top-0 left-4 px-3 py-1 text-[10px] font-mono tracking-[0.3em] uppercase"
          style={{
            background: accentColor,
            color: "#000810",
            clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)",
          }}
        >
          {title}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>

      {/* Flicker animation overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          animation: "hud-flicker 8s infinite",
        }}
      />
    </div>
  )
}
