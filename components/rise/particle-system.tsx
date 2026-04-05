"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  life: number
  maxLife: number
  color: string
}

export function ParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })

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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)

    const colors = [
      "rgba(0, 245, 255, 0.8)",
      "rgba(123, 47, 255, 0.8)",
      "rgba(0, 102, 255, 0.6)",
    ]

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 500,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      life: 0,
      maxLife: Math.random() * 200 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    })

    // Initialize particles
    particlesRef.current = Array.from({ length: 100 }, createParticle)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += particle.vz
        particle.life++

        // Mouse influence
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          particle.vx += dx * 0.0001
          particle.vy += dy * 0.0001
        }

        // Reset particle if out of bounds or life ended
        if (
          particle.life > particle.maxLife ||
          particle.x < 0 ||
          particle.x > canvas.width ||
          particle.y < 0 ||
          particle.y > canvas.height ||
          particle.z < 0 ||
          particle.z > 500
        ) {
          particlesRef.current[index] = createParticle()
          return
        }

        // Calculate 3D projection
        const scale = 500 / (500 + particle.z)
        const x2d = (particle.x - canvas.width / 2) * scale + canvas.width / 2
        const y2d = (particle.y - canvas.height / 2) * scale + canvas.height / 2
        const size = particle.size * scale

        // Life-based opacity
        const lifeRatio = 1 - particle.life / particle.maxLife
        const opacity = lifeRatio * 0.8

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 4)
        gradient.addColorStop(0, particle.color.replace("0.8", String(opacity)))
        gradient.addColorStop(0.5, particle.color.replace("0.8", String(opacity * 0.3)))
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(x2d, y2d, size * 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw connections between nearby particles
      ctx.strokeStyle = "rgba(0, 245, 255, 0.05)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            const opacity = (1 - dist / 100) * 0.2
            ctx.strokeStyle = `rgba(0, 245, 255, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  )
}
