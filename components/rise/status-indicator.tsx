"use client"

interface StatusIndicatorProps {
  label: string
  status: "online" | "offline" | "warning" | "processing"
  detail?: string
}

export function StatusIndicator({ label, status, detail }: StatusIndicatorProps) {
  const colors = {
    online: "#00ff88",
    offline: "#ff0055",
    warning: "#ffaa00",
    processing: "#00f5ff",
  }

  const color = colors[status]

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/30 border border-[rgba(0,245,255,0.1)]">
      <div className="flex items-center gap-3">
        <div 
          className="relative w-3 h-3"
        >
          {/* Outer pulse ring */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: color,
              opacity: 0.3,
              animation: status === "processing" ? "thinking-pulse 1.5s ease-in-out infinite" : 
                         status === "online" ? "pulse-glow 2s ease-in-out infinite" : "none",
            }}
          />
          {/* Core dot */}
          <div 
            className="absolute inset-[2px] rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
            }}
          />
        </div>
        <span className="text-xs font-mono text-[rgba(255,255,255,0.8)]">
          {label}
        </span>
      </div>
      {detail && (
        <span 
          className="text-[10px] font-mono"
          style={{ color }}
        >
          {detail}
        </span>
      )}
    </div>
  )
}
