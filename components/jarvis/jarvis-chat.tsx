"use client"

import { useState, useRef, useEffect } from "react"
import { HUDPanel } from "./hud-panel"
import { Mic, Send, Square, Zap } from "lucide-react"

interface Message {
  id: string
  role: "user" | "rise"
  content: string
  timestamp: Date
}

interface RiseChatProps {
  isThinking: boolean
  setIsThinking: (value: boolean) => void
}

interface OllamaMessage {
  role: "user" | "assistant"
  content: string
}

type StreamChunkHandler = (chunk: string) => void

const FALLBACK_USER_FACTS = {
  name: "Rio",
  location: "Coimbatore Tamil Nadu",
  goal: "AI Engineer",
  weakness: "consistency",
  year: "4th year CS student",
  role: "AI intern",
}

function loadMemory(): Message[] {
  if (typeof window === "undefined") return []

  try {
    const saved = localStorage.getItem("rise_memory")
    if (!saved) return []

    const parsed = JSON.parse(saved)
    const conversations = Array.isArray(parsed?.conversations) ? parsed.conversations : []

    return conversations.map((m: Message) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }))
  } catch {
    return []
  }
}

export function RiseChat({ isThinking, setIsThinking }: RiseChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const loaded = loadMemory()
    if (loaded.length > 0) return loaded
    return [
      {
        id: "1",
        role: "rise",
        content: "Welcome da Rio. RISE online. Sollu, what are we attacking first today?",
        timestamp: new Date(),
      },
    ]
  })
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<OllamaMessage[]>(() =>
    loadMemory()
      .filter((m) => m.role === "user" || m.role === "rise")
      .map((m) => ({
        role: m.role === "rise" ? "assistant" : "user",
        content: m.content,
      })),
  )
  const [memoryLoaded, setMemoryLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (typeof window === "undefined") return

    const memory = {
      conversations: messages,
      lastSeen: new Date().toISOString(),
      savedAt: Date.now(),
    }

    localStorage.setItem("rise_memory", JSON.stringify(memory))
    setMemoryLoaded(messages.length > 0)
  }, [messages])

  useEffect(() => {
    if (typeof window === "undefined") return

    const existing = localStorage.getItem("rise_user_facts")
    if (!existing) {
      localStorage.setItem("rise_user_facts", JSON.stringify(FALLBACK_USER_FACTS))
    }
  }, [])

  useEffect(() => {
    const onAnalyze = (event: Event) => {
      const custom = event as CustomEvent<{ prompt?: string }>
      const prompt =
        custom?.detail?.prompt ||
        "Analyze our conversation so far. What are my patterns? What should I focus on?"

      setInput(prompt)
      setTimeout(() => {
        void handleSend(prompt)
      }, 30)
    }

    window.addEventListener("rise:analyze", onAnalyze)
    return () => window.removeEventListener("rise:analyze", onAnalyze)
  }, [conversationHistory, isThinking, input])

  const getRISEResponse = async (
    userMessage: string,
    history: OllamaMessage[],
    onChunk: StreamChunkHandler,
  ) => {
    try {
      const now = new Date()
      const realDate = now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      })
      const realTime = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
      })

      let userFacts = FALLBACK_USER_FACTS
      if (typeof window !== "undefined") {
        try {
          const rawFacts = localStorage.getItem("rise_user_facts")
          if (rawFacts) {
            userFacts = { ...userFacts, ...JSON.parse(rawFacts) }
          }
        } catch {
          userFacts = FALLBACK_USER_FACTS
        }
      }

      const summarySource = history.length > 0 ? history : conversationHistory
      const historySummary = summarySource
        .slice(-10)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n")

      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.1:8b",
          stream: true,
          options: {
            num_predict: 150,
            temperature: 0.7,
            top_p: 0.9,
            repeat_penalty: 1.1,
          },
          messages: [
            {
              role: "system",
              content:
                `You are RISE, personal AI mentor of Rio from Coimbatore Tamil Nadu.
Today is ${realDate}. Current time is ${realTime} IST (Indian Standard Time). You are in Coimbatore, Tamil Nadu, India. Never say wrong date.

IMPORTANT: Keep responses SHORT and punchy. Maximum 3-4 sentences unless asked for detail.
Speak like a close genius friend. Mix Tamil naturally: da, machan, sollu, dei.
Be direct, never robotic or formal.

Previous conversation summary:
${historySummary || "(empty)"}

User facts: ${userFacts.name} is a ${userFacts.year} and ${userFacts.role} from ${userFacts.location}.
Goal: ${userFacts.goal}. Weakness: ${userFacts.weakness}.

CRITICAL MEMORY RULES:
- Only reference conversations that are in the actual conversation history provided to you.
- If asked about previous chats and history is empty, say honestly:
  "Fresh session da, I don't have our previous chat loaded. But I remember you're Rio, 4th year CS student, AI intern, goal is AI Engineer, main issue is consistency."
- NEVER make up or hallucinate past conversations.
- NEVER pretend to remember things not in history.
- If memory is loaded, reference it accurately.`,
            },
            ...history,
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
      })

      if (!response.ok || !response.body) {
        return "RISE connection issue da, check if Ollama is running machan."
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""
      let pending = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        pending += decoder.decode(value, { stream: true })
        const lines = pending.split("\n")
        pending = lines.pop() ?? ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          try {
            const data = JSON.parse(trimmed)
            if (data.message?.content) {
              fullResponse += data.message.content
              onChunk(data.message.content)
            }
          } catch {
            // Ignore incomplete JSON fragments.
          }
        }
      }

      if (pending.trim()) {
        try {
          const finalData = JSON.parse(pending.trim())
          if (finalData.message?.content) {
            fullResponse += finalData.message.content
            onChunk(finalData.message.content)
          }
        } catch {
          // Ignore trailing non-JSON payload.
        }
      }

      return fullResponse || "RISE connection issue da, check if Ollama is running machan."
    } catch (error) {
      console.error("Ollama error:", error)
      return "RISE connection issue da, check if Ollama is running machan."
    }
  }

  const handleSend = async (forcedInput?: string) => {
    const effectiveInput = forcedInput ?? input
    if (!effectiveInput.trim() || isThinking) return

    const userInput = effectiveInput.trim()
    const historySnapshot = [...conversationHistory]

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      timestamp: new Date(),
    }

    const assistantMessageId = (Date.now() + 1).toString()

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantMessageId,
        role: "rise",
        content: "",
        timestamp: new Date(),
      },
    ])

    setInput("")
    setIsThinking(true)

    let streamedContent = ""
    const riseReply = await getRISEResponse(userInput, historySnapshot, (chunk) => {
      streamedContent += chunk
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: streamedContent,
              }
            : msg,
        ),
      )
    })

    if (!streamedContent) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: riseReply,
              }
            : msg,
        ),
      )
      streamedContent = riseReply
    }

    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: userInput },
      { role: "assistant", content: streamedContent },
    ])
    setIsThinking(false)
  }

  return (
    <HUDPanel 
      title="A.I. Interface" 
      className="h-full"
      delay={400}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Voice Waveform Header */}
        <div 
          className="h-16 flex items-center justify-center border-b border-[rgba(30,144,255,0.15)]"
          style={{
            background: "linear-gradient(180deg, rgba(30, 144, 255, 0.1) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={`wave-${i}`}
                className="w-1 rounded-full"
                style={{
                  height: isThinking || isRecording 
                    ? `${8 + Math.sin(i * 0.5 + Date.now() * 0.01) * 12}px`
                    : "4px",
                  background: isRecording ? "#00d4ff" : "#1e90ff",
                  boxShadow: `0 0 8px ${isRecording ? "#00d4ff" : "#1e90ff"}`,
                  transition: "height 0.1s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div id="chat-messages" className="chat-messages flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              style={{
                animation: `${msg.role === "user" ? "slide-in-right" : "slide-in-left"} 0.3s ease-out`,
              }}
            >
              <div
                className="max-w-[85%] p-3 relative"
                style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%)"
                    : "linear-gradient(135deg, rgba(30, 144, 255, 0.15) 0%, rgba(30, 144, 255, 0.03) 100%)",
                  border: `1px solid ${msg.role === "user" ? "rgba(0, 212, 255, 0.3)" : "rgba(30, 144, 255, 0.2)"}`,
                  clipPath: msg.role === "user" 
                    ? "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)"
                    : "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                }}
              >
                {msg.role === "rise" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 text-[#00d4ff]" />
                    <span className="text-[10px] font-mono tracking-wider text-[#00d4ff]">R.I.S.E.</span>
                  </div>
                )}
                <p className="text-sm font-mono text-white/90 leading-relaxed">
                  {msg.content}
                </p>
                <span className="block mt-2 text-[9px] font-mono opacity-40">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
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
                        key={`dot-${i}`}
                        className="w-2 h-2 rounded-full bg-[#1e90ff]"
                        style={{
                          animation: "thinking-pulse 1.2s ease-in-out infinite",
                          animationDelay: `${i * 0.15}s`,
                          boxShadow: "0 0 10px #1e90ff",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-[#1e90ff]">
                    RISE is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area p-4 border-t border-[rgba(30,144,255,0.15)] sticky bottom-0 flex-shrink-0">
          <div 
            className="flex items-center gap-3 p-3"
            style={{
              background: "rgba(30, 144, 255, 0.05)",
              border: "1px solid rgba(30, 144, 255, 0.2)",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
            }}
          >
            {/* Voice Button */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              className="relative p-2 transition-all"
              style={{
                background: isRecording ? "rgba(0, 212, 255, 0.2)" : "rgba(30, 144, 255, 0.1)",
                border: `1px solid ${isRecording ? "rgba(0, 212, 255, 0.4)" : "rgba(30, 144, 255, 0.2)"}`,
              }}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 text-[#00d4ff]" />
                  <div className="absolute -right-1 -top-1 flex gap-[2px]">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={`rec-${i}`}
                        className="w-[2px] h-3 bg-[#00d4ff] rounded-full origin-bottom"
                        style={{
                          animation: "wave 0.4s ease-in-out infinite",
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Mic className="w-4 h-4 text-[#1e90ff]" />
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleSend()}
              placeholder="Speak your command, Sir..."
              className="flex-1 bg-transparent text-white text-sm font-mono placeholder:text-white/30 focus:outline-none"
            />

            {/* Send Button */}
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || isThinking}
              className="p-2 transition-all disabled:opacity-30"
              style={{
                background: input.trim() ? "rgba(0, 212, 255, 0.2)" : "rgba(30, 144, 255, 0.1)",
                border: `1px solid ${input.trim() ? "rgba(0, 212, 255, 0.4)" : "rgba(30, 144, 255, 0.2)"}`,
                boxShadow: input.trim() ? "0 0 15px rgba(0, 212, 255, 0.3)" : "none",
              }}
            >
              <Send className="w-4 h-4" style={{ color: input.trim() ? "#00d4ff" : "#1e90ff" }} />
            </button>
          </div>

          <div className="mt-2 text-[10px] font-mono tracking-wider">
            <span
              className="px-2 py-1"
              style={{
                color: memoryLoaded ? "#00ff88" : "#9aa3ad",
                background: memoryLoaded ? "rgba(0, 255, 136, 0.12)" : "rgba(154, 163, 173, 0.15)",
                border: memoryLoaded ? "1px solid rgba(0, 255, 136, 0.35)" : "1px solid rgba(154, 163, 173, 0.35)",
              }}
            >
              {messages.length} messages in memory
            </span>
          </div>
        </div>
      </div>
    </HUDPanel>
  )
}
