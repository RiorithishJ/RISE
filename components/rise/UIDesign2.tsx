"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  CircleEllipsis,
  Code2,
  Copy,
  Download,
  Folder,
  Globe,
  Grid2x2,
  Info,
  Lightbulb,
  Lock,
  Mic,
  MoreHorizontal,
  Pencil,
  Search,
  Send,
  Settings,
  X,
  Target,
  Trash2,
  Upload,
  Wrench,
  RotateCcw,
} from "lucide-react"
import type { ChatMessage, ChatSession } from "./types"

interface UIDesign2Props {
  messages: ChatMessage[]
  sessions: ChatSession[]
  currentSessionId: string
  input: string
  setInput: (v: string) => void
  isThinking: boolean
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
  onSend: (forcedText?: string) => void
  onVoice: () => void
  onRetryLast: () => void
  onClearMemory: () => void
  onToggleMode: () => void
  onLock: () => void
}

type SideView = "chats" | "explore" | "categories" | "library"

function extractCodeBlock(content: string) {
  const match = content.match(/```(?:\w+)?\n?([\s\S]*?)```/)
  if (!match) return { text: content, code: "" }
  return {
    text: content.replace(match[0], "").trim(),
    code: match[1].trim(),
  }
}

async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function UIDesign2({
  messages,
  sessions,
  currentSessionId,
  input,
  setInput,
  isThinking,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSend,
  onVoice,
  onRetryLast,
  onClearMemory,
  onToggleMode,
  onLock,
}: UIDesign2Props) {
  const [view, setView] = useState<SideView>("chats")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [password1, setPassword1] = useState("")
  const [password2, setPassword2] = useState("")
  const [passwordSaved, setPasswordSaved] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("rise_sound_enabled")
    if (saved) setSoundOn(saved === "true")
  }, [])

  const currentTitle = useMemo(() => {
    const current = sessions.find((s) => s.id === currentSessionId)
    return current?.title || "New Chat"
  }, [sessions, currentSessionId])

  const panelText = useMemo(() => {
    if (view === "explore") return "Explore coming soon"
    if (view === "categories") return "Categories coming soon"
    if (view === "library") return "Showing saved chats from your local sessions"
    return ""
  }, [view])

  const handleBookmark = () => {
    const current = sessions.find((s) => s.id === currentSessionId)
    if (!current) return
    const raw = localStorage.getItem("rise_bookmarks")
    const existing = raw ? (JSON.parse(raw) as ChatSession[]) : []
    const deduped = [current, ...existing.filter((s) => s.id !== current.id)]
    localStorage.setItem("rise_bookmarks", JSON.stringify(deduped))
    alert("Current chat bookmarked")
  }

  const handleSchedule = () => alert("Schedule panel coming soon")
  const handleTools = () => alert("Available tools: Analyze, Scan, Export, Memory")

  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const blob = new Blob([JSON.stringify({ sessions }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rise_chats_${timestamp}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleClearMemory = () => {
    if (!confirm("Clear all local memory and chats?")) return
    localStorage.removeItem("rise_memory")
    localStorage.removeItem("rise_sessions")
    localStorage.removeItem("rise_current_session")
    onClearMemory()
  }

  const handleToggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev
      localStorage.setItem("rise_sound_enabled", String(next))
      return next
    })
  }

  const handleSavePassword = async () => {
    if (!password1 || password1 !== password2) {
      alert("Passwords do not match")
      return
    }
    const hash = await hashPassword(password1)
    localStorage.setItem("rise_password_hash", hash)
    setPassword1("")
    setPassword2("")
    setPasswordSaved(true)
    setTimeout(() => setPasswordSaved(false), 1600)
  }

  return (
    <div className="modern-ui h-screen w-screen bg-[#0f1115] text-white overflow-hidden relative">
      <button
        onClick={onToggleMode}
        className="fixed top-4 right-4 z-50 px-3 py-2 rounded-xl text-xs"
        style={{ border: "1px solid #2b3038", background: "#191d24", color: "#d0d7e2" }}
      >
        SWITCH TO JARVIS ⟷
      </button>

      <button
        onClick={onLock}
        className="fixed top-4 right-56 z-50 p-2 rounded-xl"
        style={{ border: "1px solid #2b3038", background: "#191d24", color: "#d0d7e2" }}
        title="Lock RISE"
      >
        <Lock size={16} />
      </button>

      <div className="h-full w-full grid" style={{ gridTemplateColumns: "260px 1fr 54px" }}>
        <aside className="h-full bg-[#0c0f14] border-r border-[#232833] p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" style={{ boxShadow: "0 0 8px #22c55e" }} />
            <span className="text-sm font-semibold tracking-wide">RISE AI</span>
          </div>

          <button
            onClick={onNewChat}
            className="w-full py-2.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: "#22c55e", color: "#08140c" }}
          >
            + New Chat
          </button>

          <div className="text-sm text-[#b4b4b4] space-y-1.5 mb-4">
            <button onClick={() => setView("explore")} className="w-full text-left px-2 py-2 rounded-lg hover:bg-[#161b23] flex items-center gap-2" title="Explore">
              <Search size={14} /> Explore
            </button>
            <button onClick={() => setView("categories")} className="w-full text-left px-2 py-2 rounded-lg hover:bg-[#161b23] flex items-center gap-2" title="Categories">
              <Grid2x2 size={14} /> Categories
            </button>
            <button onClick={() => setView("library")} className="w-full text-left px-2 py-2 rounded-lg hover:bg-[#161b23] flex items-center justify-between" title="Library">
              <span className="flex items-center gap-2"><Folder size={14} /> Library</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a2a1f] text-[#58d787]">141</span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="w-full text-left px-2 py-2 rounded-lg hover:bg-[#161b23] flex items-center gap-2" title="Settings">
              <Settings size={14} /> Settings
            </button>
          </div>

          <div className="text-xs text-[#7d7d7d] mb-2 px-2">Chats</div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {view !== "chats" && (
              <div className="text-xs text-[#8b93a1] px-2 py-2 rounded-lg border border-[#2a303b] bg-[#12161d] mb-2">
                {panelText}
              </div>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                className="group rounded-lg px-2 py-2 text-sm cursor-pointer flex items-center justify-between"
                style={{
                  background: s.id === currentSessionId ? "#171c25" : "transparent",
                  border: s.id === currentSessionId ? "1px solid #2b3442" : "1px solid transparent",
                }}
                onClick={() => onSelectSession(s.id)}
              >
                <span className="truncate max-w-[170px]">{s.title || "New session"}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(s.id)
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#232833] mt-3 flex items-center justify-between px-1">
            <button onClick={() => setSettingsOpen(true)} className="w-8 h-8 rounded-lg bg-[#151a22] border border-[#2b3442] flex items-center justify-center text-[#b7bfcc]" title="Open settings">
              <Settings size={14} />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#22c55e] text-[#0d1b11] font-semibold text-xs" title="Rio">
              R
            </button>
          </div>
        </aside>

        <section className="h-full flex flex-col overflow-hidden">
          <div className="h-14 border-b border-[#232833] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{currentTitle}</span>
              <Pencil size={14} className="text-[#7f8794]" />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2" style={{ background: "#171b23", border: "1px solid #2b3442" }} title="Share chat">
                <Upload size={14} /> Share
              </button>
              <button className="w-8 h-8 rounded-lg border border-[#2b3442] bg-[#171b23] flex items-center justify-center" title="More options">
                <MoreHorizontal size={14} />
              </button>
              <button onClick={handleBookmark} className="w-8 h-8 rounded-lg border border-[#2b3442] bg-[#171b23] flex items-center justify-center" title="Bookmark chat">
                <Bookmark size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((msg) => {
              const parts = extractCodeBlock(msg.content)
              const lines = parts.code ? parts.code.split("\n") : []
              return (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[780px]">
                    {msg.role === "rise" && <div className="text-[11px] text-[#65d5a2] mb-1.5">● RISE</div>}
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{
                        background: msg.role === "user" ? "#1f232d" : "#1a1d25",
                        border: "1px solid #2a303a",
                      }}
                    >
                      {msg.role === "user" ? (
                        <div className="flex items-start gap-2 justify-end">
                          <div className="text-sm leading-relaxed text-[#f0f3f8] whitespace-pre-wrap">{parts.text || msg.content}</div>
                          <div className="w-6 h-6 rounded-full bg-[#22c55e] text-[#0b1c12] text-[10px] font-semibold flex items-center justify-center">R</div>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed text-[#f0f3f8] whitespace-pre-wrap">{parts.text}</div>
                      )}

                      {parts.code && (
                        <div className="mt-3 rounded-lg bg-[#0d1117] border border-[#2a3038] overflow-hidden">
                          <div className="px-3 py-2 text-xs flex items-center justify-end border-b border-[#222a36]">
                            <button
                              className="flex items-center gap-1 text-[#a7b1c2]"
                              onClick={() => navigator.clipboard.writeText(parts.code)}
                            >
                              <Copy size={12} /> Copy code
                            </button>
                          </div>
                          <pre className="p-0 text-xs overflow-x-auto"><code>
                            {lines.map((line, idx) => (
                              <div key={`${msg.id}-${idx}`} className="grid grid-cols-[40px_1fr]">
                                <span className="text-right pr-3 py-0.5 text-[#6f7f96] select-none border-r border-[#1e2532]">{idx + 1}</span>
                                <span className="px-3 py-0.5 text-[#d8e6ff]">{line || " "}</span>
                              </div>
                            ))}
                          </code></pre>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-[#9aa4b4]">
                      <button className="flex items-center gap-1" onClick={() => navigator.clipboard.writeText(msg.content)}><Copy size={12} /> Copy</button>
                      {msg.role === "rise" && (
                        <button className="flex items-center gap-1" onClick={onRetryLast}><RotateCcw size={12} /> Try again</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {isThinking && <div className="text-sm text-[#65d5a2]">RISE is thinking...</div>}
          </div>

          <div className="p-4 border-t border-[#232833]">
            <div className="rounded-2xl border border-[#2b3442] bg-[#151922] p-3" style={{ boxShadow: "0 0 24px rgba(19, 24, 33, 0.7)" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder="Ask anything..."
                className="w-full bg-transparent text-sm outline-none text-[#eaf0f8] placeholder:text-[#7f8794]"
              />

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: "Brainstorm", icon: <Lightbulb size={12} /> },
                    { label: "Code", icon: <Code2 size={12} /> },
                    { label: "Get Advice", icon: <Target size={12} /> },
                    { label: "Web Search", icon: <Globe size={12} /> },
                    { label: "More", icon: <CircleEllipsis size={12} /> },
                  ].map((chip) => (
                    <button key={chip.label} className="px-2.5 py-1 text-xs rounded-full border border-[#2a303b] bg-[#1a202a] text-[#c8d0dd] flex items-center gap-1.5">
                      {chip.icon}
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={onVoice} className="w-8 h-8 rounded-full border border-[#2b3442] bg-[#1a202a] flex items-center justify-center" title="Voice mode">
                    <Mic size={14} />
                  </button>
                  <button onClick={() => onSend()} className="w-8 h-8 rounded-full bg-[#22c55e] text-[#06110a] flex items-center justify-center" title="Send message">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="h-full bg-[#0c0f14] border-l border-[#232833] flex flex-col items-center py-3 gap-3">
          {[
            { Icon: Bookmark, onClick: handleBookmark, label: "Bookmark" },
            { Icon: CalendarDays, onClick: handleSchedule, label: "Schedule" },
            { Icon: Wrench, onClick: handleTools, label: "Tools" },
          ].map(({ Icon, onClick, label }, i) => (
            <button key={i} onClick={onClick} title={label} className="w-8 h-8 rounded-lg bg-[#171b23] border border-[#2b3442] flex items-center justify-center text-[#c7cdd8] hover:bg-[#1e2430]">
              <Icon size={14} />
            </button>
          ))}

          <div className="mt-auto flex flex-col items-center gap-3">
            <button title="Open settings" onClick={() => setSettingsOpen(true)} className="w-8 h-8 rounded-lg bg-[#171b23] border border-[#2b3442] flex items-center justify-center text-[#c7cdd8] hover:bg-[#1e2430]">
              <Settings size={14} />
            </button>
            <button title="Profile" className="w-8 h-8 rounded-full bg-[#22c55e] text-[#0c1d12] text-xs font-semibold">R</button>
          </div>
        </aside>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-[320px] bg-[#11161f] border-l border-[#2a3342] z-40 transition-transform duration-300 ${settingsOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-14 border-b border-[#2a3342] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Settings size={15} /> RISE SETTINGS
          </div>
          <button onClick={() => setSettingsOpen(false)} title="Close settings">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-2 text-sm">
          <button onClick={() => setShowPasswordForm((v) => !v)} className="w-full px-3 py-2 rounded-lg bg-[#171d28] border border-[#2d3746] flex items-center gap-2 text-left">
            <Lock size={14} /> Change Password
          </button>

          {showPasswordForm && (
            <div className="p-3 rounded-lg border border-[#2d3746] bg-[#121823] space-y-2">
              <input
                type="password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                placeholder="New password"
                className="w-full px-2 py-1.5 rounded bg-[#0f141d] border border-[#2d3746] outline-none"
              />
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-2 py-1.5 rounded bg-[#0f141d] border border-[#2d3746] outline-none"
              />
              <button onClick={handleSavePassword} className="px-3 py-1.5 rounded bg-[#22c55e] text-[#0b1a11] text-xs font-semibold">
                Save Password
              </button>
              {passwordSaved && <div className="text-[#74d7a2] text-xs flex items-center gap-1"><Check size={12} /> Password updated</div>}
            </div>
          )}

          <button onClick={handleClearMemory} className="w-full px-3 py-2 rounded-lg bg-[#171d28] border border-[#2d3746] flex items-center gap-2 text-left">
            <Trash2 size={14} /> Clear Memory
          </button>

          <button onClick={handleExport} className="w-full px-3 py-2 rounded-lg bg-[#171d28] border border-[#2d3746] flex items-center gap-2 text-left">
            <Download size={14} /> Export Chats
          </button>

          <button onClick={handleToggleSound} className="w-full px-3 py-2 rounded-lg bg-[#171d28] border border-[#2d3746] flex items-center justify-between text-left">
            <span className="flex items-center gap-2"><BookOpen size={14} /> Sound</span>
            <span className="text-[#8ce0b3]">{soundOn ? "ON" : "OFF"}</span>
          </button>

          <button onClick={() => alert("Theme options coming soon")} className="w-full px-3 py-2 rounded-lg bg-[#171d28] border border-[#2d3746] flex items-center gap-2 text-left">
            <CircleEllipsis size={14} /> Theme options
          </button>

          <button onClick={() => alert("RISE v2.0 • Real Intelligence for Self Evolution")} className="w-full px-3 py-2 rounded-lg bg-[#171d28] border border-[#2d3746] flex items-center gap-2 text-left">
            <Info size={14} /> About RISE
          </button>

          <button onClick={() => setSettingsOpen(false)} className="w-full mt-3 px-3 py-2 rounded-lg bg-[#1f2633] border border-[#2d3746] flex items-center justify-center gap-2 text-left">
            Close <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-30 bg-black/30" onClick={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}
