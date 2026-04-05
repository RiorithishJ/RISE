"use client"

import { useEffect, useState, useRef } from "react"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([])
  const [isHovering, setIsHovering] = useState(false)
  const trailIdRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      
      trailIdRef.current++
      setTrail((prev) => [
        ...prev.slice(-8),
        { x: e.clientX, y: e.clientY, id: trailIdRef.current },
      ])
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseover", handleMouseOver)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseover", handleMouseOver)
    }
  }, [])

  return (
    <>
      {/* Trail */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="fixed pointer-events-none"
          style={{
            left: point.x,
            top: point.y,
            zIndex: 9998,
            width: 4 + index * 0.5,
            height: 4 + index * 0.5,
            background: `rgba(0, 245, 255, ${0.1 + index * 0.05})`,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${5 + index * 2}px rgba(0, 245, 255, ${0.2 + index * 0.05})`,
          }}
        />
      ))}

      {/* Main cursor crosshair */}
      <div
        className="fixed pointer-events-none transition-transform duration-75"
        style={{
          left: position.x,
          top: position.y,
          zIndex: 9999,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
        }}
      >
        {/* Horizontal line */}
        <div
          className="absolute"
          style={{
            width: isHovering ? 40 : 30,
            height: 2,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(90deg, transparent, #00f5ff, transparent)",
            boxShadow: "0 0 10px #00f5ff, 0 0 20px #00f5ff",
          }}
        />
        {/* Vertical line */}
        <div
          className="absolute"
          style={{
            width: 2,
            height: isHovering ? 40 : 30,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(180deg, transparent, #00f5ff, transparent)",
            boxShadow: "0 0 10px #00f5ff, 0 0 20px #00f5ff",
          }}
        />
        {/* Center dot */}
        <div
          className="absolute"
          style={{
            width: 6,
            height: 6,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: "#00f5ff",
            borderRadius: "50%",
            boxShadow: "0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff",
          }}
        />
        {/* Corner brackets */}
        {[0, 90, 180, 270].map((rotation) => (
          <div
            key={rotation}
            className="absolute"
            style={{
              width: 8,
              height: 8,
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translate(${isHovering ? 18 : 14}px, 0)`,
              borderLeft: "2px solid #00f5ff",
              borderTop: "2px solid #00f5ff",
              boxShadow: "0 0 5px #00f5ff",
            }}
          />
        ))}
      </div>
    </>
  )
}
