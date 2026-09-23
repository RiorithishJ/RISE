import { useState, useEffect } from "react";
import { Dumbbell, X, Trophy, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useRISEContext } from "@/contexts/RISEContext";
import { useDatabaseService } from "@/hooks/useDatabaseService";

interface FitnessLog {
  activity: string;
  count: number;
  time?: number;
  date: string;
}

interface Activity {
  name: string;
  icon: string;
  unit: string;
  goalLabel: string;
  goalValue: number;
  hasTime?: boolean;
}

const activities: Activity[] = [
  { name: "Push Ups", icon: "💪", unit: "reps", goalLabel: "50 reps", goalValue: 50 },
  { name: "Skipping", icon: "🪢", unit: "jumps", goalLabel: "500 jumps", goalValue: 500 },
  { name: "Running", icon: "🏃", unit: "km", goalLabel: "5 km", goalValue: 5, hasTime: true },
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultBests = {
  "Push Ups": { value: 60, date: "Mar 15" },
  "Skipping": { value: 600, date: "Mar 20" },
  "Running": { value: 7, date: "Feb 28", time: 35, timeDate: "Feb 28" },
};

const getTodayStr = () => new Date().toISOString().slice(0, 10);

const FitnessPage = () => {
  const { setCurrentPage, setPageData } = useRISEContext();
  const db = useDatabaseService();
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [bests, setBests] = useState<Record<string, { value: number; date: string; time?: number; timeDate?: string }>>(defaultBests);
  const [logModal, setLogModal] = useState<string | null>(null);
  const [logValue, setLogValue] = useState("");
  const [logTime, setLogTime] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [newBestMsg, setNewBestMsg] = useState("");

  const today = getTodayStr();

  const getTodayCount = (name: string) => {
    const todayLogs = logs.filter(l => l.activity === name && l.date === today);
    return todayLogs.reduce((sum, l) => sum + l.count, 0);
  };

  const getLast7Days = (name: string) => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const dayLogs = logs.filter(l => l.activity === name && l.date === ds);
      const total = dayLogs.reduce((sum, l) => sum + l.count, 0);
      result.push({ day: daysOfWeek[(d.getDay() + 6) % 7], count: total });
    }
    return result;
  };

  const goalsHit = activities.filter(a => getTodayCount(a.name) >= a.goalValue).length;
  const goalPercent = Math.round((goalsHit / activities.length) * 100);

  useEffect(() => {
    const loadFitnessData = async () => {
      const [storedLogs, storedBests] = await Promise.all([
        db.getRecord("fitness_data", "fitness-logs"),
        db.getRecord("fitness_data", "fitness-bests"),
      ]);

      if (storedLogs?.items && Array.isArray(storedLogs.items)) {
        setLogs(storedLogs.items as FitnessLog[]);
      } else {
        setLogs([]);
      }

      if (storedBests?.items && typeof storedBests.items === "object") {
        setBests(storedBests.items as Record<string, { value: number; date: string; time?: number; timeDate?: string }>);
      }
    };

    void loadFitnessData();
  }, [db]);

  useEffect(() => {
    setCurrentPage('fitness');
    setPageData({
      fitnessToday: activities.map(a => ({
        name: a.name,
        today: getTodayCount(a.name),
        goal: a.goalValue,
        best: bests[a.name]?.value || 0,
      })),
      goalsHit,
      totalActivities: activities.length,
    });
  }, [logs, bests]);

  const saveLog = async () => {
    if (!logValue || !logModal) return;
    const val = parseFloat(logValue);
    const newLog: FitnessLog = {
      activity: logModal,
      count: val,
      time: logTime ? parseFloat(logTime) : undefined,
      date: today,
    };
    const newLogs = [...logs, newLog];
    setLogs(newLogs);
    await db.saveRecord("fitness_data", { id: "fitness-logs", items: newLogs, updatedAt: new Date().toISOString() });

    // Check personal best
    const currentBest = bests[logModal]?.value || 0;
    if (val > currentBest) {
      const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const newBests = {
        ...bests,
        [logModal]: { value: val, date: dateStr, time: logTime ? parseFloat(logTime) : undefined, timeDate: dateStr },
      };
      setBests(newBests);
      await db.saveRecord("fitness_data", { id: "fitness-bests", items: newBests, updatedAt: new Date().toISOString() });
      setNewBestMsg(`🎉 New Personal Best for ${logModal}!`);
      setShowConfetti(true);
      setTimeout(() => { setShowConfetti(false); setNewBestMsg(""); }, 3000);
    }

    setLogModal(null);
    setLogValue("");
    setLogTime("");
  };

  // Monthly heatmap
  const getMonthHeatmap = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0, count: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayLogs = logs.filter(l => l.date === ds);
      cells.push({ day: d, count: dayLogs.length });
    }
    return cells;
  };

  const heatmap = getMonthHeatmap();
  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const ProgressRing = ({ progress, size = 80 }: { progress: number; size?: number }) => {
    const stroke = 8;
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (progress / 100) * circ;
    return (
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Confetti toast */}
      {showConfetti && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm animate-bounce" style={{ boxShadow: "var(--shadow-modal)" }}>
          {newBestMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-rise-text">Fitness Tracker</h2>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProgressRing progress={goalPercent} size={72} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-rise-text">{goalPercent}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-rise-text">
              {goalsHit === activities.length ? "All goals hit! 🎉" : `Great job! ${goalsHit}/${activities.length} goals hit today`}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-4 mb-8">
        {activities.map(a => {
          const todayCount = getTodayCount(a.name);
          const pct = Math.min((todayCount / a.goalValue) * 100, 100);
          const best = bests[a.name];
          const last7 = getLast7Days(a.name);
          return (
            <div key={a.name} className="card-rise">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <h3 className="font-semibold text-rise-text text-lg">{a.name}</h3>
                    <p className="text-sm text-muted-foreground">Today: {todayCount} / Goal: {a.goalLabel}</p>
                  </div>
                </div>
                <button onClick={() => setLogModal(a.name)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  Log Today
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="shrink-0">
                  <ProgressRing progress={pct} size={64} />
                </div>
                <div className="flex-1">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, hsl(var(--primary)), #ff4500)" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{Math.round(pct)}% complete</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Trophy size={10} /> Best: {best?.value || 0} {a.unit} {best?.date ? `on ${best.date}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Last 7 days</p>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={last7}>
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="#ccc" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="count" fill="hsl(14, 78%, 56%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Consistency */}
      <div className="card-rise mb-8">
        <h3 className="font-semibold text-rise-text mb-3">Monthly Consistency — {monthName}</h3>
        <div className="grid grid-cols-7 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center text-[9px] text-muted-foreground font-medium pb-1">{d}</div>
          ))}
          {heatmap.map((cell, i) => (
            <div key={i} title={cell.day ? `Apr ${cell.day}: ${cell.count} activities logged` : ""}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor: cell.day === 0 ? "transparent" :
                  cell.count === 0 ? "hsl(var(--border))" :
                  cell.count === 1 ? "#fcd5c5" :
                  cell.count === 2 ? "#f5a07a" : "hsl(var(--primary))"
              }}
            />
          ))}
        </div>
      </div>

      {/* Personal Records */}
      <div className="card-rise">
        <h3 className="font-semibold text-rise-text mb-4 flex items-center gap-2"><Flame size={16} className="text-primary" /> Personal Records</h3>
        <div className="grid grid-cols-3 gap-4">
          {activities.map(a => {
            const best = bests[a.name];
            return (
              <div key={a.name} className="bg-muted rounded-xl p-4 text-center">
                <span className="text-2xl mb-2 block">{a.icon}</span>
                <p className="font-bold text-rise-text text-lg">{best?.value || 0} {a.unit}</p>
                <p className="text-xs text-muted-foreground">{a.name}</p>
                {best?.date && <p className="text-[10px] text-primary font-medium mt-1">on {best.date}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Modal */}
      {logModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setLogModal(null)}>
          <div className="bg-card rounded-2xl p-6 w-[380px]" style={{ boxShadow: "var(--shadow-modal)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-rise-text text-lg">{logModal}</h3>
              <button onClick={() => setLogModal(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <label className="text-sm text-muted-foreground block mb-1">
              {logModal === "Running" ? "Distance (km)" : "Count today"}
            </label>
            <input type="number" value={logValue} onChange={e => setLogValue(e.target.value)}
              placeholder={logModal === "Running" ? "e.g. 5" : "e.g. 50"}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm mb-3 outline-none text-rise-text" />
            {logModal === "Running" && (
              <>
                <label className="text-sm text-muted-foreground block mb-1">Time (minutes)</label>
                <input type="number" value={logTime} onChange={e => setLogTime(e.target.value)}
                  placeholder="e.g. 22"
                  className="w-full bg-muted rounded-xl px-4 py-3 text-sm mb-3 outline-none text-rise-text" />
              </>
            )}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setLogModal(null)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium">Cancel</button>
              <button onClick={saveLog} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessPage;
