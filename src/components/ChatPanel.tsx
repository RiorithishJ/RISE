import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";
import { getAIResponse, getAIProvider } from "@/services/AIRouter";
import { personalityEngine } from "@/services/PersonalityEngine";
import { getTopicConfig } from "@/services/TopicTuner";
import { fineTuner } from "@/services/FineTuner";

interface Message {
  id: number;
  text: string;
  sender: "user" | "rise";
  time: string;
  isError?: boolean;
  aiProvider?: string;
  userPrompt?: string;
  topic?: string;
  isStreaming?: boolean;
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
  const [messages, setMessages] = useState<Message[]>(initialMessages as Message[]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const systemPrompt = personalityEngine.generateAdaptiveSystemPrompt(currentPage, pageData);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const content = input.trim();
    const topic = personalityEngine.extractTopics(content)[0] || 'general';
    const topicConfig = getTopicConfig(content, false);

    const finalPrompt = systemPrompt + "\n" + topicConfig.systemAddition + (fineTuner.getFewShotExamples(topic) || '');

    const provider = topicConfig.useGemini ? 'gemini' : 'local';

    const userMsg: Message = { id: Date.now(), text: content, sender: 'user', time: 'Just now', userPrompt: content };
    const assistantId = Date.now() + 1;
    setMessages(prev => [...prev, userMsg, { id: assistantId, text: '', sender: 'rise', time: 'Just now', isStreaming: true, aiProvider: provider, topic }]);
    setInput('');
    setIsLoading(true);

    let fullResponse = '';
    try {
      fullResponse = await getAIResponse(content, [], finalPrompt, false, undefined, (chunk) => {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: (m.text || '') + chunk } : m));
      }, topicConfig.useGemini);

      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));

      personalityEngine.analyzeMessage(content, fullResponse);
      fineTuner.saveTrainingExample(content, fullResponse, 3, topic);

    } catch (error: any) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: `Connection error da. ${provider === 'gemini' ? 'Gemini API issue' : 'Ollama not running'} — machan check and try again.`, isStreaming: false, isError: true } : m));
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
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.sender === 'user' ? 'bg-muted text-rise-text rounded-br-md' : 'bg-card border border-border text-rise-text rounded-bl-md'
            }`} style={msg.sender === 'rise' ? { boxShadow: 'var(--shadow-card)' } : {}}>
              {msg.text}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
              {msg.sender === 'rise' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => { fineTuner.saveTrainingExample(msg.userPrompt || '', msg.text, 5, msg.topic || 'general'); }} className="text-gray-400 hover:text-green-500 transition-colors text-sm">👍</button>
                  <button onClick={() => { fineTuner.saveTrainingExample(msg.userPrompt || '', msg.text, 1, msg.topic || 'general'); }} className="text-gray-400 hover:text-red-500 transition-colors text-sm">👎</button>
                  <button onClick={() => navigator.clipboard?.writeText(msg.text || '')} className="text-gray-400 hover:text-gray-600 transition-colors text-sm">📋</button>
                  <span className="text-xs text-gray-300">{msg.aiProvider === 'gemini' ? '✨ Gemini' : '🔒 Local'}</span>
                </div>
              )}
            </div>
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
          <button onClick={async () => {
            try {
              const res = await fetch('/ollama/api/tags');
              const data = await res.json();
              console.log('Ollama connected:', data);
              alert('Ollama connected! Models: ' + data.models?.map((m: any) => m.name).join(', '));
            } catch (e: any) {
              console.error('Ollama failed:', e);
              alert('Ollama failed: ' + e.message);
            }
          }} className="text-muted-foreground hover:text-rise-text transition-colors">
            Test Ollama
          </button>
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
