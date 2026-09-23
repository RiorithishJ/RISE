interface UserPattern {
  preferredResponseLength: 'short' | 'medium' | 'long';
  preferredTone: 'strict' | 'friendly' | 'balanced';
  activeHours: number[];
  topTopics: string[];
  tamilUsagePreference: number;
  avgMessageLength: number;
  questionsAsked: string[];
  feedbackSignals: string[];
  lastUpdated: string;
}

export class PersonalityEngine {
  private patterns: UserPattern;

  constructor() {
    const saved = localStorage.getItem('rise_user_patterns');
    this.patterns = saved ? JSON.parse(saved) : this.getDefaultPatterns();
  }

  analyzeMessage(userMessage: string, riseResponse: string, feedback?: 'positive' | 'negative') {
    const msgLen = userMessage.length;
    this.patterns.avgMessageLength = (this.patterns.avgMessageLength + msgLen) / 2;

    if (riseResponse.length > 500 && !feedback?.includes('too long' as any)) {
      this.patterns.preferredResponseLength = 'long';
    }

    const hour = new Date().getHours();
    if (!this.patterns.activeHours.includes(hour)) this.patterns.activeHours.push(hour);

    const topics = this.extractTopics(userMessage);
    topics.forEach(topic => { if (!this.patterns.topTopics.includes(topic)) this.patterns.topTopics.push(topic); });

    const tamilWords = ['da', 'machan', 'sollu', 'dei', 'enna', 'nalla', 'super', 'ponga'];
    const hasTamil = tamilWords.some(w => userMessage.toLowerCase().includes(w));
    if (hasTamil) this.patterns.tamilUsagePreference = Math.min(1, this.patterns.tamilUsagePreference + 0.1);

    this.savePatterns();
  }

  extractTopics(message: string): string[] {
    const topicKeywords: Record<string, string[]> = {
      coding: ['code', 'bug', 'function', 'error', 'python', 'javascript'],
      career: ['job', 'interview', 'resume', 'linkedin', 'career', 'salary'],
      fitness: ['workout', 'pushup', 'running', 'exercise', 'gym', 'health'],
      ai: ['model', 'llm', 'agent', 'training', 'dataset', 'neural'],
      study: ['learn', 'study', 'course', 'exam', 'college', 'paper']
    };

    const detected: string[] = [];
    const msgLower = message.toLowerCase();
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(k => msgLower.includes(k))) detected.push(topic);
    });
    return detected;
  }

  generateAdaptiveSystemPrompt(currentPage: string, pageData: any): string {
    const p = this.patterns;
    const hour = new Date().getHours();
    const timeContext = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    const tamilLevel = p.tamilUsagePreference > 0.5 ? 'Mix Tamil frequently and naturally' : 'Use Tamil occasionally';

    const responseStyle = p.preferredResponseLength === 'short' ? 'Keep responses very concise 1-2 sentences' : p.preferredResponseLength === 'long' ? 'Give detailed comprehensive responses' : 'Give medium length balanced responses';

    const topTopicsStr = p.topTopics.slice(0, 5).join(', ');

    return `You are RISE (Real Intelligence for Self Evolution). Personal AI mentor of Rio, 4th year CS student and AI intern from Coimbatore Tamil Nadu India.\n\nLEARNED USER PATTERNS:\n- Active time: ${timeContext}\n- Favorite topics: ${topTopicsStr}\n- ${tamilLevel}\n- ${responseStyle}\n- Avg message length: ${Math.round(p.avgMessageLength)} chars\n\nPERSONALITY (strict + friendly mentor):\n- Call out laziness directly\n- Celebrate achievements warmly\n- Goal: Rio becomes AI Engineer\n- Weakness to watch: consistency\n\nCURRENT CONTEXT:\n- Page: ${currentPage}\n- Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n- Data: ${JSON.stringify(pageData)}\n\nRESPONSE RULES:\n- Never make up data not in context\n- Reference actual page data when relevant\n- Adapt to user's current mood and energy\n- Be direct, never generic or robotic`;
  }

  getPatterns() { return this.patterns; }

  private savePatterns() {
    this.patterns.lastUpdated = new Date().toISOString();
    localStorage.setItem('rise_user_patterns', JSON.stringify(this.patterns));
  }

  private getDefaultPatterns(): UserPattern {
    return {
      preferredResponseLength: 'medium',
      preferredTone: 'balanced',
      activeHours: [],
      topTopics: ['ai', 'coding', 'career'],
      tamilUsagePreference: 0.5,
      avgMessageLength: 50,
      questionsAsked: [],
      feedbackSignals: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

export const personalityEngine = new PersonalityEngine();
