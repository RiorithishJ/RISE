"use client"

import { useEffect, useRef } from "react"

interface AIOrbProps {
  size?: number
  isThinking?: boolean
}

export function AIOrb({ size = 160, isThinking = false }: AIOrbProps) {
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

    let time = 0
    let pulsePhase = 0

    const animate = () => {
      ctx.clearRect(0, 0, size, size)
      
      const centerX = size / 2
      const centerY = size / 2

      // Pulse effect
      pulsePhase += isThinking ? 0.06 : 0.02
      const pulse = Math.sin(pulsePhase) * 0.1 + 1

      // Outer glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2)
      glowGradient.addColorStop(0, "rgba(0, 212, 255, 0.4)")
      glowGradient.addColorStop(0.3, "rgba(30, 144, 255, 0.2)")
      glowGradient.addColorStop(0.6, "rgba(30, 144, 255, 0.1)")
      glowGradient.addColorStop(1, "transparent")
      ctx.fillStyle = glowGradient
      ctx.fillRect(0, 0, size, size)

      // Outer rotating ring
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(time * 0.5)
      
      const outerRadius = size * 0.4
      ctx.beginPath()
      ctx.arc(0, 0, outerRadius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(30, 144, 255, 0.3)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Rotating dashes
      for (let i = 0; i < 16; i++) {
        const angle = (i * 22.5 * Math.PI) / 180
        const length = i % 4 === 0 ? 12 : 6
        
        ctx.beginPath()
        ctx.moveTo(Math.cos(angle) * (outerRadius - length), Math.sin(angle) * (outerRadius - length))
        ctx.lineTo(Math.cos(angle) * (outerRadius + 2), Math.sin(angle) * (outerRadius + 2))
        ctx.strokeStyle = i % 4 === 0 ? "#00d4ff" : "rgba(30, 144, 255, 0.5)"
        ctx.lineWidth = i % 4 === 0 ? 2 : 1
        ctx.shadowColor = "#00d4ff"
        ctx.shadowBlur = 5
        ctx.stroke()
      }
      ctx.restore()

      // Middle ring (counter-rotating)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(-time * 0.3)
      
      const middleRadius = size * 0.3
      for (let i = 0; i < 8; i++) {
        const startAngle = (i * 45 * Math.PI) / 180
        const endAngle = startAngle + (35 * Math.PI / 180)
        
        ctx.beginPath()
        ctx.arc(0, 0, middleRadius, startAngle, endAngle)
        ctx.strokeStyle = "rgba(0, 212, 255, 0.6)"
        ctx.lineWidth = 3
        ctx.lineCap = "round"
        ctx.shadowColor = "#00d4ff"
        ctx.shadowBlur = 10
        ctx.stroke()
      }
      ctx.restore()

      // Inner energy ring
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(time * 0.8)
      
      const innerRingRadius = size * 0.2
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180
        const nextAngle = angle + (40 * Math.PI / 180)
        
        ctx.beginPath()
        ctx.arc(0, 0, innerRingRadius, angle, nextAngle)
        ctx.strokeStyle = `rgba(30, 144, 255, ${0.4 + Math.sin(time + i) * 0.3})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.restore()

      // Core orb with gradient
      const coreRadius = size * 0.12 * pulse
      const coreGradient = ctx.createRadialGradient(
        centerX - coreRadius * 0.3, 
        centerY - coreRadius * 0.3, 
        0,
        centerX, 
        centerY, 
        coreRadius
      )
      coreGradient.addColorStop(0, "rgba(255, 255, 255, 1)")
      coreGradient.addColorStop(0.2, "rgba(0, 212, 255, 0.95)")
      coreGradient.addColorStop(0.5, "rgba(30, 144, 255, 0.85)")
      coreGradient.addColorStop(1, "rgba(30, 144, 255, 0.4)")

      ctx.beginPath()
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = coreGradient
      ctx.shadowColor = "#00d4ff"
      ctx.shadowBlur = 25 * pulse
      ctx.fill()

      // Inner bright core
      ctx.beginPath()
      ctx.arc(centerX, centerY, size * 0.04, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.shadowColor = "#ffffff"
      ctx.shadowBlur = 15
      ctx.fill()

      // Floating data points
      ctx.save()
      ctx.translate(centerX, centerY)
      
      for (let i = 0; i < 4; i++) {
        const orbitRadius = size * 0.35
        const angle = time * (0.5 + i * 0.2) + (i * Math.PI / 2)
        const x = Math.cos(angle) * orbitRadius
        const y = Math.sin(angle) * orbitRadius * 0.3 // Flattened orbit
        
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#00d4ff"
        ctx.shadowColor = "#00d4ff"
        ctx.shadowBlur = 10
        ctx.fill()
      }
      ctx.restore()

      time += isThinking ? 0.04 : 0.015

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [size, isThinking])

  return (
    <div 
      className="relative"
      style={{ 
        width: size, 
        height: size,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
        }}
      />
      
      {/* Status text */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <span 
          className="text-[10px] font-mono tracking-[0.3em] opacity-90"
          style={{
            color: "#00d4ff",
            textShadow: "0 0 10px #00d4ff",
            marginTop: size * 0.38,
          }}
        >
          {isThinking ? "PROCESSING" : "ONLINE"}
        </span>
      </div>
    </div>
  )
}
