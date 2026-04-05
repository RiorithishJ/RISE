"use client"

import { useEffect, useRef } from "react"

interface Star {
  x: number
  y: number
  z: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize stars
    const starCount = 300
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))

    let time = 0

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.016

      starsRef.current.forEach((star) => {
        // Move stars toward viewer (parallax effect)
        star.z -= 0.5
        if (star.z <= 0) {
          star.z = 1000
          star.x = Math.random() * canvas.width
          star.y = Math.random() * canvas.height
        }

        // Calculate 3D projection
        const scale = 1000 / (1000 + star.z)
        const x2d = (star.x - canvas.width / 2) * scale + canvas.width / 2
        const y2d = (star.y - canvas.height / 2) * scale + canvas.height / 2
        const size = star.size * scale

        // Twinkle effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5
        const opacity = star.opacity * twinkle * scale

        // Draw star with glow
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3)
        gradient.addColorStop(0, `rgba(0, 245, 255, ${opacity})`)
        gradient.addColorStop(0.3, `rgba(0, 245, 255, ${opacity * 0.5})`)
        gradient.addColorStop(1, "rgba(0, 245, 255, 0)")

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core of the star
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.arc(x2d, y2d, size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
