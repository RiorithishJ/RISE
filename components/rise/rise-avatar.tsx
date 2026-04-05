"use client"

import { useEffect, useRef, useState } from "react"

interface RiseAvatarProps {
  isThinking?: boolean
  size?: number
}

export function RiseAvatar({ isThinking = false, size = 120 }: RiseAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = size * 2
    canvas.height = size * 2

    let angle = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const hexRadius = size * 0.35

      // Draw rotating hexagon layers
      for (let layer = 0; layer < 3; layer++) {
        const layerRadius = hexRadius * (1 - layer * 0.15)
        const layerAngle = angle + layer * 20
        const opacity = 1 - layer * 0.3

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate((layerAngle * Math.PI) / 180)

        // Draw hexagon
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const x = layerRadius * Math.cos((i * 60 * Math.PI) / 180)
          const y = layerRadius * Math.sin((i * 60 * Math.PI) / 180)
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()

        // Glow effect
        ctx.shadowColor = layer === 0 ? "#00f5ff" : "#7b2fff"
        ctx.shadowBlur = isThinking ? 30 : 20
        ctx.strokeStyle = layer === 0 
          ? `rgba(0, 245, 255, ${opacity})` 
          : `rgba(123, 47, 255, ${opacity * 0.7})`
        ctx.lineWidth = 2
        ctx.stroke()

        if (layer === 0) {
          ctx.fillStyle = "rgba(0, 245, 255, 0.1)"
          ctx.fill()
        }

        ctx.restore()
      }

      // Draw "RISE" text in center
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.font = `bold ${size * 0.15}px Orbitron, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#00f5ff"
      ctx.shadowColor = "#00f5ff"
      ctx.shadowBlur = isThinking ? 20 : 10
      ctx.fillText("RISE", 0, 0)
      ctx.restore()

      // Draw energy ring
      const ringRadius = hexRadius * 1.3
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(0, 245, 255, 0.2)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw energy arc
      const arcStart = (angle * Math.PI) / 180
      const arcEnd = arcStart + Math.PI * 0.5
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, arcStart, arcEnd)
      ctx.strokeStyle = "#00f5ff"
      ctx.lineWidth = 3
      ctx.shadowColor = "#00f5ff"
      ctx.shadowBlur = 15
      ctx.stroke()

      // Opposite arc
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, arcStart + Math.PI, arcEnd + Math.PI)
      ctx.strokeStyle = "#7b2fff"
      ctx.lineWidth = 3
      ctx.shadowColor = "#7b2fff"
      ctx.shadowBlur = 15
      ctx.stroke()

      // Update rotation
      angle += isThinking ? 2 : 0.5
      setRotation(angle)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isThinking, size])

  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          filter: isThinking ? "brightness(1.2)" : "brightness(1)",
          animation: isThinking ? "thinking-pulse 1s ease-in-out infinite" : "none",
        }}
      />
      
      {/* Thinking indicator */}
      {isThinking && (
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#00f5ff]"
              style={{
                animation: "thinking-pulse 1s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
                boxShadow: "0 0 10px #00f5ff",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
