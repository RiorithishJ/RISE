import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "rise";
  time: string;
}

const systemPrompt = `You are RISE AI — Real Intelligence for Self Evolution.
You are the personal AI mentor of Rio, a 4th year CS student and AI intern from Coimbatore, Tamil Nadu.
Rio's goal is to become an AI Engineer. His weakness is consistency.
You are strict but friendly. Use words like "da", "machan", "sollu" naturally.`;

const initialMessages: Message[] = [
  { id: 1, text: "How many calories did I burn yesterday?", sender: "user", time: "2 hours ago" },
  { id: 2, text: "You burned 420 kcal across 3 activities da!", sender: "rise", time: "2 hours ago" },
  { id: 3, text: "Great job Rio! Your push-ups increased by 15% this week. Keep pushing machan! 💪", sender: "rise", time: "1 hour ago" },
  { id: 4, text: "What should I focus on today?", sender: "user", time: "30 min ago" },
  { id: 5, text: "Based on your goals, I'd suggest:\n1. Complete 50 push-ups\n2. 2 Pomodoro sessions on ML\n3. Push your project code to GitHub", sender: "rise", time: "30 min ago" },
];

const ChatPanel = () => {
  const { currentPage, pageData } = useRISEContext();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: "user", time: "Just now" };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const contextPrompt = `${systemPrompt}\n\nCurrent page: ${currentPage}\nCurrent page data: ${JSON.stringify(pageData)}\n\nUse this data to give context-aware answers. Never make up numbers that aren't in the data.`;
      
      const ollamaMessages = [
        { role: "system", content: contextPrompt },
        ...newMessages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
      ];

      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama3", messages: ollamaMessages, stream: false }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, text: data.message.content, sender: "rise", time: "Just now" }]);
      } else throw new Error();
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm here to help you level up da! 💪 (Connect Ollama at localhost:11434 for live AI responses)",
        sender: "rise",
        time: "Just now",
      }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-[320px] shrink-0 bg-card rounded-r-3xl flex flex-col border-l border-border relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, hsla(14, 78%, 56%, 0.1), transparent)" }} />
      <div className="p-4 flex items-center justify-center relative z-10">
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary font-semibold text-sm">RISE AI</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.sender === "user" ? "bg-muted text-rise-text rounded-br-md" : "bg-card border border-border text-rise-text rounded-bl-md"
            }`} style={msg.sender === "rise" ? { boxShadow: "var(--shadow-card)" } : {}}>
              {msg.text}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-3 py-2" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask RISE anything..."
            className="flex-1 bg-transparent text-sm outline-none text-rise-text placeholder:text-muted-foreground" />
          <button className="text-muted-foreground hover:text-rise-text transition-colors"><Mic size={16} /></button>
          <button onClick={handleSend} disabled={isLoading}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50">
            <Send size={14} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
