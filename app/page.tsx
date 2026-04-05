"use client"

import { useEffect, useMemo, useState } from "react"
import { BootSequence } from "@/components/jarvis/boot-sequence"
import { SetupScreen } from "@/components/rise/SetupScreen"
import { LockScreen } from "@/components/rise/LockScreen"
import { UIDesign1 } from "@/components/rise/UIDesign1"
import { UIDesign2 } from "@/components/rise/UIDesign2"
import { VoiceMode } from "@/components/rise/VoiceMode"
import type { ChatMessage, ChatSession, UserFacts } from "@/components/rise/types"

const USER_FACTS: UserFacts = {
  name: "Rio",
  location: "Coimbatore Tamil Nadu",
  goal: "AI Engineer",
  weakness: "consistency",
  year: "4th year CS student",
  role: "AI intern",
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildWelcomeMessage(): ChatMessage {
  return {
    id: generateId(),
    role: "rise",
    content: "Hey Rio da, RISE online. Sollu, what mission are we pushing today?",
    timestamp: new Date().toISOString(),
  }
}

async function hashPassword(password: string) {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export default function AppPage() {
  const [ready, setReady] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [showBoot, setShowBoot] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)

  const [mode, setMode] = useState<"jarvis" | "modern">("jarvis")
  const [transitioning, setTransitioning] = useState(false)

  const [isThinking, setIsThinking] = useState(false)
  const [input, setInput] = useState("")

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return

    const riseInitialized = localStorage.getItem("rise_initialized") === "true"
    setInitialized(riseInitialized)

    const rawFacts = localStorage.getItem("rise_user_facts")
    if (!rawFacts) {
      localStorage.setItem("rise_user_facts", JSON.stringify(USER_FACTS))
    }

    const rawSessions = localStorage.getItem("rise_sessions")
    const savedCurrent = localStorage.getItem("rise_current_session")

    if (rawSessions) {
      try {
        const parsed = JSON.parse(rawSessions) as ChatSession[]
        if (parsed.length > 0) {
          setSessions(parsed)
          const activeId = savedCurrent && parsed.find((s) => s.id === savedCurrent) ? savedCurrent : parsed[0].id
          setCurrentSessionId(activeId)
          const active = parsed.find((s) => s.id === activeId)
          setMessages(active?.messages || [buildWelcomeMessage()])
        } else {
          const first: ChatSession = {
            id: generateId(),
            title: "New chat",
            messages: [buildWelcomeMessage()],
            createdAt: new Date().toISOString(),
          }
          setSessions([first])
          setCurrentSessionId(first.id)
          setMessages(first.messages)
        }
      } catch {
        const first: ChatSession = {
          id: generateId(),
          title: "New chat",
          messages: [buildWelcomeMessage()],
          createdAt: new Date().toISOString(),
        }
        setSessions([first])
        setCurrentSessionId(first.id)
        setMessages(first.messages)
      }
    } else {
      const first: ChatSession = {
        id: generateId(),
        title: "New chat",
        messages: [buildWelcomeMessage()],
        createdAt: new Date().toISOString(),
      }
      setSessions([first])
      setCurrentSessionId(first.id)
      setMessages(first.messages)
    }

    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !currentSessionId) return

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s
        const firstUser = messages.find((m) => m.role === "user")
        return {
          ...s,
          messages,
          title: (firstUser?.content || s.title || "New chat").slice(0, 40),
        }
      }),
    )
  }, [messages, currentSessionId, ready])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem("rise_sessions", JSON.stringify(sessions))
    localStorage.setItem("rise_current_session", currentSessionId)

    localStorage.setItem(
      "rise_memory",
      JSON.stringify({
        conversations: messages,
        lastSeen: new Date().toISOString(),
        savedAt: Date.now(),
      }),
    )
  }, [sessions, currentSessionId, messages, ready])

  const conversationHistory = useMemo(
    () =>
      messages
        .filter((m) => m.role === "user" || m.role === "rise")
        .map((m) => ({ role: m.role === "rise" ? "assistant" : "user", content: m.content })),
    [messages],
  )

  const systemPrompt = () => {
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

    const summary = messages
      .slice(-10)
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n")

    return `You are RISE (Real Intelligence for Self Evolution).
Today is ${realDate}. Current time is ${realTime} IST (Indian Standard Time). You are in Coimbatore, Tamil Nadu, India. Never say wrong date.

You are personal AI mentor of Rio, 4th year CS student and AI intern from Coimbatore Tamil Nadu India.
Personality: strict but friendly mentor, call out laziness directly, speak English mixed with Tamil words naturally like da, machan, sollu, dei, enna da.
Never give robotic responses. Talk like a genius close friend.
Goal: AI Engineer. Weakness: consistency.

Previous conversation summary:
${summary || "(empty)"}

CRITICAL MEMORY RULES:
- Only reference conversations that are in the actual conversation history provided to you.
- If asked about previous chats and history is empty, say honestly:
"Fresh session da, I don't have our previous chat loaded. But I remember you're Rio, 4th year CS student, AI intern, goal is AI Engineer, main issue is consistency."
- NEVER make up or hallucinate past conversations.
- NEVER pretend to remember things not in history.
- If memory is loaded, reference it accurately.`
  }

  const streamReply = async (
    userMessage: string,
    onChunk: (chunk: string) => void,
  ): Promise<string> => {
    try {
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
            { role: "system", content: systemPrompt() },
            ...conversationHistory,
            { role: "user", content: userMessage },
          ],
        }),
      })

      if (!response.ok || !response.body) {
        return "RISE connection issue da, check if Ollama is running machan."
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ""
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
              full += data.message.content
              onChunk(data.message.content)
            }
          } catch {
            // ignore
          }
        }
      }

      return full || "RISE connection issue da, check if Ollama is running machan."
    } catch {
      return "RISE connection issue da, check if Ollama is running machan."
    }
  }

  const handleSend = async (forcedText?: string) => {
    const text = (forcedText ?? input).trim()
    if (!text || isThinking) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    }

    const riseId = generateId()
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: riseId, role: "rise", content: "", timestamp: new Date().toISOString() },
    ])
    setInput("")
    setIsThinking(true)

    let streamed = ""
    const final = await streamReply(text, (chunk) => {
      streamed += chunk
      setMessages((prev) => prev.map((m) => (m.id === riseId ? { ...m, content: streamed } : m)))
    })

    if (!streamed) {
      setMessages((prev) => prev.map((m) => (m.id === riseId ? { ...m, content: final } : m)))
    }

    setIsThinking(false)
  }

  const handleRetryLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUser) return
    void handleSend(lastUser.content)
  }

  const handleNewChat = () => {
    const session: ChatSession = {
      id: generateId(),
      title: "New chat",
      messages: [buildWelcomeMessage()],
      createdAt: new Date().toISOString(),
    }
    setSessions((prev) => [session, ...prev])
    setCurrentSessionId(session.id)
    setMessages(session.messages)
  }

  const handleSelectSession = (id: string) => {
    const found = sessions.find((s) => s.id === id)
    if (!found) return
    setCurrentSessionId(id)
    setMessages(found.messages)
  }

  const handleDeleteSession = (id: string) => {
    const next = sessions.filter((s) => s.id !== id)
    if (next.length === 0) {
      handleNewChat()
      return
    }
    setSessions(next)
    if (currentSessionId === id) {
      setCurrentSessionId(next[0].id)
      setMessages(next[0].messages)
    }
  }

  const handleClearMemory = () => {
    const first: ChatSession = {
      id: generateId(),
      title: "New chat",
      messages: [buildWelcomeMessage()],
      createdAt: new Date().toISOString(),
    }
    setSessions([first])
    setCurrentSessionId(first.id)
    setMessages(first.messages)
  }

  const toggleMode = () => {
    setTransitioning(true)
    setTimeout(() => {
      setMode((m) => (m === "jarvis" ? "modern" : "jarvis"))
      setTransitioning(false)
    }, 220)
  }

  const onInitialize = async (password: string) => {
    const hash = await hashPassword(password)
    localStorage.setItem("rise_password_hash", hash)
    localStorage.setItem("rise_initialized", "true")
    setInitialized(true)
    setShowBoot(true)
  }

  const onUnlock = async (password: string) => {
    const hash = await hashPassword(password)
    const saved = localStorage.getItem("rise_password_hash")
    const ok = hash === saved
    if (ok) setUnlocked(true)
    return ok
  }

  const handleVoiceSend = (text: string) => {
    if (!text.trim()) return
    void handleSend(text)
  }

  if (!ready) return <div className="h-screen w-screen bg-black" />
  if (!initialized) return <SetupScreen onInitialize={onInitialize} />
  if (showBoot) return <BootSequence onComplete={() => { setShowBoot(false); setUnlocked(true) }} />
  if (!unlocked) return <LockScreen onUnlock={onUnlock} />

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <div
        className="h-full w-full transition-opacity duration-300"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {mode === "jarvis" ? (
          <UIDesign1
            messages={messages}
            input={input}
            setInput={setInput}
            isThinking={isThinking}
            onSend={(txt) => void handleSend(txt)}
            onVoice={() => setVoiceOpen(true)}
            onToggleMode={toggleMode}
            onLock={() => setUnlocked(false)}
          />
        ) : (
          <UIDesign2
            messages={messages}
            sessions={sessions}
            currentSessionId={currentSessionId}
            input={input}
            setInput={setInput}
            isThinking={isThinking}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onSend={(txt) => void handleSend(txt)}
            onVoice={() => setVoiceOpen(true)}
            onRetryLast={handleRetryLast}
            onClearMemory={handleClearMemory}
            onToggleMode={toggleMode}
            onLock={() => setUnlocked(false)}
          />
        )}
      </div>

      <VoiceMode
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSendText={handleVoiceSend}
      />
    </div>
  )
}
