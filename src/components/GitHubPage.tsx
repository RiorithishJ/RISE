import { useState, useEffect } from "react";
import { GitBranch, Star, GitFork, AlertCircle, ChevronLeft, Check, FileCode, FolderOpen, Download, Settings } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";

const commitHeatmapData = Array.from({ length: 52 * 7 }, () => Math.random() > 0.4 ? Math.floor(Math.random() * 5) : 0);

const dummyRepos = [
  { name: "rise-dashboard", language: "TypeScript", lastCommit: "2 hours ago", stars: 12, forks: 3, issues: 2 },
  { name: "ml-experiments", language: "Python", lastCommit: "Yesterday", stars: 8, forks: 1, issues: 5 },
  { name: "portfolio-site", language: "React", lastCommit: "3 days ago", stars: 5, forks: 0, issues: 1 },
  { name: "llm-fine-tuning", language: "Python", lastCommit: "1 week ago", stars: 24, forks: 7, issues: 3 },
];

const weekCommits = commitHeatmapData.slice(-7).reduce((a, b) => a + b, 0);
const currentStreak = 12;
const longestStreak = 28;
const reposContributed = 3;

interface ReviewReport {
  repo: string;
  date: string;
  score: number;
  grade: string;
  sections: {
    title: string;
    score: number;
    findings: { type: "good" | "warning" | "issue"; text: string }[];
  }[];
  summary: string;
}

const dummyReport: ReviewReport = {
  repo: "",
  date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  score: 78,
  grade: "B+",
  sections: [
    {
      title: "Code Quality",
      score: 82,
      findings: [
        { type: "good", text: "Clean function naming conventions" },
        { type: "good", text: "Good TypeScript type usage" },
        { type: "warning", text: "3 functions exceed 50 lines" },
        { type: "issue", text: "Missing error handling in API calls" },
      ],
    },
    {
      title: "Security",
      score: 90,
      findings: [
        { type: "good", text: "No hardcoded secrets found" },
        { type: "good", text: "Input validation present" },
        { type: "warning", text: "Consider adding rate limiting" },
      ],
    },
    {
      title: "Performance",
      score: 75,
      findings: [
        { type: "warning", text: "Large bundle size detected" },
        { type: "issue", text: "Missing lazy loading for routes" },
        { type: "good", text: "Efficient re-rendering patterns" },
      ],
    },
    {
      title: "Best Practices",
      score: 70,
      findings: [
        { type: "good", text: "Consistent code formatting" },
        { type: "warning", text: "Missing unit tests for 4 components" },
        { type: "issue", text: "No CI/CD pipeline configured" },
        { type: "warning", text: "README needs updating" },
      ],
    },
  ],
  summary: "Overall da, the code is decent but there are 3 things you really need to fix before this goes to production: error handling in API calls, add lazy loading for better performance, and set up a CI/CD pipeline machan!",
};

const GitHubPage = () => {
  const { setPageData } = useRISEContext();
  const [view, setView] = useState<"repos" | "review-options" | "review-loading" | "review-report">("repos");
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [reviewType, setReviewType] = useState<"full" | "select">("full");
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const token = localStorage.getItem("rise-github-token");

  useEffect(() => {
    setPageData({
      githubWeekCommits: weekCommits,
      currentStreak,
      longestStreak,
      repos: dummyRepos.map(r => r.name),
    });
  }, []);

  const startReview = () => {
    setView("review-loading");
    setLoadingStep(0);
    const steps = [1, 2, 3, 4, 5];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setLoadingStep(s);
        if (s === 5) {
          setTimeout(() => {
            setReport({ ...dummyReport, repo: selectedRepo });
            setView("review-report");
          }, 800);
        }
      }, (i + 1) * 900);
    });
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const loadingSteps = [
    "Connecting to GitHub...",
    "Fetching repository files...",
    "Analyzing code structure...",
    "Reviewing best practices...",
    "Generating report...",
  ];

  const findingIcon = (type: string) => {
    if (type === "good") return <Check size={12} className="text-green-500" />;
    if (type === "warning") return <AlertCircle size={12} className="text-yellow-500" />;
    return <AlertCircle size={12} className="text-red-500" />;
  };

  const langColors: Record<string, string> = {
    TypeScript: "bg-blue-100 text-blue-700",
    Python: "bg-green-100 text-green-700",
    React: "bg-cyan-100 text-cyan-700",
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-rise-text">GitHub Activity</h2>
          <p className="text-sm text-muted-foreground">@rio-dev {token ? <span className="text-green-500 ml-2">● Connected</span> : <span className="text-muted-foreground ml-2">● Not connected</span>}</p>
        </div>
        {!token && (
          <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-xl max-w-xs">
            Add your GitHub token in Settings to enable real repo fetching
          </p>
        )}
      </div>

      {/* Heatmap */}
      <div className="card-rise mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-rise-text text-sm">Commit Heatmap — {new Date().getFullYear()}</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-[2px]" style={{ minWidth: 700 }}>
            {Array.from({ length: 52 }, (_, week) => (
              <div key={week} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }, (_, day) => {
                  const idx = week * 7 + day;
                  const v = commitHeatmapData[idx] || 0;
                  return (
                    <div key={day} className="w-[11px] h-[11px] rounded-[2px]"
                      title={`${v} commits`}
                      style={{
                        backgroundColor: v === 0 ? "hsl(var(--border))" : v === 1 ? "#fcd5c5" : v === 2 ? "#f5a07a" : v === 3 ? "#e85d35" : "#c44420"
                      }} />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {months.map(m => <span key={m} className="text-[9px] text-muted-foreground">{m}</span>)}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "This Week", value: weekCommits, sub: "commits" },
          { label: "Repos Active", value: reposContributed, sub: "contributed" },
          { label: "Current Streak", value: `${currentStreak}d`, sub: "days" },
          { label: "Longest Streak", value: `${longestStreak}d`, sub: "days" },
        ].map(s => (
          <div key={s.label} className="card-rise text-center">
            <p className="text-2xl font-bold text-rise-text">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Views */}
      {view === "repos" && (
        <div className="card-rise">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-rise-text">Repositories</h3>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">+ Add Repo</button>
          </div>
          {dummyRepos.map(r => (
            <div key={r.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <FolderOpen size={18} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm text-rise-text">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Last commit: {r.lastCommit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${langColors[r.language] || "bg-muted text-muted-foreground"}`}>{r.language}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Star size={10} /> {r.stars}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-0.5"><GitFork size={10} /> {r.forks}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-0.5"><AlertCircle size={10} /> {r.issues}</span>
                <button onClick={() => { setSelectedRepo(r.name); setView("review-options"); }}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm text-rise-text hover:bg-muted transition-colors">
                  Review Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "review-options" && (
        <div className="card-rise">
          <button onClick={() => setView("repos")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-rise-text mb-4">
            <ChevronLeft size={16} /> Repositories
          </button>
          <h3 className="font-semibold text-rise-text text-lg mb-4">Code Review — {selectedRepo}</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => setReviewType("full")}
              className={`p-6 rounded-2xl border-2 text-center transition-all ${reviewType === "full" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <FolderOpen size={28} className="mx-auto mb-2 text-primary" />
              <p className="font-semibold text-rise-text">Full Codebase</p>
              <p className="text-xs text-muted-foreground mt-1">Review entire repository</p>
            </button>
            <button onClick={() => setReviewType("select")}
              className={`p-6 rounded-2xl border-2 text-center transition-all ${reviewType === "select" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <FileCode size={28} className="mx-auto mb-2 text-primary" />
              <p className="font-semibold text-rise-text">Select Files</p>
              <p className="text-xs text-muted-foreground mt-1">Choose specific files to review</p>
            </button>
          </div>
          <button onClick={startReview} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
            Start Review
          </button>
        </div>
      )}

      {view === "review-loading" && (
        <div className="card-rise flex flex-col items-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 animate-pulse">
            <span className="text-primary-foreground font-bold text-xl">R</span>
          </div>
          <div className="space-y-3 w-full max-w-xs">
            {loadingSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {loadingStep > i ? (
                  <Check size={16} className="text-green-500 shrink-0" />
                ) : loadingStep === i ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                )}
                <span className={`text-sm ${loadingStep >= i ? "text-rise-text" : "text-muted-foreground"}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "review-report" && report && (
        <div>
          <button onClick={() => setView("repos")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-rise-text mb-4">
            <ChevronLeft size={16} /> Repositories
          </button>

          {/* Report header */}
          <div className="card-rise mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-rise-text text-lg">{report.repo}</h3>
              <p className="text-xs text-muted-foreground">{report.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-rise-text">{report.score}/100</p>
                <p className="text-xs text-muted-foreground">Overall Score</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">{report.grade}</span>
              </div>
            </div>
          </div>

          {/* Section cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {report.sections.map(section => (
              <div key={section.title} className="card-rise">
                <button onClick={() => toggleSection(section.title)} className="w-full flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-rise-text">{section.title}</h4>
                  <span className="text-sm font-bold text-primary">{section.score}/100</span>
                </button>
                {(expandedSections[section.title] !== false) && (
                  <div className="space-y-2">
                    {section.findings.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {findingIcon(f.type)}
                        <span className="text-xs text-rise-text">{f.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* RISE Summary */}
          <div className="rounded-2xl p-5 bg-primary/10 border border-primary/20 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-xs">R</span>
              </div>
              <span className="font-semibold text-rise-text">RISE Summary</span>
            </div>
            <p className="text-sm text-rise-text italic">"{report.summary}"</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2">
              <Download size={16} /> Download as PDF
            </button>
            <button onClick={() => setView("review-options")} className="px-6 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium">
              Review Another File
            </button>
            <button onClick={() => setView("repos")} className="px-6 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium">
              Back to Repos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubPage;
