import { useState, useEffect, useRef } from "react";
import { Plus, Trophy, X, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface FitnessLog { activity: string; count: string; time?: string; date: string; }

interface ProgressPageProps {
  scrollToSection: string | null;
  onScrollComplete: () => void;
}

const fitnessActivities = [
  { name: "Push Ups", goal: "50 reps", current: 35, best: 60, unit: "reps" },
  { name: "Skipping", goal: "500 jumps", current: 320, best: 600, unit: "jumps" },
  { name: "Running", goal: "5 km", current: 2.5, best: 7, unit: "km", hasTime: true },
];

const repos = [
  { name: "rise-dashboard", lastCommit: "2 hours ago", language: "TypeScript" },
  { name: "ml-experiments", lastCommit: "Yesterday", language: "Python" },
  { name: "portfolio-site", lastCommit: "3 days ago", language: "React" },
];

const commitData = Array.from({ length: 52 * 7 }, () => Math.random() > 0.5 ? Math.floor(Math.random() * 4) : 0);

const ProgressPage = ({ scrollToSection, onScrollComplete }: ProgressPageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [logModal, setLogModal] = useState<string | null>(null);
  const [logValue, setLogValue] = useState("");
  const [logTime, setLogTime] = useState("");
  const [logs, setLogs] = useState<FitnessLog[]>(() => {
    const saved = localStorage.getItem("rise-fitness-logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [pomTime, setPomTime] = useState(25 * 60);
  const [pomRunning, setPomRunning] = useState(false);
  const [pomType, setPomType] = useState<"work" | "break">("work");
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    if (scrollToSection && containerRef.current) {
      const el = containerRef.current.querySelector(`#${scrollToSection}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          onScrollComplete();
        }, 100);
      }
    }
  }, [scrollToSection, onScrollComplete]);

  const saveLog = () => {
    if (!logValue) return;
    const newLogs = [...logs, { activity: logModal!, count: logValue, time: logTime || undefined, date: new Date().toLocaleDateString() }];
    setLogs(newLogs);
    localStorage.setItem("rise-fitness-logs", JSON.stringify(newLogs));
    setLogModal(null);
    setLogValue("");
    setLogTime("");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const pomProgress = pomType === "work" ? ((workMin * 60 - pomTime) / (workMin * 60)) * 100 : ((breakMin * 60 - pomTime) / (breakMin * 60)) * 100;
  const pomR = 80;
  const pomCirc = 2 * Math.PI * pomR;
  const pomOffset = pomCirc - (pomProgress / 100) * pomCirc;

  return (
    <div className="flex-1 overflow-y-auto p-8" ref={containerRef}>
      {/* Fitness */}
      <section id="fitness">
        <h2 className="text-2xl font-bold text-rise-text mb-4">Fitness Progress</h2>
        <div className="flex gap-4 mb-8">
          {fitnessActivities.map(a => (
            <div key={a.name} className="card-rise flex-1">
              <h4 className="font-semibold text-rise-text mb-2">{a.name}</h4>
              <p className="text-2xl font-bold text-rise-text">{a.current} <span className="text-sm font-normal text-muted-foreground">{a.unit}</span></p>
              <p className="text-xs text-muted-foreground mb-2">Goal: {a.goal}</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((a.current / parseFloat(a.goal)) * 100, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Trophy size={10} /> Best: {a.best} {a.unit}</span>
                <button onClick={() => setLogModal(a.name)} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  + Log Today
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GitHub */}
      <section id="github">
        <h2 className="text-2xl font-bold text-rise-text mb-4">GitHub Activity</h2>
        <div className="card-rise mb-4">
          <p className="text-sm text-muted-foreground mb-3">This week: <span className="font-semibold text-rise-text">12 commits</span></p>
          <div className="flex gap-[3px] flex-wrap max-w-full">
            {commitData.map((v, i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{
                backgroundColor: v === 0 ? "hsl(var(--border))" : v === 1 ? "#fcd5c5" : v === 2 ? "#f5a07a" : "hsl(var(--primary))"
              }} />
            ))}
          </div>
        </div>
        <div className="card-rise mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-rise-text">Repositories</h4>
            <button className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-lg font-medium">+ Add Repo</button>
          </div>
          {repos.map(r => (
            <div key={r.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-sm text-rise-text">{r.name}</p>
                <p className="text-xs text-muted-foreground">Last commit: {r.lastCommit}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{r.language}</span>
                <button className="text-xs border border-border px-3 py-1 rounded-lg text-rise-text hover:bg-muted transition-colors">Review Code</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pomodoro */}
      <section id="pomodoro">
        <h2 className="text-2xl font-bold text-rise-text mb-4">Pomodoro Timer</h2>
        <div className="card-rise flex flex-col items-center mb-4">
          <div className="relative w-[180px] h-[180px] mb-4">
            <svg width={180} height={180} className="-rotate-90">
              <circle cx={90} cy={90} r={pomR} fill="none" stroke="hsl(var(--border))" strokeWidth={4} />
              <circle cx={90} cy={90} r={pomR} fill="none" stroke="hsl(var(--primary))" strokeWidth={4}
                strokeDasharray={pomCirc} strokeDashoffset={pomOffset} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-rise-text">{formatTime(pomTime)}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {pomType === "work" ? "Focus Session" : "Break Time"}
              </span>
            </div>
          </div>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setPomRunning(!pomRunning)}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
              {pomRunning ? <Pause size={20} className="text-primary-foreground" /> : <Play size={20} className="text-primary-foreground ml-0.5" />}
            </button>
            <button onClick={() => { setPomRunning(false); setPomTime(pomType === "work" ? workMin * 60 : breakMin * 60); }}
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-secondary transition-colors">
              <RotateCcw size={20} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => { setPomType("work"); setPomTime(workMin * 60); setPomRunning(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${pomType === "work" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              Work
            </button>
            <button onClick={() => { setPomType("break"); setPomTime(breakMin * 60); setPomRunning(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${pomType === "break" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              Break
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              Work: <input type="number" value={workMin} onChange={e => setWorkMin(+e.target.value)} className="w-12 bg-muted rounded px-2 py-1 text-center text-rise-text" /> min
            </label>
            <label className="flex items-center gap-2 text-muted-foreground">
              Break: <input type="number" value={breakMin} onChange={e => setBreakMin(+e.target.value)} className="w-12 bg-muted rounded px-2 py-1 text-center text-rise-text" /> min
            </label>
            <button onClick={() => setSoundOn(!soundOn)} className="text-muted-foreground hover:text-rise-text transition-colors">
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
        <div className="card-rise">
          <h4 className="font-semibold text-rise-text mb-2">Today's Stats</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold text-rise-text">3</p><p className="text-xs text-muted-foreground">Sessions</p></div>
            <div><p className="text-2xl font-bold text-rise-text">75</p><p className="text-xs text-muted-foreground">Minutes</p></div>
            <div><p className="text-2xl font-bold text-rise-text">2</p><p className="text-xs text-muted-foreground">Breaks</p></div>
          </div>
        </div>
      </section>

      {/* Log Modal */}
      {logModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setLogModal(null)}>
          <div className="bg-card rounded-2xl p-6 w-[360px]" style={{ boxShadow: "var(--shadow-modal)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-rise-text text-lg">{logModal}</h3>
              <button onClick={() => setLogModal(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <label className="text-sm text-muted-foreground block mb-1">Count / Distance</label>
            <input value={logValue} onChange={e => setLogValue(e.target.value)} placeholder="e.g. 50" className="w-full bg-muted rounded-lg px-3 py-2 text-sm mb-3 outline-none" />
            {logModal === "Running" && (
              <>
                <label className="text-sm text-muted-foreground block mb-1">Time (minutes)</label>
                <input value={logTime} onChange={e => setLogTime(e.target.value)} placeholder="e.g. 22" className="w-full bg-muted rounded-lg px-3 py-2 text-sm mb-3 outline-none" />
              </>
            )}
            <div className="flex gap-2">
              <button onClick={() => setLogModal(null)} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium">Cancel</button>
              <button onClick={saveLog} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
