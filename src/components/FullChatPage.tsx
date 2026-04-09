import { useState, useRef, useEffect } from "react";
import { Send, Mic, Plus, MessageSquare, Trash2 } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "rise";
  time: string;
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
  date: string;
}

const systemPrompt = "You are RISE AI — Real Intelligence for Self Evolution. You help users track fitness, coding, and productivity goals with a friendly, motivational tone.";

const FullChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("rise-chat-history");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: "Getting Started",
        date: "Today",
        messages: [
          { id: 1, text: "Welcome to RISE AI! I'm your personal growth assistant. Ask me anything about your fitness, coding, or productivity goals. 🚀", sender: "rise", time: "Just now" },
        ],
      },
    ];
  });
  const [activeConvId, setActiveConvId] = useState(() => conversations[0]?.id ?? 1);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const save = (convs: Conversation[]) => {
    setConversations(convs);
    localStorage.setItem("rise-chat-history", JSON.stringify(convs));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: "user", time: "Just now" };
    const updatedConvs = conversations.map(c =>
      c.id === activeConvId
        ? { ...c, messages: [...c.messages, userMsg], title: c.messages.length <= 1 ? input.slice(0, 30) : c.title }
        : c
    );
    save(updatedConvs);
    setInput("");
    setIsLoading(true);

    // Try Ollama, fallback to demo response
    try {
      const allMessages = updatedConvs.find(c => c.id === activeConvId)!.messages;
      const ollamaMessages = [
        { role: "system", content: systemPrompt },
        ...allMessages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
      ];

      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama3", messages: ollamaMessages, stream: false }),
      });

      if (res.ok) {
        const data = await res.json();
        const riseMsg: Message = { id: Date.now() + 1, text: data.message.content, sender: "rise", time: "Just now" };
        save(updatedConvs.map(c => c.id === activeConvId ? { ...c, messages: [...c.messages, riseMsg] } : c));
      } else {
        throw new Error("Ollama unavailable");
      }
    } catch {
      // Demo fallback
      const riseMsg: Message = {
        id: Date.now() + 1,
        text: "I'm here to help you level up! 💪 (Connect Ollama at localhost:11434 for live AI responses)",
        sender: "rise",
        time: "Just now",
      };
      const final = updatedConvs.map(c => c.id === activeConvId ? { ...c, messages: [...c.messages, riseMsg] } : c);
      save(final);
    }
    setIsLoading(false);
  };

  const newConversation = () => {
    const conv: Conversation = {
      id: Date.now(),
      title: "New Chat",
      date: "Today",
      messages: [{ id: Date.now(), text: "Hey! What can I help you with? 🚀", sender: "rise", time: "Just now" }],
    };
    save([conv, ...conversations]);
    setActiveConvId(conv.id);
  };

  const deleteConversation = (id: number) => {
    const filtered = conversations.filter(c => c.id !== id);
    if (filtered.length === 0) {
      newConversation();
      return;
    }
    save(filtered);
    if (activeConvId === id) setActiveConvId(filtered[0].id);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-[220px] bg-muted/50 border-r border-border flex flex-col shrink-0">
        <div className="p-3">
          <button
            onClick={newConversation}
            className="w-full flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveConvId(c.id)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm ${
                c.id === activeConvId ? "bg-card shadow-sm" : "hover:bg-card/50"
              }`}
            >
              <MessageSquare size={14} className="text-muted-foreground shrink-0" />
              <span className="flex-1 truncate text-rise-text">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <Trash2 size={12} className="text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-center">
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-semibold text-sm">RISE AI Chat</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeConv?.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "rise" && (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mr-2 mt-1">
                  <span className="text-primary-foreground text-xs font-bold">R</span>
                </div>
              )}
              <div className={`max-w-[60%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-muted text-rise-text rounded-br-md"
                  : "bg-card border border-border text-rise-text rounded-bl-md"
              }`} style={msg.sender === "rise" ? { boxShadow: "var(--shadow-card)" } : {}}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mr-2 mt-1">
                <span className="text-primary-foreground text-xs font-bold">R</span>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask RISE anything..."
              className="flex-1 bg-transparent text-sm outline-none text-rise-text placeholder:text-muted-foreground"
            />
            <button className="text-muted-foreground hover:text-rise-text transition-colors">
              <Mic size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send size={16} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullChatPage;
