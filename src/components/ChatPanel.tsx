import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "rise";
  time: string;
}

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

  const systemPrompt = `You are RISE (Real Intelligence for 
Self Evolution). Personal AI mentor of 
Rio, 4th year IT student and AI intern 
from Coimbatore Tamil Nadu India.

Current page: ${currentPage}
Current page data: ${JSON.stringify(pageData)}

Personality rules:
- Strict but genuinely friendly mentor
- Call out laziness and mistakes directly
- Mix Tamil naturally: da, machan, sollu, dei
- Never give robotic formal responses
- Talk like a genius close friend
- Always focused on making Rio an AI Engineer
- Rio main weakness: consistency
- Use actual numbers from pageData above
- Never make up data not in pageData
- Keep responses short 2-3 sentences
  unless detail is asked for`;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: "user", time: "Just now" };
    const assistantId = Date.now() + 1;
    setMessages(prev => [...prev, userMsg, { id: assistantId, text: "", sender: "rise", time: "Just now" }]);
    setInput("");
    setIsLoading(true);

    try {
      const ollamaMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
        { role: "user", content: input.trim() },
      ];

      const res = await fetch("/ollama/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.1:8b",
          stream: true,
          options: {
            num_predict: 150,
            temperature: 0.7,
          },
          messages: ollamaMessages,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Ollama response error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed);
            if (data.message?.content) {
              fullResponse += data.message.content;
              setMessages(prev => prev.map(msg =>
                msg.id === assistantId ? { ...msg, text: fullResponse } : msg,
              ));
            }
          } catch {
            // ignore non-JSON chunks
          }
        }
      }

      if (!fullResponse) {
        throw new Error("Empty Ollama response");
      }
    } catch {
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId
          ? { ...msg, text: "I'm here to help you level up da! 💪 (Connect Ollama at localhost:11434 for live AI responses)" }
          : msg,
      ));
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
