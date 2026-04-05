"use client"

import { useState, useEffect, useRef } from "react"
import { HUDPanel } from "./hud-panel"
import { Activity, Cpu, HardDrive, Wifi, Shield, Zap } from "lucide-react"

interface SystemMonitorProps {}

export function SystemMonitor({}: SystemMonitorProps) {
  const [metrics, setMetrics] = useState({
    bandwidth: 847,
    latency: 12,
    threats: 0,
    connections: 24,
  })
  
  const [graphData, setGraphData] = useState<number[]>(Array(30).fill(50))
  const [isScanning, setIsScanning] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [scanResult, setScanResult] = useState<null | {
    cpu: number
    ram: string
    gpuVram: string
    disk: string
    temp?: string
  }>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        bandwidth: 800 + Math.random() * 200,
        latency: 8 + Math.random() * 10,
        threats: 0,
        connections: 20 + Math.floor(Math.random() * 10),
      })
      
      setGraphData(prev => [...prev.slice(1), 40 + Math.random() * 40])
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    ctx.clearRect(0, 0, width, height)

    // Grid
    ctx.strokeStyle = "rgba(30, 144, 255, 0.1)"
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Data line
    ctx.beginPath()
    ctx.strokeStyle = "#1e90ff"
    ctx.lineWidth = 2
    ctx.shadowColor = "#1e90ff"
    ctx.shadowBlur = 10

    const stepX = width / (graphData.length - 1)
    graphData.forEach((value, index) => {
      const x = index * stepX
      const y = height - (value / 100) * height
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Fill gradient
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "rgba(30, 144, 255, 0.3)")
    gradient.addColorStop(1, "rgba(30, 144, 255, 0)")
    ctx.fillStyle = gradient
    ctx.shadowBlur = 0
    ctx.fill()

  }, [graphData])

  const tasks = [
    { name: "Security Scan", progress: 100, status: "complete" },
    { name: "Data Sync", progress: 67, status: "running" },
    { name: "Analysis Queue", progress: 34, status: "running" },
  ]

  const handleScan = async () => {
    setIsScanning(true)

    try {
      const response = await fetch("/api/status")
      const data = await response.json()

      if (data?.error) {
        throw new Error(data.error)
      }

      const ram = data?.ram ? `${data.ram.used}/${data.ram.total} MB` : "N/A"
      const gpuVram = data?.gpu
        ? `${data.gpu.memoryUsed}/${data.gpu.memoryTotal} MB (${data.gpu.utilization}%)`
        : "N/A"
      const disk = data?.disk ? `${data.disk.used}/${data.disk.total} (${data.disk.percent})` : "N/A"

      setScanResult({
        cpu: Math.round(Number(data?.cpu?.usage ?? 0)),
        ram,
        gpuVram,
        disk,
        temp: data?.gpu?.temperature ? `${data.gpu.temperature}°C` : undefined,
      })
    } catch {
      setScanResult({
        cpu: 0,
        ram: "Unavailable",
        gpuVram: "Unavailable",
        disk: "Unavailable",
      })
    } finally {
      setTimeout(() => setIsScanning(false), 700)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const raw = localStorage.getItem("rise_memory")
      const memory = raw ? JSON.parse(raw) : { conversations: [] }
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const payload = {
        ...memory,
        syncedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rise_chat_backup_${timestamp}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setTimeout(() => setIsSyncing(false), 900)
    }
  }

  const handleAnalyze = () => {
    window.dispatchEvent(
      new CustomEvent("rise:analyze", {
        detail: {
          prompt:
            "Analyze our conversation so far. What are my patterns? What should I focus on?",
        },
      }),
    )
  }

  return (
    <HUDPanel 
      title="System Monitor" 
      className="h-full"
      delay={600}
    >
      <div className="flex flex-col h-full p-4">
        {isScanning && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0, 212, 255, 0.12) 8px, rgba(0, 212, 255, 0.12) 10px)",
              animation: "scanline 1.1s linear infinite",
              zIndex: 2,
            }}
          />
        )}
        {/* Network Graph */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-wider text-[rgba(30,144,255,0.6)]">NETWORK ACTIVITY</span>
            <Activity className="w-3 h-3 text-[#1e90ff]" />
          </div>
          <canvas 
            ref={canvasRef}
            className="w-full h-20"
            style={{ background: "rgba(30, 144, 255, 0.02)" }}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className="p-3"
            style={{
              background: "rgba(30, 144, 255, 0.05)",
              border: "1px solid rgba(30, 144, 255, 0.15)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-3 h-3 text-[#1e90ff]" />
              <span className="text-[9px] font-mono text-[rgba(30,144,255,0.6)] tracking-wider">BANDWIDTH</span>
            </div>
            <span className="text-lg font-mono font-bold text-[#1e90ff] hud-value">
              {Math.round(metrics.bandwidth)} <span className="text-xs">MB/s</span>
            </span>
          </div>

          <div 
            className="p-3"
            style={{
              background: "rgba(30, 144, 255, 0.05)",
              border: "1px solid rgba(30, 144, 255, 0.15)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-[#00d4ff]" />
              <span className="text-[9px] font-mono text-[rgba(30,144,255,0.6)] tracking-wider">LATENCY</span>
            </div>
            <span className="text-lg font-mono font-bold text-[#00d4ff] hud-value">
              {Math.round(metrics.latency)} <span className="text-xs">ms</span>
            </span>
          </div>

          <div 
            className="p-3"
            style={{
              background: "rgba(0, 255, 136, 0.05)",
              border: "1px solid rgba(0, 255, 136, 0.15)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3 h-3 text-[#00ff88]" />
              <span className="text-[9px] font-mono text-[rgba(0,255,136,0.6)] tracking-wider">THREATS</span>
            </div>
            <span className="text-lg font-mono font-bold text-[#00ff88] hud-value">
              {metrics.threats}
            </span>
          </div>

          <div 
            className="p-3"
            style={{
              background: "rgba(30, 144, 255, 0.05)",
              border: "1px solid rgba(30, 144, 255, 0.15)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-3 h-3 text-[#1e90ff]" />
              <span className="text-[9px] font-mono text-[rgba(30,144,255,0.6)] tracking-wider">NODES</span>
            </div>
            <span className="text-lg font-mono font-bold text-[#1e90ff] hud-value">
              {metrics.connections}
            </span>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-wider text-[rgba(30,144,255,0.6)]">ACTIVE PROCESSES</span>
            <Cpu className="w-3 h-3 text-[#1e90ff]" />
          </div>
          
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-white/80">{task.name}</span>
                  <span 
                    className="text-[10px] font-mono"
                    style={{ 
                      color: task.status === "complete" ? "#00ff88" : "#00d4ff" 
                    }}
                  >
                    {task.progress}%
                  </span>
                </div>
                <div 
                  className="h-1 w-full"
                  style={{ background: "rgba(30, 144, 255, 0.15)" }}
                >
                  <div 
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${task.progress}%`,
                      background: task.status === "complete" 
                        ? "#00ff88" 
                        : "linear-gradient(90deg, #1e90ff, #00d4ff)",
                      boxShadow: task.status === "complete"
                        ? "0 0 10px rgba(0, 255, 136, 0.5)"
                        : "0 0 10px rgba(30, 144, 255, 0.5)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {scanResult && (
            <div
              className="mt-4 p-3 text-[11px] font-mono space-y-1"
              style={{
                background: "rgba(0, 212, 255, 0.06)",
                border: "1px solid rgba(0, 212, 255, 0.25)",
              }}
            >
              <div className="text-[#00d4ff] tracking-wider">SCAN RESULT</div>
              <div>CPU/GPU UTIL: {scanResult.cpu}%</div>
              <div>RAM: {scanResult.ram}</div>
              <div>GPU VRAM: {scanResult.gpuVram}</div>
              <div>DISK: {scanResult.disk}</div>
              {scanResult.temp && <div>GPU TEMP: {scanResult.temp}</div>}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-auto pt-3 border-t border-[rgba(30,144,255,0.15)]">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleScan}
              className="py-2 text-[10px] font-mono tracking-wider transition-all hover:scale-105"
              style={{
                background: isScanning ? "rgba(0, 212, 255, 0.2)" : "rgba(30, 144, 255, 0.1)",
                border: "1px solid rgba(30, 144, 255, 0.3)",
                color: "#1e90ff",
                clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
                animation: isScanning ? "pulse-glow 0.8s linear infinite" : undefined,
              }}
            >
              {isScanning ? "SCANNING..." : "SCAN"}
            </button>

            <button
              onClick={handleSync}
              className="py-2 text-[10px] font-mono tracking-wider transition-all hover:scale-105"
              style={{
                background: isSyncing ? "rgba(0, 255, 136, 0.2)" : "rgba(30, 144, 255, 0.1)",
                border: "1px solid rgba(30, 144, 255, 0.3)",
                color: isSyncing ? "#00ff88" : "#1e90ff",
                clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
              }}
            >
              {isSyncing ? "SYNCING..." : "SYNC"}
            </button>

            <button
              onClick={handleAnalyze}
              className="py-2 text-[10px] font-mono tracking-wider transition-all hover:scale-105"
              style={{
                background: "rgba(30, 144, 255, 0.1)",
                border: "1px solid rgba(30, 144, 255, 0.3)",
                color: "#1e90ff",
                clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
              }}
            >
              ANALYZE
            </button>
          </div>
          {isSyncing && (
            <div className="text-[10px] font-mono text-[#00ff88] mt-2 tracking-wider">SYNC COMPLETE</div>
          )}
        </div>
      </div>
    </HUDPanel>
  )
}
