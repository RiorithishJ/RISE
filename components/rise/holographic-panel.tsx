"use client"

import { useRef, useEffect, useState, type ReactNode } from "react"

interface HolographicPanelProps {
  children: ReactNode
  className?: string
  title?: string
  delay?: number
}

export function HolographicPanel({ 
  children, 
  className = "", 
  title,
  delay = 0 
}: HolographicPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return

      const rect = panelRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (e.clientX - centerX) / rect.width
      const deltaY = (e.clientY - centerY) / rect.height

      // Limit tilt range
      setTilt({
        x: deltaY * 5,
        y: -deltaX * 5,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      ref={panelRef}
      className={`
        relative overflow-hidden rounded-xl
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        ${className}
      `}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
        background: `
          linear-gradient(
            135deg,
            rgba(0, 245, 255, 0.1) 0%,
            rgba(0, 0, 0, 0.8) 50%,
            rgba(123, 47, 255, 0.05) 100%
          )
        `,
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(0, 245, 255, 0.2)",
        boxShadow: `
          0 0 30px rgba(0, 245, 255, 0.1),
          0 20px 60px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        animation: "breath-glow 4s ease-in-out infinite",
      }}
    >
      {/* Holographic gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              180deg,
              rgba(0, 245, 255, 0.05) 0%,
              transparent 30%,
              transparent 70%,
              rgba(123, 47, 255, 0.03) 100%
            )
          `,
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#00f5ff] opacity-60" 
           style={{ boxShadow: "0 0 10px rgba(0, 245, 255, 0.5)" }} />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#00f5ff] opacity-60" 
           style={{ boxShadow: "0 0 10px rgba(0, 245, 255, 0.5)" }} />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#00f5ff] opacity-60" 
           style={{ boxShadow: "0 0 10px rgba(0, 245, 255, 0.5)" }} />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#00f5ff] opacity-60" 
           style={{ boxShadow: "0 0 10px rgba(0, 245, 255, 0.5)" }} />

      {/* Panel title */}
      {title && (
        <div 
          className="absolute -top-[1px] left-6 px-4 py-1 text-xs font-mono tracking-[0.3em] uppercase"
          style={{
            background: "linear-gradient(135deg, #00f5ff 0%, #7b2fff 100%)",
            color: "#000",
            clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
          }}
        >
          {title}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>

      {/* Inner glow line at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), transparent)",
        }}
      />
    </div>
  )
}
