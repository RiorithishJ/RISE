"use client"

import { useState, useEffect } from "react"
import { HolographicPanel } from "./holographic-panel"
import { RiseAvatar } from "./rise-avatar"
import { CircularGauge } from "./circular-gauge"
import { StatusIndicator } from "./status-indicator"

interface StatusHubProps {
  isThinking: boolean
}

export function StatusHub({ isThinking }: StatusHubProps) {
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    ram: 62,
    gpu: 38,
  })

  // Simulate live stats
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats({
        cpu: 40 + Math.random() * 30,
        ram: 55 + Math.random() * 20,
        gpu: 30 + Math.random() * 25,
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <HolographicPanel 
      title="Status Hub" 
      className="h-full"
      delay={200}
    >
      <div className="flex flex-col h-full p-4 gap-4">
        {/* RISE Avatar */}
        <div className="flex justify-center py-4">
          <RiseAvatar isThinking={isThinking} size={140} />
        </div>

        {/* System Stats */}
        <div className="flex-1">
          <h3 
            className="text-xs font-mono tracking-[0.2em] uppercase mb-4 text-[rgba(0,245,255,0.6)]"
          >
            System Status
          </h3>
          
          <div className="flex justify-around mb-6">
            <CircularGauge 
              value={systemStats.cpu} 
              label="CPU" 
              color="#00f5ff"
              size={70}
            />
            <CircularGauge 
              value={systemStats.ram} 
              label="RAM" 
              color="#7b2fff"
              size={70}
            />
            <CircularGauge 
              value={systemStats.gpu} 
              label="GPU" 
              color="#0066ff"
              size={70}
            />
          </div>

          {/* Connection Status */}
          <div className="space-y-2">
            <StatusIndicator 
              label="Ollama" 
              status="online" 
              detail="llama3.2"
            />
            <StatusIndicator 
              label="OpenClaw" 
              status="processing" 
              detail="Connected"
            />
            <StatusIndicator 
              label="Neural Core" 
              status="online" 
              detail="Active"
            />
            <StatusIndicator 
              label="Memory Bank" 
              status="online" 
              detail="2.4 GB"
            />
          </div>
        </div>

        {/* AI Status */}
        <div 
          className="mt-auto pt-4 border-t border-[rgba(0,245,255,0.1)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[rgba(255,255,255,0.5)]">
              AI STATE
            </span>
            <span 
              className="text-xs font-mono font-bold"
              style={{
                color: isThinking ? "#00f5ff" : "#00ff88",
                textShadow: isThinking 
                  ? "0 0 10px #00f5ff" 
                  : "0 0 10px #00ff88",
              }}
            >
              {isThinking ? "PROCESSING" : "READY"}
            </span>
          </div>
        </div>
      </div>
    </HolographicPanel>
  )
}
