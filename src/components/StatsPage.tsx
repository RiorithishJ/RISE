import { useState } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fitnessData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, count: Math.floor(Math.random() * 60 + 20) }));
const githubData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, commits: Math.floor(Math.random() * 8) }));
const pomodoroData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, sessions: Math.floor(Math.random() * 6 + 1) }));
const yearlyFitness = months.map((m, i) => ({ month: m, count: Math.floor(Math.random() * 500 + 200) }));
const yearlyGithub = months.map((m) => ({ month: m, commits: Math.floor(Math.random() * 80 + 20) }));
const yearlyPomodoro = months.map((m) => ({ month: m, sessions: Math.floor(Math.random() * 50 + 10) }));

const goalData = [{ name: "Done", value: 67 }, { name: "Left", value: 33 }];
const COLORS = ["#e85d35", "#eee"];

const weeklyBreakdown = [
  { label: "Fitness", pct: 70 },
  { label: "GitHub", pct: 60 },
  { label: "LinkedIn", pct: 100 },
  { label: "Pomodoro", pct: 80 },
  { label: "Checklist", pct: 75 },
];

const StatsPage = () => {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const isM = period === "monthly";

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-rise-text">Your Progress Report</h2>
        <div className="flex gap-1 bg-rise-bg rounded-lg p-1">
          {(["monthly", "yearly"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${period === p ? "bg-white text-rise-text shadow-sm" : "text-rise-muted"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-rise">
          <h4 className="font-semibold text-rise-text mb-3 text-sm">Fitness Consistency</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={isM ? fitnessData : yearlyFitness}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey={isM ? "day" : "month"} tick={{ fontSize: 10 }} stroke="#ccc" />
              <YAxis tick={{ fontSize: 10 }} stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#e85d35" strokeWidth={2} dot={{ r: 2, fill: "#e85d35" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card-rise">
          <h4 className="font-semibold text-rise-text mb-3 text-sm">Coding Activity</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={isM ? githubData : yearlyGithub}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey={isM ? "day" : "month"} tick={{ fontSize: 10 }} stroke="#ccc" />
              <YAxis tick={{ fontSize: 10 }} stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="commits" fill="#e85d35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-rise">
          <h4 className="font-semibold text-rise-text mb-3 text-sm">Focus Sessions</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={isM ? pomodoroData : yearlyPomodoro}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey={isM ? "day" : "month"} tick={{ fontSize: 10 }} stroke="#ccc" />
              <YAxis tick={{ fontSize: 10 }} stroke="#ccc" />
              <Tooltip />
              <Area type="monotone" dataKey="sessions" fill="#e85d35" fillOpacity={0.2} stroke="#e85d35" strokeWidth={2} />
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

      {/* Weekly Report */}
      <div className="card-rise">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-rise-text">Weekly Report Card</h4>
          <span className="text-xs text-rise-muted">Apr 1 - Apr 7, 2026</span>
        </div>
        <div className="flex items-start gap-6">
          <div className="text-center">
            <span className="text-5xl font-bold text-rise-orange">B+</span>
            <p className="text-xs text-rise-muted mt-1">Overall Grade</p>
          </div>
          <div className="flex-1 space-y-2">
            {weeklyBreakdown.map(w => (
              <div key={w.label} className="flex items-center gap-3">
                <span className="text-xs text-rise-muted w-20">{w.label}</span>
                <div className="flex-1 h-2 bg-rise-bg rounded-full overflow-hidden">
                  <div className="h-full bg-rise-orange rounded-full" style={{ width: `${w.pct}%` }} />
                </div>
                <span className="text-xs text-rise-text font-medium w-10">{w.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-rise-muted mt-4 italic border-t border-rise-border pt-3">
          "Not bad da, but GitHub needs more attention this week machan!" — RISE AI
        </p>
      </div>
    </div>
  );
};

export default StatsPage;
