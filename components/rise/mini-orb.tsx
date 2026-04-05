"use client"

import { useState, useRef, useEffect } from "react"

interface MiniOrbProps {
  lastMessage: string
  onExpand: () => void
}

export function MiniOrb({ lastMessage, onExpand }: MiniOrbProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const orbRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Initialize position to bottom right
    setPosition({
      x: window.innerWidth - 100,
      y: window.innerHeight - 100,
    })
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!orbRef.current) return
    setIsDragging(true)
    const rect = orbRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const handleClick = () => {
    if (!isDragging) {
      onExpand()
    }
  }

  return (
    <div
      ref={orbRef}
      className="fixed z-[1000] cursor-pointer"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow rings */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          width: 80,
          height: 80,
          left: -15,
          top: -15,
          background: "radial-gradient(circle, rgba(0, 245, 255, 0.2) 0%, transparent 70%)",
          animation: "orb-pulse 2s ease-in-out infinite",
        }}
      />

      {/* Main orb */}
      <div
        className="relative w-[50px] h-[50px] rounded-full transition-transform duration-300"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(0, 245, 255, 0.8) 0%, rgba(123, 47, 255, 0.6) 50%, rgba(0, 0, 0, 0.9) 100%)",
          boxShadow: `
            0 0 30px rgba(0, 245, 255, 0.5),
            0 0 60px rgba(0, 245, 255, 0.3),
            0 0 90px rgba(123, 47, 255, 0.2),
            inset 0 0 20px rgba(0, 245, 255, 0.3)
          `,
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          animation: "orb-pulse 2s ease-in-out infinite",
        }}
      >
        {/* Inner hexagon pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 30 30">
            <polygon
              points="15,2 27,9 27,21 15,28 3,21 3,9"
              fill="none"
              stroke="#00f5ff"
              strokeWidth="1.5"
              style={{
                filter: "drop-shadow(0 0 5px #00f5ff)",
                animation: "rotate-slow 10s linear infinite",
                transformOrigin: "center",
              }}
            />
          </svg>
        </div>
      </div>

      {/* Hover tooltip */}
      {isHovered && (
        <div
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3 rounded-lg"
          style={{
            background: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(0, 245, 255, 0.3)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 20px rgba(0, 245, 255, 0.2)",
          }}
        >
          <div className="text-xs font-mono text-white/50 mb-1">
            Last from RISE:
          </div>
          <div className="text-xs font-mono text-[#00f5ff] leading-relaxed">
            {lastMessage.slice(0, 100)}...
          </div>
          <div className="text-[10px] font-mono text-white/30 mt-2 text-center">
            Click to expand • Drag to reposition
          </div>
        </div>
      )}
    </div>
  )
}
