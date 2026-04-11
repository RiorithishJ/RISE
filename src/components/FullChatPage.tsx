import { useState, useRef, useEffect } from "react";
import { Send, Mic, Plus, MessageSquare, Trash2, Paperclip, Image, Lightbulb, Code, Target, Search, MoreHorizontal } from "lucide-react";

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

const systemPrompt = `You are RISE AI — Real Intelligence for Self Evolution. 
You are the personal AI mentor of Rio, a 4th year CS student and AI intern from Coimbatore, Tamil Nadu.
Rio's goal is to become an AI Engineer. His weakness is consistency.
You are strict but friendly. You naturally mix Tamil and English.
Use words like "da", "machan", "sollu" naturally.
Help Rio track fitness, coding, and productivity goals with honest, motivational guidance.`;

const actionChips = [
  { icon: Lightbulb, label: "Brainstorm", prefix: "Brainstorm: " },
  { icon: Code, label: "Code", prefix: "Help me code: " },
  { icon: Target, label: "Get Advice", prefix: "Give me advice on: " },
  { icon: Search, label: "Web Search", prefix: "Search for: " },
];

const FullChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("rise-chat-history");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: "Getting Started",
        date: "Today",
        messages: [
          { id: 1, text: "Welcome to RISE AI da! I'm your personal growth assistant. Ask me anything about your fitness, coding, or productivity goals. Let's level up machan! 🚀", sender: "rise", time: "Just now" },
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

  const handleSend = async (prefixedInput?: string) => {
    const text = prefixedInput || input;
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now(), text, sender: "user", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const updatedConvs = conversations.map(c =>
      c.id === activeConvId
        ? { ...c, messages: [...c.messages, userMsg], title: c.messages.length <= 1 ? text.slice(0, 35) : c.title }
        : c
    );
    save(updatedConvs);
    setInput("");
    setIsLoading(true);

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
        const riseMsg: Message = { id: Date.now() + 1, text: data.message.content, sender: "rise", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        save(updatedConvs.map(c => c.id === activeConvId ? { ...c, messages: [...c.messages, riseMsg] } : c));
      } else {
        throw new Error("Ollama unavailable");
      }
    } catch {
      const riseMsg: Message = {
        id: Date.now() + 1,
        text: "I'm here to help you level up da! 💪 (Connect Ollama at localhost:11434 for live AI responses)",
        sender: "rise",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      messages: [{ id: Date.now(), text: "Hey machan! What can I help you with? 🚀", sender: "rise", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
    };
    save([conv, ...conversations]);
    setActiveConvId(conv.id);
  };

  const deleteConversation = (id: number) => {
    const filtered = conversations.filter(c => c.id !== id);
    if (filtered.length === 0) { newConversation(); return; }
    save(filtered);
    if (activeConvId === id) setActiveConvId(filtered[0].id);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat History Sidebar */}
      <div className="w-[250px] bg-muted/50 border-r border-border flex flex-col shrink-0">
        <div className="p-3">
          <button onClick={newConversation}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map(c => (
            <div key={c.id} onClick={() => setActiveConvId(c.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm ${
                c.id === activeConvId ? "bg-card shadow-sm border-l-2 border-l-primary" : "hover:bg-card/50"
              }`}>
              <MessageSquare size={14} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="block truncate text-rise-text text-xs font-medium">{c.title}</span>
                <span className="text-[10px] text-muted-foreground">{c.date}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Trash2 size={12} className="text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-center">
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-semibold text-sm">RISE AI Chat</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {activeConv?.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "rise" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mr-3 mt-1">
                  <span className="text-primary-foreground text-xs font-bold">R</span>
                </div>
              )}
              <div className="max-w-[65%]">
                <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-muted text-rise-text rounded-br-md"
                    : "bg-card border border-border text-rise-text rounded-bl-md"
                }`} style={msg.sender === "rise" ? { boxShadow: "var(--shadow-card)" } : {}}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1 block">{msg.time}</span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mr-3 mt-1">
                <span className="text-primary-foreground text-xs font-bold">R</span>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-xs text-muted-foreground mb-1">RISE is thinking...</p>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Chips */}
        <div className="px-8 pb-2 flex gap-2">
          {actionChips.map(chip => {
            const Icon = chip.icon;
            return (
              <button key={chip.label} onClick={() => setInput(chip.prefix)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Icon size={12} /> {chip.label}
              </button>
            );
          })}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 transition-colors">
            <MoreHorizontal size={12} /> More
          </button>
        </div>

        {/* Input */}
        <div className="px-8 pb-6 pt-2">
          <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-3">
            <button className="text-muted-foreground hover:text-rise-text transition-colors">
              <Paperclip size={18} />
            </button>
            <button className="text-muted-foreground hover:text-rise-text transition-colors">
              <Image size={18} />
            </button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask RISE anything..."
              className="flex-1 bg-transparent text-sm outline-none text-rise-text placeholder:text-muted-foreground" />
            <button className="text-muted-foreground hover:text-rise-text transition-colors">
              <Mic size={18} />
            </button>
            <button onClick={() => handleSend()} disabled={isLoading}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50">
              <Send size={16} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullChatPage;
