"use client"

import { useEffect, useRef } from "react"

interface ArcReactorProps {
  size?: number
  isActive?: boolean
  isThinking?: boolean
}

export function ArcReactor({ size = 200, isActive = true, isThinking = false }: ArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    let angle = 0
    let pulsePhase = 0

    const animate = () => {
      ctx.clearRect(0, 0, size, size)
      
      const centerX = size / 2
      const centerY = size / 2

      // Pulse effect
      pulsePhase += isThinking ? 0.08 : 0.03
      const pulse = Math.sin(pulsePhase) * 0.15 + 1

      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2)
      gradient.addColorStop(0, "rgba(30, 144, 255, 0.3)")
      gradient.addColorStop(0.5, "rgba(30, 144, 255, 0.1)")
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)

      // Draw outer ring segments
      const outerRadius = size * 0.42
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle)
      
      for (let i = 0; i < 12; i++) {
        const segmentAngle = (i * 30 * Math.PI) / 180
        const gap = 3 * (Math.PI / 180)
        
        ctx.beginPath()
        ctx.arc(0, 0, outerRadius, segmentAngle + gap, segmentAngle + (30 * Math.PI / 180) - gap)
        ctx.strokeStyle = i % 3 === 0 ? "#ff6b35" : `rgba(30, 144, 255, ${0.6 + (i % 4) * 0.1})`
        ctx.lineWidth = 4
        ctx.shadowColor = i % 3 === 0 ? "#ff6b35" : "#1e90ff"
        ctx.shadowBlur = 15
        ctx.stroke()
      }
      ctx.restore()

      // Draw secondary ring (counter-rotating)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(-angle * 0.7)
      
      const secondaryRadius = size * 0.35
      for (let i = 0; i < 8; i++) {
        const segmentAngle = (i * 45 * Math.PI) / 180
        const gap = 5 * (Math.PI / 180)
        
        ctx.beginPath()
        ctx.arc(0, 0, secondaryRadius, segmentAngle + gap, segmentAngle + (45 * Math.PI / 180) - gap)
        ctx.strokeStyle = `rgba(0, 212, 255, ${0.5 + (i % 3) * 0.15})`
        ctx.lineWidth = 2
        ctx.shadowColor = "#00d4ff"
        ctx.shadowBlur = 10
        ctx.stroke()
      }
      ctx.restore()

      // Draw inner triangular segments (Iron Man style)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle * 0.5)
      
      const innerRadius = size * 0.25
      const coreRadius = size * 0.12
      
      for (let i = 0; i < 10; i++) {
        const startAngle = (i * 36 * Math.PI) / 180
        const endAngle = startAngle + (30 * Math.PI / 180)
        
        ctx.beginPath()
        ctx.moveTo(
          Math.cos(startAngle) * coreRadius,
          Math.sin(startAngle) * coreRadius
        )
        ctx.lineTo(
          Math.cos(startAngle + (15 * Math.PI / 180)) * innerRadius,
          Math.sin(startAngle + (15 * Math.PI / 180)) * innerRadius
        )
        ctx.lineTo(
          Math.cos(endAngle) * coreRadius,
          Math.sin(endAngle) * coreRadius
        )
        ctx.closePath()
        
        ctx.fillStyle = `rgba(30, 144, 255, ${0.2 + (i % 3) * 0.1})`
        ctx.strokeStyle = "#1e90ff"
        ctx.lineWidth = 1
        ctx.shadowColor = "#1e90ff"
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.stroke()
      }
      ctx.restore()

      // Draw core (arc reactor center)
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, size * 0.1 * pulse
      )
      coreGradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      coreGradient.addColorStop(0.3, "rgba(0, 212, 255, 0.9)")
      coreGradient.addColorStop(0.6, "rgba(30, 144, 255, 0.7)")
      coreGradient.addColorStop(1, "rgba(30, 144, 255, 0)")

      ctx.beginPath()
      ctx.arc(centerX, centerY, size * 0.1 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.shadowColor = "#00d4ff"
      ctx.shadowBlur = 30 * pulse
      ctx.fill()

      // Inner core bright spot
      ctx.beginPath()
      ctx.arc(centerX, centerY, size * 0.04, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.shadowColor = "#ffffff"
      ctx.shadowBlur = 20
      ctx.fill()

      // Rotating data indicators
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle * 2)
      
      for (let i = 0; i < 6; i++) {
        const indicatorAngle = (i * 60 * Math.PI) / 180
        const indicatorRadius = size * 0.38
        
        ctx.beginPath()
        ctx.arc(
          Math.cos(indicatorAngle) * indicatorRadius,
          Math.sin(indicatorAngle) * indicatorRadius,
          3,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = i % 2 === 0 ? "#ff6b35" : "#1e90ff"
        ctx.shadowColor = i % 2 === 0 ? "#ff6b35" : "#1e90ff"
        ctx.shadowBlur = 10
        ctx.fill()
      }
      ctx.restore()

      // Update rotation
      angle += isThinking ? 0.02 : 0.008

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isActive) {
      animate()
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [size, isActive, isThinking])

  return (
    <div 
      className="relative"
      style={{ 
        width: size, 
        height: size,
        animation: isThinking ? "arc-reactor-pulse 1.5s ease-in-out infinite" : "arc-reactor-pulse 3s ease-in-out infinite",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
        }}
      />
      
      {/* JARVIS text overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <span 
          className="text-xs font-mono tracking-[0.3em] opacity-80"
          style={{
            color: "#00d4ff",
            textShadow: "0 0 10px #00d4ff",
            marginTop: size * 0.35,
          }}
        >
          {isThinking ? "PROCESSING" : "ONLINE"}
        </span>
      </div>
    </div>
  )
}
