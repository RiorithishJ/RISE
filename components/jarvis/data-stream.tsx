"use client"

import { useEffect, useState, useRef } from "react"

interface DataStreamProps {
  className?: string
}

export function DataStream({ className = "" }: DataStreamProps) {
  const [data, setData] = useState<{ id: number; value: string; x: number }[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      idRef.current++
      const newData = {
        id: idRef.current,
        value: Math.random().toString(16).slice(2, 10).toUpperCase(),
        x: Math.random() * 100,
      }
      
      setData(prev => [...prev.slice(-15), newData])
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {data.map((item) => (
        <div
          key={item.id}
          className="absolute text-[8px] font-mono opacity-30"
          style={{
            left: `${item.x}%`,
            animation: "data-scroll 4s linear forwards",
            color: "#1e90ff",
          }}
        >
          {item.value}
        </div>
      ))}
    </div>
  )
}
