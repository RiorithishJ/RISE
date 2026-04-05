"use client"

import { useEffect, useRef } from "react"

interface CircularHUDProps {
  value: number
  label: string
  unit?: string
  size?: number
  color?: string
  maxValue?: number
}

export function CircularHUD({ 
  value, 
  label, 
  unit = "%",
  size = 100, 
  color = "#1e90ff",
  maxValue = 100 
}: CircularHUDProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const currentValue = useRef(0)

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

    const animate = () => {
      ctx.clearRect(0, 0, size, size)
      
      const centerX = size / 2
      const centerY = size / 2
      const radius = size * 0.4

      // Smooth value transition
      currentValue.current += (value - currentValue.current) * 0.05
      const displayValue = Math.round(currentValue.current)

      // Background ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(30, 144, 255, 0.15)"
      ctx.lineWidth = 6
      ctx.stroke()

      // Progress arc
      const progress = (currentValue.current / maxValue) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress)
      ctx.strokeStyle = color
      ctx.lineWidth = 6
      ctx.lineCap = "round"
      ctx.shadowColor = color
      ctx.shadowBlur = 15
      ctx.stroke()

      // Tick marks
      ctx.save()
      ctx.translate(centerX, centerY)
      for (let i = 0; i < 24; i++) {
        const tickAngle = (i * 15 * Math.PI) / 180
        const innerR = radius - 12
        const outerR = radius - 8
        
        ctx.beginPath()
        ctx.moveTo(Math.cos(tickAngle) * innerR, Math.sin(tickAngle) * innerR)
        ctx.lineTo(Math.cos(tickAngle) * outerR, Math.sin(tickAngle) * outerR)
        ctx.strokeStyle = i % 6 === 0 ? color : "rgba(30, 144, 255, 0.3)"
        ctx.lineWidth = i % 6 === 0 ? 2 : 1
        ctx.shadowBlur = 0
        ctx.stroke()
      }
      ctx.restore()

      // Rotating indicator dot
      ctx.save()
      ctx.translate(centerX, centerY)
      const dotAngle = angle
      const dotRadius = radius + 8
      ctx.beginPath()
      ctx.arc(
        Math.cos(dotAngle) * dotRadius,
        Math.sin(dotAngle) * dotRadius,
        2,
        0,
        Math.PI * 2
      )
      ctx.fillStyle = "#00d4ff"
      ctx.shadowColor = "#00d4ff"
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.restore()

      angle += 0.02

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [value, size, color, maxValue])

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <span 
          className="text-lg font-mono font-bold hud-value"
          style={{ color, textShadow: `0 0 10px ${color}` }}
        >
          {Math.round(value)}{unit}
        </span>
      </div>
      <span 
        className="mt-1 text-[10px] font-mono tracking-[0.2em] uppercase"
        style={{ color: "rgba(30, 144, 255, 0.7)" }}
      >
        {label}
      </span>
    </div>
  )
}
