"use client"

import { useEffect, useRef, useState } from "react"

interface RadarChartProps {
  data: { label: string; value: number }[]
  size?: number
}

export function RadarChart({ data, size = 180 }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = size * 2
    canvas.height = size * 2

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = size * 0.7
    const sides = data.length
    const angleStep = (Math.PI * 2) / sides

    let angle = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((angle * Math.PI) / 180)

      // Draw background hexagon layers
      for (let layer = 5; layer >= 1; layer--) {
        const radius = (maxRadius / 5) * layer
        ctx.beginPath()
        for (let i = 0; i < sides; i++) {
          const x = radius * Math.cos(i * angleStep - Math.PI / 2)
          const y = radius * Math.sin(i * angleStep - Math.PI / 2)
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.1 + layer * 0.02})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw axis lines
      for (let i = 0; i < sides; i++) {
        const x = maxRadius * Math.cos(i * angleStep - Math.PI / 2)
        const y = maxRadius * Math.sin(i * angleStep - Math.PI / 2)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(x, y)
        ctx.strokeStyle = "rgba(0, 245, 255, 0.15)"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw data polygon
      ctx.beginPath()
      data.forEach((point, i) => {
        const radius = (point.value / 100) * maxRadius
        const x = radius * Math.cos(i * angleStep - Math.PI / 2)
        const y = radius * Math.sin(i * angleStep - Math.PI / 2)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.closePath()

      // Fill with gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius)
      gradient.addColorStop(0, "rgba(0, 245, 255, 0.3)")
      gradient.addColorStop(1, "rgba(123, 47, 255, 0.1)")
      ctx.fillStyle = gradient
      ctx.fill()

      // Stroke
      ctx.strokeStyle = "#00f5ff"
      ctx.lineWidth = 2
      ctx.shadowColor = "#00f5ff"
      ctx.shadowBlur = 10
      ctx.stroke()

      // Draw data points
      data.forEach((point, i) => {
        const radius = (point.value / 100) * maxRadius
        const x = radius * Math.cos(i * angleStep - Math.PI / 2)
        const y = radius * Math.sin(i * angleStep - Math.PI / 2)

        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#00f5ff"
        ctx.shadowColor = "#00f5ff"
        ctx.shadowBlur = 15
        ctx.fill()
      })

      // Draw sweep line
      const sweepAngle = (angle * Math.PI) / 180
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(
        maxRadius * Math.cos(sweepAngle),
        maxRadius * Math.sin(sweepAngle)
      )
      ctx.strokeStyle = "rgba(0, 245, 255, 0.8)"
      ctx.lineWidth = 2
      ctx.shadowColor = "#00f5ff"
      ctx.shadowBlur = 20
      ctx.stroke()

      ctx.restore()

      // Draw labels (not rotated)
      ctx.font = "10px 'Orbitron', monospace"
      ctx.fillStyle = "rgba(0, 245, 255, 0.7)"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      data.forEach((point, i) => {
        const labelRadius = maxRadius + 20
        const x = centerX + labelRadius * Math.cos(i * angleStep - Math.PI / 2)
        const y = centerY + labelRadius * Math.sin(i * angleStep - Math.PI / 2)
        ctx.fillText(point.label.toUpperCase(), x, y)
      })

      angle += 0.3
      setRotation(angle)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [data, size])

  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
    </div>
  )
}
