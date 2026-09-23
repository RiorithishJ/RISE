import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, FileText, X, Copy, Download, Send, Lock } from "lucide-react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { useRISEContext } from "@/contexts/RISEContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

GlobalWorkerOptions.workerSrc = pdfWorker;

type Depth = "quick" | "detailed" | "expert";
type AnalysisOption = "executive" | "insights" | "risks" | "actions" | "metrics" | "full";

interface UploadState {
  file: File | null;
  extractedText: string;
}

interface ParsedSection {
  title: string;
  content: string;
}

const optionLabels: Record<AnalysisOption, string> = {
  executive: "Executive Summary",
  insights: "Key Insights",
  risks: "Risk Analysis",
  actions: "Action Items",
  metrics: "Extract Metrics/Data",
  full: "Full Deep Analysis (all of above)",
};

const depthInstructions: Record<Depth, string> = {
  quick: "Keep each section concise: 3-5 sentences max per section.",
  detailed: "Provide comprehensive, well-structured detail across all requested sections.",
  expert: "Give maximum-depth expert-level analysis with rigorous structure and precision.",
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const normalizeHeading = (text: string) =>
  text
    .trim()
    .toUpperCase()
    .replace(/[&]/g, "AND")
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ");

const canonicalSections = [
  "EXECUTIVE SUMMARY",
  "KEY INSIGHTS",
  "RISKS CONCERNS",
  "ACTION ITEMS",
  "DATA METRICS",
  "OVERALL ASSESSMENT",
  "DOCUMENT COMPARISON",
];

const parseSections = (analysisText: string): ParsedSection[] => {
  const headingRegex = /^##\s+(.+)$/gm;
  const matches = Array.from(analysisText.matchAll(headingRegex));

  if (!matches.length) return [];

  return matches
    .map((match, index) => {
      const title = match[1].trim();
      const start = (match.index ?? 0) + match[0].length;
      const end = index + 1 < matches.length ? (matches[index + 1].index ?? analysisText.length) : analysisText.length;
      const content = analysisText.slice(start, end).trim();
      return { title, content };
    })
    .filter((section) => section.content.length > 0)
    .sort((a, b) => {
      const aIndex = canonicalSections.findIndex((x) => normalizeHeading(a.title).includes(x));
      const bIndex = canonicalSections.findIndex((x) => normalizeHeading(b.title).includes(x));
      const safeA = aIndex === -1 ? 999 : aIndex;
      const safeB = bIndex === -1 ? 999 : bIndex;
      return safeA - safeB;
    });
};

const extractTextFromPDF = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => (typeof item.str === "string" ? item.str : ""))
      .join(" ");
    fullText += `${text}\n`;
  }
  return fullText;
};

const extractTextFromDOCX = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const extractTextFromFile = async (file: File) => {
  const ext = file.name.toLowerCase().split(".").pop();

  if (ext === "pdf") return extractTextFromPDF(file);
  if (ext === "docx") return extractTextFromDOCX(file);
  if (ext === "txt") return file.text();

  throw new Error("Unsupported file format. Please use PDF, DOCX, or TXT.");
};

const AnalyzePage = () => {
  const { setCurrentPage, setPageData } = useRISEContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const secondFileInputRef = useRef<HTMLInputElement | null>(null);

  const [primaryUpload, setPrimaryUpload] = useState<UploadState>({ file: null, extractedText: "" });
  const [secondaryUpload, setSecondaryUpload] = useState<UploadState>({ file: null, extractedText: "" });
  const [rawText, setRawText] = useState("");
  const [secondRawText, setSecondRawText] = useState("");
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOption[]>(["full"]);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [depth, setDepth] = useState<Depth>("expert");
  const [confidentialMode, setConfidentialMode] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const [askInput, setAskInput] = useState("");
  const [askResponse, setAskResponse] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const docText = useMemo(() => rawText.trim() || primaryUpload.extractedText.trim(), [rawText, primaryUpload.extractedText]);
  const compareText = useMemo(
    () => secondRawText.trim() || secondaryUpload.extractedText.trim(),
    [secondRawText, secondaryUpload.extractedText],
  );

  const parsedSections = useMemo(() => parseSections(analysisText), [analysisText]);

  useEffect(() => {
    setCurrentPage("analyze");
    setPageData({
      analyze: {
        hasDocument: Boolean(docText),
        options: analysisOptions,
        depth,
        confidentialMode,
        comparisonEnabled,
      },
    });
  }, [setCurrentPage, setPageData, docText, analysisOptions, depth, confidentialMode, comparisonEnabled]);

  useEffect(() => {
    if (!confidentialMode) return;

    const clearTimer = window.setTimeout(() => {
      setPrimaryUpload({ file: null, extractedText: "" });
      setSecondaryUpload({ file: null, extractedText: "" });
      setRawText("");
      setSecondRawText("");
      setAnalysisText("");
      setAskInput("");
      setAskResponse("");
    }, 30 * 60 * 1000);

    return () => window.clearTimeout(clearTimer);
  }, [confidentialMode]);

  const onUploadFile = async (file: File, secondary = false) => {
    setError("");
    try {
      const text = await extractTextFromFile(file);
      if (secondary) {
        setSecondaryUpload({ file, extractedText: text });
      } else {
        setPrimaryUpload({ file, extractedText: text });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to extract text from the selected file.");
    }
  };

  const clearPrimary = () => {
    setPrimaryUpload({ file: null, extractedText: "" });
    setRawText("");
    setAnalysisText("");
    setAskResponse("");
    setError("");
  };

  const clearSecondary = () => {
    setSecondaryUpload({ file: null, extractedText: "" });
    setSecondRawText("");
    setAnalysisText("");
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, secondary = false) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await onUploadFile(file, secondary);
  };

  const toggleOption = (option: AnalysisOption, checked: boolean) => {
    if (option === "full") {
      setAnalysisOptions(checked ? ["full"] : []);
      return;
    }

    setAnalysisOptions((prev) => {
      const withoutFull = prev.filter((x) => x !== "full");
      if (checked) return [...withoutFull, option];
      return withoutFull.filter((x) => x !== option);
    });
  };

  const getRequiredSections = () => {
    if (analysisOptions.includes("full")) {
      return [
        optionLabels.executive,
        optionLabels.insights,
        optionLabels.risks,
        optionLabels.actions,
        optionLabels.metrics,
      ];
    }

    return analysisOptions.map((option) => optionLabels[option]);
  };

  const buildAnalysisPrompt = () => {
    const requiredSections = getRequiredSections();

    const analysisPrompt = `You are an expert 
business analyst and document reviewer 
with 20 years experience.

Analyze this document at the highest level:

Document content:
${docText}

Provide:

## EXECUTIVE SUMMARY
3-4 sentence overview of entire document

## KEY INSIGHTS
Top 5-7 most important points
Each as a clear bullet with explanation

## RISKS & CONCERNS
Any risks, issues or red flags identified
Rate each: High/Medium/Low

## ACTION ITEMS
Concrete next steps or recommendations
Who should do what

## DATA & METRICS
All numbers, percentages, dates mentioned
In a clean structured format

## OVERALL ASSESSMENT
Your expert verdict on this document
Rate overall quality: /10
One paragraph honest assessment

Be thorough, accurate and professional.
Do not miss anything important.
If something is unclear, flag it.`;

    const compareBlock = comparisonEnabled
      ? `

Second document content for comparison:
${compareText}

Also provide:

## DOCUMENT COMPARISON
Compare similarities, differences, and conflicts between both documents.
Call out contradictions, missing details, and business impact.`
      : "";

    const selectedBlock = `

Requested analysis focus:
${requiredSections.length ? requiredSections.join(", ") : "Full document review"}

Depth requirement:
${depthInstructions[depth]}

Keep heading names exactly as requested (## ... format).`;

    return `${analysisPrompt}${compareBlock}${selectedBlock}`;
  };

  const streamChat = async (prompt: string, onChunk: (chunk: string) => void, options?: { numPredict?: number; temperature?: number }) => {
    const history: Array<{ role: string; content: string }> = [];
    const systemPrompt = `You are RISE AI. Provide a thorough, accurate analysis and answer concisely when asked.`;
    const response = await getAIResponse(
      prompt,
      history,
      systemPrompt,
      false,
      undefined,
      (chunk) => onChunk(chunk),
      false,
    );

    if (!response) {
      throw new Error("Ollama response error");
    }
  };

  const handleAnalyze = async () => {
    if (!docText) {
      setError("Upload a document or paste text before analyzing.");
      return;
    }
    if (!analysisOptions.length) {
      setError("Select at least one analysis type.");
      return;
    }
    if (comparisonEnabled && !compareText) {
      setError("Comparison mode is on. Add a second document or paste comparison text.");
      return;
    }

    setError("");
    setAnalysisText("");
    setAskResponse("");
    setIsAnalyzing(true);

    const prompt = buildAnalysisPrompt();

    try {
      await streamChat(prompt, (chunk) => {
        setAnalysisText((prev) => prev + chunk);
      }, { numPredict: 2000, temperature: 0.3 });
    } catch {
      setError("Unable to complete analysis. Verify Ollama is running and reachable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskRise = async () => {
    if (!askInput.trim() || !docText || !analysisText || isAsking) return;

    setIsAsking(true);
    setAskResponse("");

    const followupPrompt = `You are RISE AI. Answer this question using the document and analysis context.

Document content:
${docText}

Analysis report:
${analysisText}

Question:
${askInput.trim()}

Provide an accurate and concise expert answer.`;

    try {
      await streamChat(
        followupPrompt,
        (chunk) => setAskResponse((prev) => prev + chunk),
        { numPredict: 800, temperature: 0.35 },
      );
      setAskInput("");
    } catch {
      setAskResponse("Unable to answer right now. Please check Ollama and try again.");
    } finally {
      setIsAsking(false);
    }
  };

  const copyText = async (value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  const downloadPdfReport = () => {
    if (!analysisText) return;

    const doc = new jsPDF();
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.text("RISE Document Analysis Report", margin, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 24);

    let y = 32;
    const lines = doc.splitTextToSize(analysisText, maxWidth);

    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 6;
    });

    doc.save("rise-document-analysis.pdf");
  };

  return (
    <div className="main-content flex-1 overflow-hidden">
      <div className="h-full grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-hidden">
        <div className="overflow-y-auto pr-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">📄 Analyze</CardTitle>
                {confidentialMode && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                    <Lock className="h-3.5 w-3.5 mr-1" /> Confidential
                  </Badge>
                )}
              </div>
              <CardDescription>Upload a file or paste raw text for expert-level document analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                <div>
                  <p className="font-medium text-sm">Confidential Mode</p>
                  <p className="text-xs text-muted-foreground">No document content in chat history, no persistent saves, auto-clear in 30 minutes.</p>
                </div>
                <Switch checked={confidentialMode} onCheckedChange={setConfidentialMode} />
              </div>

              <div
                className="rounded-xl border-2 border-dashed border-border p-5 bg-muted/30"
                onDrop={(event) => handleDrop(event)}
                onDragOver={(event) => event.preventDefault()}
              >
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Upload className="h-4 w-4" /> Document Upload
                </div>
                <p className="text-xs text-muted-foreground mb-3">Drag and drop PDF, DOCX, or TXT</p>
                <div className="flex gap-2 flex-wrap">
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Upload Document
                  </Button>
                  <Button type="button" variant="ghost" onClick={clearPrimary}>
                    <X className="h-4 w-4" /> Clear
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (file) await onUploadFile(file);
                  }}
                />

                {primaryUpload.file && (
                  <div className="mt-3 rounded-md border bg-background px-3 py-2 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{primaryUpload.file.name}</span>
                    </div>
                    <span className="text-muted-foreground">{formatFileSize(primaryUpload.file.size)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-raw-text">Or paste raw text directly</Label>
                <Textarea
                  id="doc-raw-text"
                  value={rawText}
                  onChange={(event) => setRawText(event.target.value)}
                  placeholder="Paste your document text here..."
                  className="min-h-[160px]"
                />
              </div>

              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs leading-relaxed">
                🔒 Your documents are processed locally by RISE AI on your machine. Nothing is uploaded to any server.
              </div>

              <div className="space-y-3 pt-2 border-t">
                <p className="font-medium text-sm">Select analysis type</p>
                <div className="space-y-2">
                  {(Object.keys(optionLabels) as AnalysisOption[]).map((option) => {
                    const checked = analysisOptions.includes(option);
                    const disabled = option !== "full" && analysisOptions.includes("full");

                    return (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox
                          id={`analysis-${option}`}
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={(value) => toggleOption(option, Boolean(value))}
                        />
                        <Label htmlFor={`analysis-${option}`} className={disabled ? "text-muted-foreground" : ""}>
                          {optionLabels[option]}
                        </Label>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="compare-docs"
                    checked={comparisonEnabled}
                    onCheckedChange={(value) => setComparisonEnabled(Boolean(value))}
                  />
                  <Label htmlFor="compare-docs">Comparison between 2 documents</Label>
                </div>

                {comparisonEnabled && (
                  <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
                    <div
                      className="rounded-lg border-2 border-dashed border-border p-3"
                      onDrop={(event) => handleDrop(event, true)}
                      onDragOver={(event) => event.preventDefault()}
                    >
                      <p className="text-xs font-medium mb-2">Upload second document</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => secondFileInputRef.current?.click()}>
                        Upload Document 2
                      </Button>
                      <input
                        ref={secondFileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (file) await onUploadFile(file, true);
                        }}
                      />
                      {secondaryUpload.file && (
                        <div className="mt-2 rounded-md border bg-background px-3 py-2 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{secondaryUpload.file.name}</span>
                          </div>
                          <span className="text-muted-foreground">{formatFileSize(secondaryUpload.file.size)}</span>
                        </div>
                      )}
                      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={clearSecondary}>
                        <X className="h-4 w-4" /> Clear second document
                      </Button>
                    </div>

                    <Textarea
                      value={secondRawText}
                      onChange={(event) => setSecondRawText(event.target.value)}
                      placeholder="Or paste second document text..."
                      className="min-h-[120px]"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <p className="font-medium text-sm mb-2">Depth selector</p>
                  <RadioGroup value={depth} onValueChange={(value) => setDepth(value as Depth)}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="quick" id="depth-quick" />
                      <Label htmlFor="depth-quick">Quick (3-5 sentences per section)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="detailed" id="depth-detailed" />
                      <Label htmlFor="depth-detailed">Detailed (full comprehensive analysis)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="expert" id="depth-expert" />
                      <Label htmlFor="depth-expert">Expert (maximum depth, structured report)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Document"}
                </Button>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-y-auto pr-1 space-y-4">
          <Card className="min-h-[300px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-xl">Analysis Results</CardTitle>
                  <CardDescription>Live streaming output from RISE + Ollama</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={downloadPdfReport} disabled={!analysisText}>
                  <Download className="h-4 w-4" /> Download Full Report as PDF
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {!analysisText && !isAnalyzing && (
                <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
                  Run analysis to see results here.
                </div>
              )}

              {parsedSections.length > 0
                ? parsedSections.map((section) => (
                    <Card key={section.title} className="shadow-none">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => copyText(section.content)}>
                            <Copy className="h-4 w-4" /> Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>
                      </CardContent>
                    </Card>
                  ))
                : analysisText && (
                    <Card className="shadow-none">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">Streaming Analysis</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => copyText(analysisText)}>
                            <Copy className="h-4 w-4" /> Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysisText}</p>
                      </CardContent>
                    </Card>
                  )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ask RISE about this document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <input
                  value={askInput}
                  onChange={(event) => setAskInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleAskRise()}
                  placeholder="Ask follow-up questions about this document..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                />
                <Button onClick={handleAskRise} disabled={isAsking || !analysisText}>
                  <Send className="h-4 w-4" /> Ask
                </Button>
              </div>

              {(isAsking || askResponse) && (
                <div className="mt-3 rounded-md border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground mb-1">RISE response</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{isAsking ? `${askResponse}▌` : askResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;