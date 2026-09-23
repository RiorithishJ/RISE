import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Mic,
  Plus,
  MessageSquare,
  Trash2,
  Paperclip,
  Image,
  Lightbulb,
  Code,
  Target,
  Search,
  MoreHorizontal,
  Copy,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRISEContext } from "@/contexts/RISEContext";
import { getAIResponse } from "@/services/AIRouter";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: number;
  role: ChatRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
};

type ChatSession = {
  id: number;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

type Attachment = {
  id: number;
  file: File;
  previewUrl?: string;
  base64?: string;
  source: "picker" | "paste";
};

const SESSION_PREFIX = "rise_session_";
const allowedFileTypes = "application/pdf,.docx,.txt,image/png,image/jpeg,image/jpg";

const actionChips = [
  { icon: Lightbulb, label: "Brainstorm", prefix: "Brainstorm ideas for: " },
  { icon: Code, label: "Code", prefix: "Write code for: " },
  { icon: Target, label: "Get Advice", prefix: "Give me advice on: " },
  { icon: Search, label: "Web Search", prefix: "Search for: " },
];

const moreActions = [
  { label: "Summarize", prefix: "Summarize: " },
  { label: "Explain", prefix: "Explain: " },
  { label: "Compare", prefix: "Compare: " },
  { label: "Translate", prefix: "Translate to English: " },
  { label: "Debug Code", prefix: "Debug this code: " },
  { label: "Review", prefix: "Review: " },
];

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const getSessionKey = (id: number) => `${SESSION_PREFIX}${id}`;

const buildSystemPrompt = (currentPage: string, pageData: Record<string, any>) => {
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  return `You are RISE (Real Intelligence for Self Evolution). Personal AI mentor of Rio, 4th year CS student and AI intern from Coimbatore.
Goal: Become an AI Engineer. Weakness: consistency.
You are strict but friendly, and you naturally mix Tamil and English.
Use terms like da, machan, sollu naturally.
CURRENT CONTEXT:
Page: ${currentPage}
Data: ${JSON.stringify(pageData)}
Time: ${now}
RULES:
- Use actual numbers from Data above
- Never make up statistics
- Reference the page the user is on
- Keep responses 2-4 sentences unless more detail is asked
- Be honest and direct`;
};

const getSystemPrompt = (isDocumentAnalysis: boolean, currentPage: string, pageData: Record<string, any>) =>
  isDocumentAnalysis ? getAnalysisSystemPrompt() : buildSystemPrompt(currentPage, pageData);

const LoadingIndicator = () => (
  <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-3xl">
    <div className="relative w-10 h-10">
      <svg className="animate-spin w-10 h-10" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="#f0f0f0" strokeWidth="3" />
        <circle cx="20" cy="20" r="16" fill="none" stroke="#e85d35" strokeWidth="3" strokeDasharray="25 75" strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-orange-500">R</span>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-700">RISE is thinking...</p>
      <p className="text-xs text-gray-400">Processing your request</p>
    </div>
  </div>
);

const getInitialSession = (): ChatSession => {
  const now = new Date().toISOString();
  return {
    id: Date.now(),
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
};

const readPDF = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return text.trim();
};

const readDOCX = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
};

const readTXT = async (file: File) => {
  return (await file.text()).trim();
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to convert file to base64"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const FullChatPage = () => {
  const { currentPage, pageData } = useRISEContext();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const sessionsRef = useRef<ChatSession[]>([]);
  const activeSessionIdRef = useRef<number | null>(null);

  const setActiveSessionIdState = (id: number | null) => {
    activeSessionIdRef.current = id;
    setActiveSessionId(id);
    localStorage.setItem("rise_current_session", JSON.stringify(id));
  };

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? null,
    [sessions, activeSessionId],
  );

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(SESSION_PREFIX));
    const loaded = keys
      .map((key) => {
        try {
          return JSON.parse(localStorage.getItem(key) ?? "") as ChatSession;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (loaded.length === 0) {
      const initial = getInitialSession();
      localStorage.setItem(getSessionKey(initial.id), JSON.stringify(initial));
      sessionsRef.current = [initial];
      setSessions([initial]);
      setActiveSessionIdState(initial.id);
      return;
    }

    const savedActive = localStorage.getItem("rise_current_session");
    const parsedActive = savedActive ? (JSON.parse(savedActive) as number) : null;
    const selectedId = loaded.some((session) => session.id === parsedActive) ? parsedActive : loaded[0].id;

    sessionsRef.current = loaded;
    setSessions(loaded);
    setActiveSessionIdState(selectedId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages.length]);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedAttachments: Attachment[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          const base64 = await fileToBase64(file);
          const previewUrl = URL.createObjectURL(file);
          pastedAttachments.push({
            id: Date.now() + Math.random(),
            file,
            previewUrl,
            base64,
            source: "paste",
          });
        }
      }

      if (pastedAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...pastedAttachments]);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, [attachments]);

  const saveSession = (session: ChatSession) => {
    localStorage.setItem(getSessionKey(session.id), JSON.stringify(session));
    const next = sessionsRef.current.some((item) => item.id === session.id)
      ? sessionsRef.current.map((item) => (item.id === session.id ? session : item))
      : [session, ...sessionsRef.current];
    const sorted = next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    sessionsRef.current = sorted;
    setSessions(sorted);
  };

  const removeSession = (sessionId: number) => {
    localStorage.removeItem(getSessionKey(sessionId));
    const next = sessionsRef.current.filter((session) => session.id !== sessionId);
    if (next.length === 0) {
      const fresh = getInitialSession();
      localStorage.setItem(getSessionKey(fresh.id), JSON.stringify(fresh));
      sessionsRef.current = [fresh];
      setSessions([fresh]);
      setActiveSessionIdState(fresh.id);
      return;
    }

    sessionsRef.current = next;
    setSessions(next);
    if (activeSessionIdRef.current === sessionId) {
      setActiveSessionIdState(next[0].id);
    }
  };

  const createNewSession = () => {
    const fresh = getInitialSession();
    saveSession(fresh);
    setActiveSessionIdState(fresh.id);
    setInput("");
    setAttachments((prev) => {
      prev.forEach((attachment) => {
        if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
      });
      return [];
    });
  };

  const handleSelectSession = (sessionId: number) => {
    setActiveSessionIdState(sessionId);
    setInput("");
    setAttachments((prev) => {
      prev.forEach((attachment) => {
        if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
      });
      return [];
    });
  };

  const createMessageTimestamp = () =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const updateSessionMessage = (sessionId: number, messageId: number, updater: (message: ChatMessage) => ChatMessage) => {
    const session = sessionsRef.current.find((item) => item.id === sessionId);
    if (!session) return;
    const next = {
      ...session,
      messages: session.messages.map((message) => (message.id === messageId ? updater(message) : message)),
      updatedAt: new Date().toISOString(),
    };
    saveSession(next);
  };

  const getFileText = async (file: File) => {
    if (file.type === "application/pdf") return readPDF(file);
    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")
    )
      return readDOCX(file);
    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) return readTXT(file);
    if (file.type.startsWith("image/")) return fileToBase64(file);
    return `Unsupported file type: ${file.type || file.name}`;
  };

  const isImageFile = (file: File) => file.type.startsWith("image/");

  function getAnalysisSystemPrompt() {
    return `
You are an expert analyst with deep expertise in:
- Business strategy and operations
- Technical documentation review
- Research paper analysis
- Financial report interpretation
- Risk assessment and mitigation
- Data extraction and summarization

When analyzing any document follow this structure:

## 📋 EXECUTIVE SUMMARY
Clear 3-4 sentence overview of the entire document.
What is this document about and why does it matter?

## 🔑 KEY INSIGHTS
5-7 most critical findings or points.
Each insight explained clearly with context.
Why each point is important.

## ⚠️ RISKS & CONCERNS
Identify any risks, gaps, issues or red flags.
Rate each: 🔴 High / 🟡 Medium / 🟢 Low
Explain why each is a risk.

## ✅ ACTION ITEMS
Concrete next steps and recommendations.
Who should do what and by when if mentioned.
Prioritized by importance.

## 📊 DATA & METRICS
All numbers, percentages, dates, KPIs found.
Presented in clean structured format.
Context for each metric.

## 💡 EXPERT VERDICT
Your honest expert assessment.
Quality score: X/10 with justification.
What is strong, what is weak.
What is missing that should be there.

RULES:
- Be thorough and miss nothing important
- Flag anything unclear or ambiguous
- Use actual data from the document
- Never make up information
- Be direct and professional
- If technical document use technical terms
- If business document use business context
`;
  }

  const detectDocumentAnalysis = (messageText: string, attachments: Attachment[]) => {
    const lower = messageText.toLowerCase();
    const keywords = ["document", "report", "financial", "methodology", "requirements", "strategy", "analysis", "paper", "research", "risk", "metrics", "data"];
    const hasKeyword = keywords.some((keyword) => lower.includes(keyword));
    const hasDocumentAttachment = attachments.some((attachment) => !isImageFile(attachment.file));
    return hasDocumentAttachment || (attachments.length > 0 && isImageFile(attachments[0].file)) || hasKeyword;
  };

  const buildMessageContent = async (messageText: string, attachments: Attachment[]) => {
    if (attachments.length === 0) return messageText;

    const attachmentDescriptions = await Promise.all(
      attachments.map(async (attachment) => {
        const fileData = isImageFile(attachment.file) ? "[image attached]" : await getFileText(attachment.file);
        return `Attached file: ${attachment.file.name}\nFile size: ${formatBytes(attachment.file.size)}\nFile type: ${attachment.file.type || "unknown"}\n${fileData}`;
      }),
    );

    return `${messageText}\n\n${attachmentDescriptions.join("\n\n")}`;
  };

  const buildOllamaUserContent = async (messageText: string, attachments: Attachment[]): Promise<string | Array<any>> => {
    const images = attachments.filter((attachment) => isImageFile(attachment.file));
    const nonImages = attachments.filter((attachment) => !isImageFile(attachment.file));
    const textPart = messageText || (images.length > 0 ? "Analyze this image" : "Please analyze the attached document");
    const content: Array<any> = [{ type: "text", text: textPart }];

    if (images.length > 0) {
      for (const attachment of images) {
        const url = attachment.base64 ?? (await fileToBase64(attachment.file));
        content.push({
          type: "image_url",
          image_url: { url },
        });
      }
    }

    if (nonImages.length > 0) {
      const fileSummaries = await Promise.all(
        nonImages.map(async (attachment) => {
          const fileData = await getFileText(attachment.file);
          return `Attached file: ${attachment.file.name}\nFile size: ${formatBytes(attachment.file.size)}\nFile type: ${attachment.file.type || "unknown"}\n${fileData}`;
        }),
      );
      content[0].text += `\n\n${fileSummaries.join("\n\n")}`;
    }

    return images.length > 0 ? content : content[0].text;
  };

  const getSessionTitle = (session: ChatSession) => {
    if (session.title && session.title !== "New Chat") return session.title;
    const userMessage = session.messages.find((message) => message.role === "user");
    if (userMessage) return userMessage.content.slice(0, 40) || "New Chat";
    return "New Chat";
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const acceptable = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    const newAttachments = files
      .filter((file) => acceptable.includes(file.type) || file.name.toLowerCase().endsWith(".docx"))
      .map((file, index) => ({
        id: Date.now() + index,
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        source: "picker" as const,
      }));

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    event.target.value = "";
  };

  const removeAttachment = (attachmentId: number) => {
    setAttachments((prev) => {
      const next = prev.filter((attachment) => {
        if (attachment.id === attachmentId && attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
        return attachment.id !== attachmentId;
      });
      return next;
    });
  };

  const copyMessage = async (content: string, messageId: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const applyPrefix = (prefix: string) => {
    setInput((prev) => `${prefix}${prev}`.trimStart());
  };

  const handleVoiceInput = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      let transcript = "";
      recognition.onresult = (event: any) => {
        transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          handleSend(transcript);
        }
      };

      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const streamOllamaResponse = async (
    session: ChatSession,
    assistantId: number,
    messagesForOllama: Array<{ role: string; content: string | Array<any> }>,
    isDocumentAnalysis: boolean,
    options: Record<string, unknown>,
  ) => {
    try {
      const systemPrompt = getSystemPrompt(isDocumentAnalysis, currentPage, pageData);
      const messageText = messagesForOllama[messagesForOllama.length - 1]?.content?.toString?.() || "";
      const history = messagesForOllama.slice(0, -1).map((message) => ({
        role: message.role,
        content: typeof message.content === "string" ? message.content : JSON.stringify(message.content),
      }));

      let output = "";
      await getAIResponse(
        messageText,
        history,
        systemPrompt,
        isDocumentAnalysis,
        undefined,
        (chunk) => {
          output += chunk;
          updateSessionMessage(session.id, assistantId, (message) => ({
            ...message,
            content: output,
          }));
        },
        !isDocumentAnalysis,
      );

      updateSessionMessage(session.id, assistantId, (message) => ({
        ...message,
        isStreaming: false,
      }));
    } catch (error: any) {
      console.error("Ollama error:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
      });
      const errorMessage = `Connection error da: ${error?.message}. Check browser console for details.`;
      updateSessionMessage(session.id, assistantId, (message) => ({
        ...message,
        content: errorMessage,
        isStreaming: false,
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async (overrideText?: string) => {
    if (!activeSession || isSending) return;

    const trimmedInput = (overrideText ?? input).trim();
    if (!trimmedInput && attachments.length === 0) return;

    setIsSending(true);
    const messageText = trimmedInput || "Please analyze the attached file.";
    const richContent = await buildMessageContent(messageText, attachments);
    const userContent = await buildOllamaUserContent(messageText, attachments);
    const hasDocumentAnalysis = detectDocumentAnalysis(messageText, attachments);

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: richContent,
      timestamp: createMessageTimestamp(),
    };

    const assistantMessage: ChatMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
      timestamp: createMessageTimestamp(),
      isStreaming: true,
    };

    const nextSession: ChatSession = {
      ...activeSession,
      title: activeSession.title === "New Chat" ? userMessage.content.slice(0, 40) || "New Chat" : activeSession.title,
      messages: [...activeSession.messages, userMessage, assistantMessage],
      updatedAt: new Date().toISOString(),
    };

    saveSession(nextSession);
    setInput("");
    attachments.forEach((attachment) => {
      if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    });
    setAttachments([]);

    const previousMessages = nextSession.messages
      .filter((message) => message.id !== assistantMessage.id)
      .map((message) => ({ role: message.role, content: message.content }));

    const messagesForOllama = [
      ...previousMessages,
      { role: "user", content: userContent },
    ];

    const options = {
      num_predict: hasDocumentAnalysis ? 2000 : 300,
      temperature: hasDocumentAnalysis ? 0.2 : 0.7,
      top_p: 0.9,
      repeat_penalty: 1.1,
    };

    streamOllamaResponse(nextSession, assistantMessage.id, messagesForOllama, hasDocumentAnalysis, options);
  };

  const isSendDisabled = isSending || (!input.trim() && attachments.length === 0);

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="w-[300px] bg-muted/60 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <button onClick={createNewSession} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus size={16} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={`w-full rounded-3xl p-3 text-left transition-colors ${session.id === activeSession?.id ? "bg-card shadow-sm border border-primary/20" : "hover:bg-card/50"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-rise-text">{getSessionTitle(session)}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(session.updatedAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</div>
                </div>
                <button onClick={(event) => { event.stopPropagation(); removeSession(session.id); }} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-card min-h-0 overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-rise-text">RISE AI Chat</div>
            <div className="text-[12px] text-muted-foreground">{activeSession ? `${activeSession.messages.length} messages` : "Start a new conversation"}</div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Current page: <span className="text-rise-text font-semibold">{currentPage}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-6 space-y-4 min-h-0">
          {activeSession?.messages.length ? (
            activeSession.messages.filter((msg) => !(msg.role === "assistant" && msg.isStreaming && !msg.content)).map((msg) => (
              <div key={msg.id} className={`group flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mr-3 mt-1">
                    <span className="text-primary-foreground text-xs font-bold">R</span>
                  </div>
                )}
                <div className="max-w-[65%]">
                  <div className={`relative px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-muted text-rise-text rounded-br-md" : "bg-card border border-border text-rise-text rounded-bl-md"}`} style={msg.role === "assistant" ? { boxShadow: "var(--shadow-card)" } : undefined}>
                    <div>{msg.content}</div>
                    <button onClick={() => copyMessage(msg.content, msg.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rise-text">
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{msg.timestamp}</span>
                    {copiedMessageId === msg.id && <span className="text-success">Copied!</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Start a new chat by typing a message, attaching a file, or using the voice button.
            </div>
          )}
          {activeSession?.messages.some((msg) => msg.role === "assistant" && msg.isStreaming && !msg.content) && (
            <LoadingIndicator />
          )}
          {activeSession?.messages.some((msg) => msg.role === "assistant" && msg.isStreaming && msg.content) && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mr-3 mt-1 animate-pulse">
                <span className="text-primary-foreground text-xs font-bold">R</span>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-xs text-muted-foreground mb-1">RISE is thinking...</p>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-8 pb-2 flex flex-wrap gap-2">
          {actionChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button key={chip.label} onClick={() => applyPrefix(chip.prefix)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Icon size={12} /> {chip.label}
              </button>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 transition-colors">
                <MoreHorizontal size={12} /> More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {moreActions.map((action) => (
                <DropdownMenuItem key={action.label} onClick={() => applyPrefix(action.prefix)}>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {attachments.length > 0 && (
          <div className="px-8 pb-3 space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="rounded-3xl border border-border bg-muted p-4 flex items-center gap-4">
                {attachment.previewUrl ? (
                  <img src={attachment.previewUrl} alt={attachment.file.name} className="w-16 h-16 rounded-2xl object-cover border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-border flex items-center justify-center text-sm text-muted-foreground">FILE</div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-rise-text">{attachment.file.name}</div>
                  <div className="text-[11px] text-muted-foreground">{formatBytes(attachment.file.size)}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {attachment.source === "paste" && isImageFile(attachment.file)
                      ? "Image ready to send"
                      : attachment.source === "paste"
                      ? "Pasted file ready to send"
                      : isImageFile(attachment.file)
                      ? "Image attached"
                      : "File attached"
                    }
                  </div>
                </div>
                <button onClick={() => removeAttachment(attachment.id)} className="text-muted-foreground hover:text-destructive">
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="px-8 pb-6 pt-2">
          <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-3">
            <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-rise-text transition-colors">
              <Paperclip size={18} />
            </button>
            <input ref={fileInputRef} type="file" multiple accept={allowedFileTypes} onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-rise-text transition-colors">
              <Image size={18} />
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask RISE anything..." className="flex-1 bg-transparent text-sm outline-none text-rise-text placeholder:text-muted-foreground" />
            <button onClick={handleVoiceInput} type="button" className={`relative text-muted-foreground transition-colors ${isListening ? "text-destructive" : "hover:text-rise-text"}`}>
              <Mic size={18} />
              {isListening && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />}
            </button>
            <button onClick={() => handleSend()} disabled={isSendDisabled} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50">
              <Send size={16} className="text-primary-foreground" />
            </button>
          </div>
          {isListening && <div className="mt-2 text-[11px] text-muted-foreground">Listening...</div>}
        </div>
      </div>
    </div>
  );
};

export default FullChatPage;
