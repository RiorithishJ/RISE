export interface TopicConfig {
  temperature: number;
  maxTokens: number;
  useGemini: boolean;
  systemAddition: string;
}

export function getTopicConfig(message: string, hasAttachment: boolean): TopicConfig {
  const msg = message.toLowerCase();

  if (msg.includes('code') || msg.includes('bug') || msg.includes('error') || msg.includes('function') || msg.includes('python') || msg.includes('javascript')) {
    return {
      temperature: 0.1,
      maxTokens: 1500,
      useGemini: true,
      systemAddition: `You are also an expert software engineer. Format all code in proper markdown code blocks. Explain each step clearly. Point out potential bugs proactively.`
    };
  }

  if (hasAttachment || msg.includes('analyze') || msg.includes('report') || msg.includes('document') || msg.includes('review')) {
    return {
      temperature: 0.2,
      maxTokens: 3000,
      useGemini: true,
      systemAddition: `You are an expert analyst. Analyze thoroughly with these sections: Executive Summary, Key Insights, Risks, Action Items, Data & Metrics, Expert Verdict. Be comprehensive and miss nothing important.`
    };
  }

  if (msg.includes('job') || msg.includes('interview') || msg.includes('resume') || msg.includes('career') || msg.includes('linkedin')) {
    return {
      temperature: 0.4,
      maxTokens: 1000,
      useGemini: true,
      systemAddition: `You are a senior tech career coach with 10 years experience hiring AI engineers. Give specific actionable advice. Be honest about gaps. Reference Rio's actual skills and goals from context.`
    };
  }

  if (msg.includes('workout') || msg.includes('pushup') || msg.includes('running') || msg.includes('exercise') || msg.includes('fitness')) {
    return {
      temperature: 0.5,
      maxTokens: 500,
      useGemini: false,
      systemAddition: `You are a fitness coach. Reference Rio's actual fitness data from context. Be motivating but strict. Push for consistency. Celebrate PRs.`
    };
  }

  if (msg.includes('learn') || msg.includes('study') || msg.includes('explain') || msg.includes('understand') || msg.includes('what is')) {
    return {
      temperature: 0.3,
      maxTokens: 1500,
      useGemini: true,
      systemAddition: `You are an expert teacher. Explain concepts clearly with examples. Use analogies Rio can relate to. Build from basics to advanced. Check understanding at the end.`
    };
  }

  const sensitiveKeywords = ['confidential', 'private', 'secret', 'company', 'company details', 'salary', 'internal', 'classified', 'proprietary'];
  const isSensitive = sensitiveKeywords.some((keyword) => msg.includes(keyword));

  return {
    temperature: 0.7,
    maxTokens: 300,
    useGemini: !isSensitive,
    systemAddition: ''
  };
}
