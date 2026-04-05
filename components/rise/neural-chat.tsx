"use client"

import { useState, useRef, useEffect } from "react"
import { HolographicPanel } from "./holographic-panel"
import { Mic, Send, Square } from "lucide-react"

interface Message {
  id: string
  role: "user" | "rise"
  content: string
  timestamp: Date
}

interface NeuralChatProps {
  isThinking: boolean
  setIsThinking: (value: boolean) => void
}

export function NeuralChat({ isThinking, setIsThinking }: NeuralChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "rise",
      content: "Welcome back. I&apos;ve been analyzing your progress while you were away. Your consistency has improved by 15% this week. Ready to continue our mission?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [displayedText, setDisplayedText] = useState<{ [key: string]: string }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Typewriter effect for new messages
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.role === "rise" && !displayedText[msg.id]) {
        let index = 0
        const text = msg.content
        setDisplayedText((prev) => ({ ...prev, [msg.id]: "" }))
        
        const typeInterval = setInterval(() => {
          if (index < text.length) {
            setDisplayedText((prev) => ({
              ...prev,
              [msg.id]: text.slice(0, index + 1),
            }))
            index++
          } else {
            clearInterval(typeInterval)
          }
        }, 20)

        return () => clearInterval(typeInterval)
      }
    })
  }, [messages])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, displayedText])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsThinking(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand. Let me analyze the optimal path forward based on your goals and current trajectory.",
        "Excellent progress. Your neural pathways are adapting well to the new learning patterns we established.",
        "I&apos;ve cross-referenced this with your historical data. The correlation suggests we should focus on deep work sessions.",
        "Acknowledged. I&apos;m updating your mission parameters accordingly. Your dedication is commendable.",
      ]

      const riseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "rise",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, riseMessage])
      setIsThinking(false)
    }, 2000)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Would integrate with Web Speech API here
  }

  return (
    <HolographicPanel 
      title="Neural Chat" 
      className="h-full"
      delay={400}
    >
      <div className="flex flex-col h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              style={{
                animation: `${msg.role === "user" ? "slide-in-right" : "slide-in-left"} 0.4s ease-out`,
              }}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl relative ${
                  msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                }`}
                style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, rgba(123, 47, 255, 0.3) 0%, rgba(123, 47, 255, 0.1) 100%)"
                    : "linear-gradient(135deg, rgba(0, 245, 255, 0.15) 0%, rgba(0, 245, 255, 0.05) 100%)",
                  border: `1px solid ${msg.role === "user" ? "rgba(123, 47, 255, 0.3)" : "rgba(0, 245, 255, 0.2)"}`,
                  boxShadow: msg.role === "user"
                    ? "0 4px 20px rgba(123, 47, 255, 0.2)"
                    : "0 4px 20px rgba(0, 245, 255, 0.1)",
                  transform: "perspective(1000px)",
                }}
              >
                <p className="text-sm font-mono text-white/90 leading-relaxed">
                  {msg.role === "rise" 
                    ? (displayedText[msg.id] || "") 
                    : msg.content}
                  {msg.role === "rise" && displayedText[msg.id]?.length < msg.content.length && (
                    <span 
                      className="inline-block w-2 h-4 ml-1 bg-[#00f5ff]"
                      style={{ animation: "typewriter-cursor 0.8s ease-in-out infinite" }}
                    />
                  )}
                </p>
                <span 
                  className="block mt-2 text-[10px] font-mono opacity-50"
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex justify-start">
              <div
                className="p-4 rounded-xl rounded-bl-sm"
                style={{
                  background: "linear-gradient(135deg, rgba(0, 245, 255, 0.15) 0%, rgba(0, 245, 255, 0.05) 100%)",
                  border: "1px solid rgba(0, 245, 255, 0.2)",
                }}
              >
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#00f5ff]"
                      style={{
                        animation: "thinking-pulse 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.1}s`,
                        boxShadow: "0 0 10px #00f5ff",
                      }}
                    />
                  ))}
                  <span className="text-xs font-mono text-[#00f5ff] ml-2">
                    Processing neural pathways...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[rgba(0,245,255,0.1)]">
          <div 
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: "rgba(0, 245, 255, 0.05)",
              border: "1px solid rgba(0, 245, 255, 0.2)",
              boxShadow: "0 0 20px rgba(0, 245, 255, 0.1), inset 0 0 20px rgba(0, 245, 255, 0.05)",
            }}
          >
            {/* Voice Button */}
            <button
              onClick={toggleRecording}
              className="relative p-2 rounded-lg transition-all"
              style={{
                background: isRecording ? "rgba(255, 0, 85, 0.2)" : "rgba(0, 245, 255, 0.1)",
                border: `1px solid ${isRecording ? "rgba(255, 0, 85, 0.4)" : "rgba(0, 245, 255, 0.2)"}`,
              }}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 text-[#ff0055]" />
                  {/* Sound wave animation */}
                  <div className="absolute -right-1 -top-1 flex gap-[2px]">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-[2px] h-3 bg-[#ff0055] rounded-full origin-bottom"
                        style={{
                          animation: "wave 0.5s ease-in-out infinite",
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Mic className="w-4 h-4 text-[#00f5ff]" />
              )}
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Enter command or query..."
              className="flex-1 bg-transparent text-white text-sm font-mono placeholder:text-white/30 focus:outline-none"
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
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
    </HolographicPanel>
  )
}
