import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, Share2 } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fitnessData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, count: Math.floor(Math.random() * 60 + 20) }));
const githubData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, commits: Math.floor(Math.random() * 8) }));
const pomodoroData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, sessions: Math.floor(Math.random() * 6 + 1) }));
const yearlyFitness = months.map((m) => ({ month: m, count: Math.floor(Math.random() * 500 + 200) }));
const yearlyGithub = months.map((m) => ({ month: m, commits: Math.floor(Math.random() * 80 + 20) }));
const yearlyPomodoro = months.map((m) => ({ month: m, sessions: Math.floor(Math.random() * 50 + 10) }));

const goalData = [{ name: "Done", value: 67 }, { name: "Left", value: 33 }];
const COLORS = ["hsl(14, 78%, 56%)", "hsl(var(--border))"];

const weeklyBreakdown = [
  { label: "Fitness", pct: 70 },
  { label: "GitHub", pct: 60 },
  { label: "LinkedIn", pct: 100 },
  { label: "Pomodoro", pct: 80 },
  { label: "Checklist", pct: 75 },
];

const overallPct = Math.round(weeklyBreakdown.reduce((a, b) => a + b.pct, 0) / weeklyBreakdown.length);
const getGrade = (pct: number) => pct >= 90 ? "A" : pct >= 80 ? "B+" : pct >= 70 ? "B" : pct >= 60 ? "C+" : pct >= 50 ? "C" : "D";
const getGradeColor = (grade: string) => grade.startsWith("A") ? "text-green-500" : grade.startsWith("B") ? "text-primary" : grade.startsWith("C") ? "text-yellow-500" : "text-red-500";

const StatsPage = () => {
  const { setPageData } = useRISEContext();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const isM = period === "monthly";

  const grade = getGrade(overallPct);

  useEffect(() => {
    setPageData({ weeklyBreakdown, overallPct, grade });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-rise-text">Your Progress Report</h2>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["monthly", "yearly"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${period === p ? "bg-card text-rise-text shadow-sm" : "text-muted-foreground"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Report Card - Hero */}
      <div className="card-rise mb-6 border border-border" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, hsl(var(--border)) 31px, hsl(var(--border)) 32px)" }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-rise-text text-lg">Weekly Report Card</h4>
          <span className="text-sm text-muted-foreground">Apr 1 - Apr 7, 2026</span>
        </div>
        <div className="flex items-start gap-8">
          <div className="text-center px-4">
            <span className={`text-6xl font-black ${getGradeColor(grade)}`}>{grade}</span>
            <p className="text-xs text-muted-foreground mt-2">Overall Grade</p>
          </div>
          <div className="flex-1 space-y-3">
            {weeklyBreakdown.map(w => (
              <div key={w.label} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24">{w.label}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${w.pct}%`, background: "linear-gradient(90deg, hsl(var(--primary)), #ff4500)" }} />
                </div>
                <span className="text-sm text-rise-text font-semibold w-12 text-right">{w.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-border flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-xs">R</span>
          </div>
          <p className="text-sm text-rise-text italic flex-1">
            "Not bad da, but GitHub needs more attention this week machan! You're killing it on LinkedIn though — 100% consistency. Keep that energy going!" — RISE AI
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Share2 size={14} /> Share Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-secondary">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-rise">
          <h4 className="font-semibold text-rise-text mb-3 text-sm">Fitness Consistency</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={isM ? fitnessData : yearlyFitness}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={isM ? "day" : "month"} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(14, 78%, 56%)" strokeWidth={2} dot={{ r: 2, fill: "hsl(14, 78%, 56%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card-rise">
          <h4 className="font-semibold text-rise-text mb-3 text-sm">Coding Activity</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={isM ? githubData : yearlyGithub}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={isM ? "day" : "month"} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="commits" fill="hsl(14, 78%, 56%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-rise">
          <h4 className="font-semibold text-rise-text mb-3 text-sm">Focus Sessions</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={isM ? pomodoroData : yearlyPomodoro}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={isM ? "day" : "month"} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Area type="monotone" dataKey="sessions" fill="hsla(14, 78%, 56%, 0.2)" stroke="hsl(14, 78%, 56%)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card-rise flex flex-col items-center justify-center">
          <h4 className="font-semibold text-rise-text mb-3 text-sm self-start">Monthly Goal Score</h4>
          <div className="relative">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={goalData} innerRadius={55} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                  {goalData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-rise-text">67%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
