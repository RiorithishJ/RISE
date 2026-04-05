"use client"

import { useEffect, useRef } from "react"

export function HUDOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    let angle = 0
    let frame = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw corner brackets
      const cornerSize = 80
      const cornerOffset = 40
      ctx.strokeStyle = "rgba(30, 144, 255, 0.4)"
      ctx.lineWidth = 2

      // Top left
      ctx.beginPath()
      ctx.moveTo(cornerOffset, cornerOffset + cornerSize)
      ctx.lineTo(cornerOffset, cornerOffset)
      ctx.lineTo(cornerOffset + cornerSize, cornerOffset)
      ctx.stroke()

      // Top right
      ctx.beginPath()
      ctx.moveTo(canvas.width - cornerOffset - cornerSize, cornerOffset)
      ctx.lineTo(canvas.width - cornerOffset, cornerOffset)
      ctx.lineTo(canvas.width - cornerOffset, cornerOffset + cornerSize)
      ctx.stroke()

      // Bottom left
      ctx.beginPath()
      ctx.moveTo(cornerOffset, canvas.height - cornerOffset - cornerSize)
      ctx.lineTo(cornerOffset, canvas.height - cornerOffset)
      ctx.lineTo(cornerOffset + cornerSize, canvas.height - cornerOffset)
      ctx.stroke()

      // Bottom right
      ctx.beginPath()
      ctx.moveTo(canvas.width - cornerOffset - cornerSize, canvas.height - cornerOffset)
      ctx.lineTo(canvas.width - cornerOffset, canvas.height - cornerOffset)
      ctx.lineTo(canvas.width - cornerOffset, canvas.height - cornerOffset - cornerSize)
      ctx.stroke()

      // Draw rotating outer ring (subtle)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle)
      
      const ringRadius = Math.min(canvas.width, canvas.height) * 0.45
      ctx.strokeStyle = "rgba(30, 144, 255, 0.08)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Tick marks on outer ring
      for (let i = 0; i < 72; i++) {
        const tickAngle = (i * 5 * Math.PI) / 180
        const innerR = ringRadius - (i % 9 === 0 ? 15 : 8)
        const outerR = ringRadius
        
        ctx.beginPath()
        ctx.moveTo(Math.cos(tickAngle) * innerR, Math.sin(tickAngle) * innerR)
        ctx.lineTo(Math.cos(tickAngle) * outerR, Math.sin(tickAngle) * outerR)
        ctx.strokeStyle = i % 9 === 0 ? "rgba(30, 144, 255, 0.3)" : "rgba(30, 144, 255, 0.1)"
        ctx.lineWidth = i % 9 === 0 ? 2 : 1
        ctx.stroke()
      }
      ctx.restore()

      // Draw inner rotating elements
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(-angle * 0.5)
      
      const innerRingRadius = Math.min(canvas.width, canvas.height) * 0.35
      ctx.strokeStyle = "rgba(255, 107, 53, 0.1)"
      ctx.lineWidth = 1
      ctx.setLineDash([20, 40])
      ctx.beginPath()
      ctx.arc(0, 0, innerRingRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // Scanning line
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle * 2)
      
      const gradient = ctx.createLinearGradient(0, 0, ringRadius * 0.8, 0)
      gradient.addColorStop(0, "rgba(30, 144, 255, 0.5)")
      gradient.addColorStop(1, "transparent")
      
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(ringRadius * 0.8, 0)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.shadowColor = "#1e90ff"
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.restore()

      // Data readouts at corners
      ctx.font = "10px 'Geist Mono', monospace"
      ctx.fillStyle = "rgba(30, 144, 255, 0.5)"
      
      // Top left data
      ctx.textAlign = "left"
      ctx.fillText(`SYS.TIME: ${new Date().toLocaleTimeString()}`, cornerOffset + 20, cornerOffset + cornerSize + 30)
      ctx.fillText(`FRAME: ${frame.toString().padStart(6, "0")}`, cornerOffset + 20, cornerOffset + cornerSize + 45)
      
      // Top right data
      ctx.textAlign = "right"
      ctx.fillText(`LAT: 40.7128° N`, canvas.width - cornerOffset - 20, cornerOffset + cornerSize + 30)
      ctx.fillText(`LON: 74.0060° W`, canvas.width - cornerOffset - 20, cornerOffset + cornerSize + 45)

      // Bottom readouts
      ctx.textAlign = "left"
      ctx.fillText(`STATUS: NOMINAL`, cornerOffset + 20, canvas.height - cornerOffset - cornerSize - 30)
      
      ctx.textAlign = "right"
      ctx.fillText(`STARK INDUSTRIES`, canvas.width - cornerOffset - 20, canvas.height - cornerOffset - cornerSize - 30)

      angle += 0.002
      frame++

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  )
}
