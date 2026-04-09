import { useState } from "react";
import { Send, Mic } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "rise";
  time: string;
}

const initialMessages: Message[] = [
  { id: 1, text: "How many calories did I burn yesterday?", sender: "user", time: "2 hours ago" },
  { id: 2, text: "You burned 420 kcal across 3 activities", sender: "rise", time: "2 hours ago" },
  { id: 3, text: "Great job Rio! Your push-ups increased by 15% this week. Keep pushing! 💪", sender: "rise", time: "1 hour ago" },
  { id: 4, text: "What should I focus on today?", sender: "user", time: "30 min ago" },
  { id: 5, text: "Based on your goals, I'd suggest:\n1. Complete 50 push-ups\n2. 2 Pomodoro sessions on ML\n3. Push your project code to GitHub", sender: "rise", time: "30 min ago" },
];

const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: "Just now",
    };
    setMessages([...messages, newMsg]);
    setInput("");
    // Fake RISE response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm processing your request. This is a demo response from RISE AI!",
        sender: "rise",
        time: "Just now",
      }]);
    }, 1000);
  };

  return (
    <div className="w-[320px] shrink-0 bg-white rounded-r-3xl flex flex-col border-l border-rise-border relative overflow-hidden">
      {/* Header gradient */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-orange-100/60 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="p-4 flex items-center justify-center relative z-10">
        <div className="flex items-center gap-2 bg-rise-orange/10 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-rise-orange animate-pulse" />
          <span className="text-rise-orange font-semibold text-sm">RISE AI</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-rise-bg text-rise-text rounded-br-md"
                  : "bg-white border border-rise-border text-rise-text rounded-bl-md"
              }`}
              style={msg.sender === "rise" ? { boxShadow: "var(--shadow-card)" } : {}}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-rise-muted mt-1 px-1">{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-rise-border">
        <div className="flex items-center gap-2 bg-rise-bg rounded-full px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask RISE anything..."
            className="flex-1 bg-transparent text-sm outline-none text-rise-text placeholder:text-rise-muted"
          />
          <button className="text-rise-muted hover:text-rise-text transition-colors">
            <Mic size={16} />
          </button>
          <button
            onClick={handleSend}
            className="w-8 h-8 rounded-full bg-rise-orange flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
