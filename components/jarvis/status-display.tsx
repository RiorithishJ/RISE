"use client"

import { useState, useEffect } from "react"
import { HUDPanel } from "./hud-panel"
import { CircularHUD } from "./circular-hud"
import { AIOrb } from "./ai-orb"

interface StatusDisplayProps {
  isThinking: boolean
}

export function StatusDisplay({ isThinking }: StatusDisplayProps) {
  const [systemStats, setSystemStats] = useState({
    power: 98,
    neural: 87,
    sync: 94,
  })

  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats({
        power: 95 + Math.random() * 5,
        neural: 80 + Math.random() * 15,
        sync: 90 + Math.random() * 10,
      })
      setTime(new Date())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <HUDPanel 
      title="System Status" 
      className="h-full"
      delay={200}
    >
      <div className="flex flex-col h-full p-4">
        {/* AI Orb */}
        <div className="flex justify-center py-2">
          <AIOrb size={160} isThinking={isThinking} />
        </div>

        {/* Status Metrics */}
        <div className="flex justify-around py-4">
          <CircularHUD 
            value={systemStats.power} 
            label="Power" 
            color="#1e90ff"
            size={80}
          />
          <CircularHUD 
            value={systemStats.neural} 
            label="Neural" 
            color="#00d4ff"
            size={80}
          />
          <CircularHUD 
            value={systemStats.sync} 
            label="Sync" 
            color="#1e90ff"
            size={80}
          />
        </div>

        {/* System Info */}
        <div className="flex-1 space-y-3 mt-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[rgba(30,144,255,0.6)] tracking-wider">CORE STATUS</span>
            <span 
              className="px-2 py-0.5"
              style={{
                color: "#00ff88",
                background: "rgba(0, 255, 136, 0.1)",
                border: "1px solid rgba(0, 255, 136, 0.3)",
              }}
            >
              NOMINAL
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[rgba(30,144,255,0.6)] tracking-wider">AI ENGINE</span>
            <span 
              className="px-2 py-0.5"
              style={{
                color: isThinking ? "#00d4ff" : "#1e90ff",
                background: isThinking ? "rgba(0, 212, 255, 0.1)" : "rgba(30, 144, 255, 0.1)",
                border: `1px solid ${isThinking ? "rgba(0, 212, 255, 0.3)" : "rgba(30, 144, 255, 0.3)"}`,
              }}
            >
              {isThinking ? "COMPUTING" : "READY"}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[rgba(30,144,255,0.6)] tracking-wider">MEMORY</span>
            <span className="text-[#1e90ff] hud-value">2.4 TB</span>
          </div>

          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[rgba(30,144,255,0.6)] tracking-wider">UPTIME</span>
            <span className="text-[#1e90ff] hud-value">47:23:15</span>
          </div>
        </div>

        {/* Time Display */}
        <div 
          className="mt-auto pt-3 border-t border-[rgba(30,144,255,0.15)] text-center"
        >
          <div 
            className="text-2xl font-mono font-bold tracking-wider"
            style={{
              color: "#1e90ff",
              textShadow: "0 0 20px rgba(30, 144, 255, 0.5)",
            }}
          >
            {time.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: "Asia/Kolkata",
            })}
          </div>
          <div className="text-[10px] font-mono text-[rgba(30,144,255,0.5)] tracking-[0.3em] mt-1">
            {time
              .toLocaleDateString("en-IN", {
                weekday: "long",
                month: "short",
                day: "numeric",
                timeZone: "Asia/Kolkata",
              })
              .toUpperCase()}
          </div>
        </div>
      </div>
    </HUDPanel>
  )
}
