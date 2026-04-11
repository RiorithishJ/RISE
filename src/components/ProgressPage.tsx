import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";

interface ProgressPageProps {
  scrollToSection: string | null;
  onScrollComplete: () => void;
}

const ProgressPage = ({ scrollToSection, onScrollComplete }: ProgressPageProps) => {
  const { setPageData } = useRISEContext();
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setPageData({ pomodoroSessions: 3, focusMinutes: 75, breaks: 2 });
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!pomRunning) return;
    const interval = setInterval(() => {
      setPomTime(prev => {
        if (prev <= 1) {
          setPomRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomRunning]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const pomProgress = pomType === "work" ? ((workMin * 60 - pomTime) / (workMin * 60)) * 100 : ((breakMin * 60 - pomTime) / (breakMin * 60)) * 100;
  const pomR = 80;
  const pomCirc = 2 * Math.PI * pomR;
  const pomOffset = pomCirc - (pomProgress / 100) * pomCirc;

  return (
    <div className="flex-1 overflow-y-auto p-8" ref={containerRef}>
      <h2 className="text-2xl font-bold text-rise-text mb-6">Progress</h2>

      {/* Pomodoro */}
      <section id="pomodoro">
        <h3 className="text-lg font-semibold text-rise-text mb-4">Pomodoro Timer</h3>
        <div className="card-rise flex flex-col items-center mb-4">
          <div className="relative w-[180px] h-[180px] mb-4">
            <svg width={180} height={180} className="-rotate-90">
              <circle cx={90} cy={90} r={pomR} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
              <circle cx={90} cy={90} r={pomR} fill="none" stroke="hsl(var(--primary))" strokeWidth={6}
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
    </div>
  );
};

export default ProgressPage;
