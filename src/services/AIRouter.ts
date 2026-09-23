// Single source of truth for all model routing in RISE
// `@google/generative-ai` is loaded dynamically in getGeminiResponse

const GEMINI_MODEL = 'gemini-2.0-flash';
const OLLAMA_MODEL = 'deepseek-r1:8b';

function shouldUseLocal(message: string, hasAttachment: boolean, attachmentName?: string): boolean {
  const sensitiveKeywords = [
    'confidential', 'private', 'secret',
    'company', 'company details', 'salary', 'password',
    'personal', 'medical', 'legal',
    'internal', 'classified', 'proprietary'
  ];

  const messageLower = message.toLowerCase();

  if (sensitiveKeywords.some(k => messageLower.includes(k))) return true;
  if (!navigator.onLine) return true;
  if (hasAttachment) return true;
  return false;
}

export function getConfiguredModel(message: string, hasAttachment: boolean): string {
  return shouldUseLocal(message, hasAttachment) ? OLLAMA_MODEL : GEMINI_MODEL;
}

export async function getAIResponse(
  message: string,
  history: any[],
  systemPrompt: string,
  hasAttachment: boolean = false,
  attachmentContent?: string,
  onChunk?: (chunk: string) => void,
  preferGemini: boolean = true
): Promise<string> {
  const useLocal = !preferGemini || shouldUseLocal(message, hasAttachment);
  if (useLocal) {
    return await getOllamaResponse(message, history, systemPrompt, attachmentContent, onChunk);
  } else {
    return await getGeminiResponse(message, history, systemPrompt, attachmentContent, onChunk);
  }
}

async function getGeminiResponse(
  message: string,
  history: any[],
  systemPrompt: string,
  attachmentContent?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    // dynamic import to avoid bundler resolving issues in browser builds
    const mod = await import('@google/generative-ai').catch(() => null as any);
    if (!mod || !mod.GoogleGenerativeAI) throw new Error('Gemini SDK not available');
    const { GoogleGenerativeAI } = mod;
    const geminiClient = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

    const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: systemPrompt });
    const geminiHistory = history.slice(-20).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const chat = model.startChat({ history: geminiHistory });
    const fullMessage = attachmentContent ? `${message}\n\nAttached content:\n${attachmentContent}` : message;
    const result = await chat.sendMessageStream(fullMessage);
    let fullResponse = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      if (onChunk) onChunk(text);
    }
    return fullResponse;
  } catch (error) {
    console.error('Gemini failed, falling back to Ollama:', error);
    return await getOllamaResponse(message, history, systemPrompt, attachmentContent, onChunk);
  }
}

async function getOllamaResponse(
  message: string,
  history: any[],
  systemPrompt: string,
  attachmentContent?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const fullMessage = attachmentContent ? `${message}\n\nContent:\n${attachmentContent}` : message;

  const response = await fetch('/ollama/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: true,
      options: { num_predict: 2000, temperature: 0.3, top_p: 0.9 },
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10),
        { role: 'user', content: fullMessage }
      ]
    })
  });

  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.message?.content) {
          fullResponse += data.message.content;
          if (onChunk) onChunk(data.message.content);
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return fullResponse;
}

export function getAIProvider(message: string, hasAttachment: boolean): string {
  return shouldUseLocal(message, hasAttachment) ? 'local' : 'gemini';
}
