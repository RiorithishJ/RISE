import { useState } from "react";
import { Dumbbell, Github, Briefcase, Timer, Plus, Pencil, Trash2, Check } from "lucide-react";

// Tracker Cards
const trackers = [
  { icon: Dumbbell, label: "Fitness", stat: "3 activities logged", sub: "420 kcal burned", progress: 65, color: "#e85d35" },
  { icon: Github, label: "GitHub", stat: "4 commits today", sub: "2 repos active", progress: 50, color: "#e85d35" },
  { icon: Briefcase, label: "LinkedIn", stat: "Post due Sunday", sub: "Weekly reminder", progress: 30, color: "#e85d35", hasToggle: true },
  { icon: Timer, label: "Pomodoro", stat: "3 sessions today", sub: "75 min focused", progress: 75, color: "#e85d35" },
];

const ProgressRing = ({ progress, size = 40 }: { progress: number; size?: number }) => {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eee" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e85d35" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
};

interface Task { id: number; text: string; done: boolean; }

const DashboardPage = () => {
  const [linkedinActive, setLinkedinActive] = useState(true);
  const [notes, setNotes] = useState(() => localStorage.getItem("rise-notes") || "");
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("rise-tasks");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Complete 50 push-ups", done: true },
      { id: 2, text: "2 Pomodoro sessions on ML", done: true },
      { id: 3, text: "Push code to GitHub", done: false },
      { id: 4, text: "Read transformer paper", done: false },
      { id: 5, text: "LinkedIn post draft", done: true },
    ];
  });
  const [newTask, setNewTask] = useState("");

  const saveTasks = (t: Task[]) => { setTasks(t); localStorage.setItem("rise-tasks", JSON.stringify(t)); };
  const saveNotes = (n: string) => { setNotes(n); localStorage.setItem("rise-notes", n); };
  const toggleTask = (id: number) => saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: number) => saveTasks(tasks.filter(t => t.id !== id));
  const addTask = () => {
    if (!newTask.trim()) return;
    saveTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask("");
  };
  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Greeting */}
      <h1 className="text-4xl font-bold text-rise-text mb-1 tracking-tight">Let's level up, Rio!</h1>
      <p className="text-rise-muted text-sm mb-6">Here's your progress today</p>

      {/* Daily Goal Card */}
      <div className="card-rise mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-rise-text text-sm">You're 45% to your daily goal</p>
          <div className="w-48 h-2 bg-rise-bg rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-rise-orange rounded-full" style={{ width: "45%" }} />
          </div>
          <p className="text-rise-muted text-xs mt-1">2,340/8000</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-rise-orange flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
      </div>

      {/* Tracker Cards */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {trackers.map((t) => {
          const Icon = t.icon;
          const isLinkedin = t.label === "LinkedIn";
          const dimmed = isLinkedin && !linkedinActive;
          return (
            <div key={t.label} className={`card-rise flex flex-col items-center gap-2 w-[130px] transition-opacity ${dimmed ? "opacity-40" : ""}`}>
              <div className="w-12 h-12 rounded-2xl bg-rise-bg flex items-center justify-center">
                <Icon size={22} className="text-rise-text" />
              </div>
              <span className="font-semibold text-sm text-rise-text">{t.label}</span>
              {isLinkedin ? (
                <button
                  onClick={() => setLinkedinActive(!linkedinActive)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${linkedinActive ? "bg-rise-orange" : "bg-gray-300"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${linkedinActive ? "left-5" : "left-0.5"}`} />
                </button>
              ) : (
                <ProgressRing progress={t.progress} />
              )}
              <span className="text-[11px] text-rise-muted text-center">{t.stat}</span>
            </div>
          );
        })}
        {/* Add card */}
        <div className="w-[130px] rounded-2xl border-2 border-dashed border-rise-border flex flex-col items-center justify-center gap-2 p-5 cursor-pointer hover:border-rise-orange/50 transition-colors">
          <Plus size={24} className="text-rise-muted" />
          <span className="text-xs text-rise-muted font-medium">Add Tracker</span>
        </div>
      </div>

      {/* Bottom section: Notes + Tasks */}
      <div className="flex gap-4">
        {/* Notepad */}
        <div className="card-rise flex-[3] flex flex-col min-h-[250px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-rise-text flex items-center gap-2">
              <Pencil size={14} /> Notes
            </h3>
            <span className="text-[10px] text-rise-muted">Auto-saved</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
            placeholder="Type your thoughts..."
            className="flex-1 bg-transparent outline-none resize-none text-sm text-rise-text placeholder:text-rise-muted leading-relaxed"
          />
        </div>

        {/* Checklist */}
        <div className="card-rise flex-[2] flex flex-col min-h-[250px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-rise-text">Today's Tasks</h3>
            <span className="text-xs text-rise-muted">{doneCount}/{tasks.length} completed</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.done ? "bg-rise-orange border-rise-orange" : "border-gray-300"
                  }`}
                >
                  {task.done && <Check size={12} className="text-white" />}
                </button>
                <span className={`text-sm flex-1 ${task.done ? "line-through text-rise-muted" : "text-rise-text"}`}>
                  {task.text}
                </span>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} className="text-rise-muted hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="Add a task..."
              className="flex-1 text-sm bg-rise-bg rounded-lg px-3 py-2 outline-none text-rise-text placeholder:text-rise-muted"
            />
            <button onClick={addTask} className="w-8 h-8 rounded-lg bg-rise-orange flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
