"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Lock, Mic, Send, Settings } from "lucide-react"
import type { ChatMessage } from "./types"
import { StatusDisplay } from "@/components/jarvis/status-display"
import { SystemMonitor } from "@/components/jarvis/system-monitor"
import { HUDOverlay } from "@/components/jarvis/hud-overlay"
import { DataStream } from "@/components/jarvis/data-stream"

interface UIDesign1Props {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  isThinking: boolean
  onSend: (forcedText?: string) => void
  onVoice: () => void
  onLock: () => void
  onToggleMode: () => void
}

export function UIDesign1({
  messages,
  input,
  setInput,
  isThinking,
  onSend,
  onVoice,
  onLock,
  onToggleMode,
}: UIDesign1Props) {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [showDevTools, setShowDevTools] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem("rise_devtools")
    if (saved === "hidden") setShowDevTools(false)
  }, [])

  const toggleDevTools = () => {
    setShowDevTools((prev) => {
      const next = !prev
      if (typeof window !== "undefined") {
        localStorage.setItem("rise_devtools", next ? "visible" : "hidden")
      }
      return next
    })
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#000810] relative text-white">
      {showDevTools && <HUDOverlay />}
      {showDevTools && <DataStream />}

      <button
        onClick={onToggleMode}
        className="fixed top-4 right-4 z-40 px-3 py-2 text-xs tracking-wider"
        style={{
          background: "rgba(0,245,255,.12)",
          border: "1px solid rgba(0,245,255,.45)",
          color: "#00f5ff",
        }}
      >
        SWITCH TO MODERN ⟷
      </button>

      <button
        onClick={onLock}
        className="fixed top-4 right-56 z-40 p-2"
        style={{
          border: "1px solid rgba(0,245,255,.45)",
          background: "rgba(0,245,255,.12)",
          color: "#00f5ff",
        }}
        title="Lock RISE"
      >
        <Lock size={16} />
      </button>

      {showDevTools && (
        <div
          className="fixed inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(30, 144, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(30, 144, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            zIndex: 1,
          }}
        />
      )}

      {showDevTools && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 30% 30%, rgba(30, 144, 255, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(0, 212, 255, 0.03) 0%, transparent 70%)
            `,
            zIndex: 2,
          }}
        />
      )}

      <div className="main-container relative z-10 h-screen w-screen overflow-hidden">
        <aside
          className="left-panel fixed left-0 top-0 h-screen p-4 overflow-y-auto z-20 transition-all duration-300"
          style={{ width: leftOpen ? "25%" : "0px", padding: leftOpen ? "1rem" : "0px" }}
        >
          <StatusDisplay isThinking={isThinking} />
        </aside>

        <button
          onClick={() => setLeftOpen((prev) => !prev)}
          className="fixed top-1/2 -translate-y-1/2 z-30 p-2"
          style={{
            left: leftOpen ? "calc(25% - 12px)" : "0px",
            background: "rgba(0, 212, 255, 0.15)",
            border: "1px solid rgba(0, 212, 255, 0.45)",
            color: "#00d4ff",
            boxShadow: "0 0 14px rgba(0, 212, 255, 0.35)",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 80%)",
          }}
          aria-label="Toggle left panel"
        >
          {leftOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <section
          className="center-panel h-screen p-4 overflow-hidden z-20 transition-all duration-300"
          style={{
            marginLeft: leftOpen ? "25%" : "0%",
            marginRight: rightOpen ? "25%" : "0%",
          }}
        >
          <div className="h-full flex flex-col gap-4 overflow-hidden">
            <header className="flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="px-4 py-2 text-sm font-mono tracking-[0.3em] uppercase"
                  style={{
                    background: "rgba(30, 144, 255, 0.1)",
                    border: "1px solid rgba(30, 144, 255, 0.3)",
                    color: "#1e90ff",
                    textShadow: "0 0 10px rgba(30, 144, 255, 0.5)",
                    clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  R.I.S.E. INTERFACE
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "#00ff88",
                      boxShadow: "0 0 10px #00ff88",
                      animation: "pulse-glow 2s ease-in-out infinite",
                    }}
                  />
                  <span className="text-xs font-mono text-[rgba(30,144,255,0.6)]">
                    All Systems Operational
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono text-[rgba(30,144,255,0.5)] tracking-wider flex items-center justify-end gap-2">
                  REAL INTELLIGENCE
                  <button
                    onClick={toggleDevTools}
                    className="p-1"
                    style={{
                      border: "1px solid rgba(0, 212, 255, 0.4)",
                      background: "rgba(0, 212, 255, 0.1)",
                      color: "#00d4ff",
                    }}
                    aria-label="Toggle dev tools"
                    title={showDevTools ? "Hide dev tools" : "Show dev tools"}
                  >
                    <Settings size={12} />
                  </button>
                </div>
                <div
                  className="text-lg font-mono font-bold tracking-wider"
                  style={{
                    color: "#1e90ff",
                    textShadow: "0 0 15px rgba(30, 144, 255, 0.5)",
                  }}
                >
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animation: `${msg.role === "user" ? "slide-in-right" : "slide-in-left"} 0.3s ease-out` }}
                >
                  <div
                    className="max-w-[85%] p-3 relative"
                    style={{
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%)"
                          : "linear-gradient(135deg, rgba(30, 144, 255, 0.15) 0%, rgba(30, 144, 255, 0.03) 100%)",
                      border: `1px solid ${msg.role === "user" ? "rgba(0, 212, 255, 0.3)" : "rgba(30, 144, 255, 0.2)"}`,
                      clipPath:
                        msg.role === "user"
                          ? "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)"
                          : "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    {msg.role === "rise" && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#00d4ff]" style={{ boxShadow: "0 0 8px #00d4ff" }} />
                        <span className="text-[10px] font-mono tracking-wider text-[#00d4ff]">R.I.S.E.</span>
                      </div>
                    )}
                    <p className="text-sm font-mono text-white/90 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <span className="block mt-2 text-[9px] font-mono opacity-40">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div
                    className="p-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(30, 144, 255, 0.15) 0%, rgba(30, 144, 255, 0.03) 100%)",
                      border: "1px solid rgba(30, 144, 255, 0.2)",
                      clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[#1e90ff]"
                            style={{
                              animation: "thinking-pulse 1.2s ease-in-out infinite",
                              animationDelay: `${i * 0.15}s`,
                              boxShadow: "0 0 10px #1e90ff",
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono text-[#1e90ff]">Processing neural pathways...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[rgba(30,144,255,0.15)] flex-shrink-0">
              <div
                className="flex items-center gap-3 p-3"
                style={{
                  background: "rgba(0, 245, 255, 0.05)",
                  border: "1px solid rgba(0, 245, 255, 0.2)",
                  boxShadow: "0 0 20px rgba(0, 245, 255, 0.1), inset 0 0 20px rgba(0, 245, 255, 0.05)",
                }}
              >
                <button
                  onClick={onVoice}
                  className="p-2 rounded-lg transition-all"
                  style={{ background: "rgba(0, 245, 255, 0.1)", border: "1px solid rgba(0, 245, 255, 0.2)" }}
                  title="Voice input"
                >
                  <Mic className="w-4 h-4 text-[#00f5ff]" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSend()}
                  placeholder="Enter command or query..."
                  className="flex-1 bg-transparent text-white text-sm font-mono placeholder:text-white/30 focus:outline-none"
                />

                <button
                  onClick={() => onSend()}
                  disabled={!input.trim() || isThinking}
                  className="p-2 rounded-lg transition-all disabled:opacity-30"
                  style={{
                    background: "rgba(0, 245, 255, 0.2)",
                    border: "1px solid rgba(0, 245, 255, 0.4)",
                    boxShadow: input.trim() ? "0 0 15px rgba(0, 245, 255, 0.3)" : "none",
                  }}
                >
                  <Send className="w-4 h-4 text-[#00f5ff]" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside
          className="right-panel fixed right-0 top-0 h-screen p-4 overflow-y-auto z-20 transition-all duration-300"
          style={{ width: rightOpen ? "25%" : "0px", padding: rightOpen ? "1rem" : "0px" }}
        >
          <SystemMonitor />
        </aside>

        <button
          onClick={() => setRightOpen((prev) => !prev)}
          className="fixed top-1/2 -translate-y-1/2 z-30 p-2"
          style={{
            right: rightOpen ? "calc(25% - 12px)" : "0px",
            background: "rgba(0, 212, 255, 0.15)",
            border: "1px solid rgba(0, 212, 255, 0.45)",
            color: "#00d4ff",
            boxShadow: "0 0 14px rgba(0, 212, 255, 0.35)",
            clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0 100%)",
          }}
          aria-label="Toggle right panel"
        >
          {rightOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {showDevTools && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 8, 16, 0.7) 100%)",
            zIndex: 100,
          }}
        />
      )}

      {showDevTools && (
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(30, 144, 255, 0.1) 2px, rgba(30, 144, 255, 0.1) 4px)",
            zIndex: 101,
          }}
        />
      )}
    </main>
  )
}
