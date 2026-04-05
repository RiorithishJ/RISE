"use client"

import { useState, useEffect } from "react"
import { 
  Zap, 
  Activity, 
  Cpu, 
  Database, 
  Settings, 
  Maximize2,
  Volume2
} from "lucide-react"

interface BottomBarProps {
  onMinimize: () => void
}

export function BottomBar({ onMinimize }: BottomBarProps) {
  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const agents = [
    { name: "Navigator", status: "active" },
    { name: "Coder", status: "idle" },
    { name: "Researcher", status: "active" },
  ]

  const quickActions = [
    { icon: Zap, label: "Quick Task" },
    { icon: Volume2, label: "Voice Mode" },
    { icon: Activity, label: "Analytics" },
    { icon: Settings, label: "Settings" },
  ]

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-14 px-6"
      style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 50%)",
        backdropFilter: "blur(10px)",
        zIndex: 50,
      }}
    >
      <div 
        className="h-full flex items-center justify-between mx-auto max-w-7xl rounded-t-xl px-4"
        style={{
          background: "rgba(0, 245, 255, 0.03)",
          borderTop: "1px solid rgba(0, 245, 255, 0.15)",
          borderLeft: "1px solid rgba(0, 245, 255, 0.1)",
          borderRight: "1px solid rgba(0, 245, 255, 0.1)",
        }}
      >
        {/* Left - Agent Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00f5ff]" />
            <span className="text-xs font-mono text-[rgba(0,245,255,0.6)]">
              OpenClaw Agents
            </span>
          </div>
          <div className="flex items-center gap-3">
            {agents.map((agent) => (
              <div 
                key={agent.name}
                className="flex items-center gap-2 px-2 py-1 rounded-md"
                style={{
                  background: "rgba(0, 245, 255, 0.05)",
                  border: "1px solid rgba(0, 245, 255, 0.1)",
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: agent.status === "active" ? "#00ff88" : "#666",
                    boxShadow: agent.status === "active" 
                      ? "0 0 8px #00ff88" 
                      : "none",
                  }}
                />
                <span className="text-[10px] font-mono text-white/60">
                  {agent.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Quick Actions */}
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="p-2 rounded-lg transition-all hover:bg-[rgba(0,245,255,0.1)]"
              style={{
                border: "1px solid rgba(0, 245, 255, 0.1)",
              }}
              title={action.label}
            >
              <action.icon className="w-4 h-4 text-[#00f5ff]" />
            </button>
          ))}
        </div>

        {/* Right - Session Info & Controls */}
        <div className="flex items-center gap-4">
          {/* Session Time */}
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#7b2fff]" />
            <div className="text-right">
              <span className="text-[10px] font-mono text-white/40 block">
                Session
              </span>
              <span 
                className="text-sm font-mono font-bold"
                style={{ color: "#00f5ff" }}
              >
                {formatTime(sessionTime)}
              </span>
            </div>
          </div>

          {/* Minimize Button */}
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg transition-all hover:bg-[rgba(0,245,255,0.1)]"
            style={{
              border: "1px solid rgba(0, 245, 255, 0.2)",
            }}
            title="Minimize to orb"
          >
            <Maximize2 className="w-4 h-4 text-[#00f5ff]" />
          </button>
        </div>
      </div>
    </div>
  )
}
