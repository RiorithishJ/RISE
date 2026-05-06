import { useState, useEffect } from "react";
import { Dumbbell, Github, Briefcase, Timer, Plus, Pencil, Trash2, Check, X, Lightbulb } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";

interface DashboardPageProps {
  onNavigate: (page: string, section?: string) => void;
}

const trackers = [
  { icon: Dumbbell, label: "Fitness", stat: "3 activities logged", sub: "420 kcal burned", progress: 65, page: "fitness" },
  { icon: Github, label: "GitHub", stat: "4 commits today", sub: "2 repos active", progress: 50, page: "github" },
  { icon: Briefcase, label: "LinkedIn", stat: "Post due Sunday", sub: "Weekly reminder", progress: 30, page: "linkedin" },
  { icon: Timer, label: "Pomodoro", stat: "3 sessions today", sub: "75 min focused", progress: 75, page: "progress", section: "pomodoro" },
];

const ProgressRing = ({ progress, size = 40 }: { progress: number; size?: number }) => {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
};

interface Task { id: number; text: string; done: boolean; }
interface PostIdea { id: number; topic: string; date: string; status: "Planned" | "Posted" | "Skipped"; }

const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const { setCurrentPage, setPageData } = useRISEContext();
  const [linkedinActive, setLinkedinActive] = useState(true);
  const [linkedinPanel, setLinkedinPanel] = useState(false);
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
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>(() => {
    const saved = localStorage.getItem("rise-post-ideas");
    return saved ? JSON.parse(saved) : [
      { id: 1, topic: "My journey learning transformers", date: "Apr 5", status: "Planned" },
      { id: 2, topic: "5 things I learned from building RISE", date: "Apr 2", status: "Posted" },
      { id: 3, topic: "Why every CS student should learn MLOps", date: "Mar 28", status: "Skipped" },
    ];
  });
  const [newIdea, setNewIdea] = useState("");

  const saveTasks = (t: Task[]) => { setTasks(t); localStorage.setItem("rise-tasks", JSON.stringify(t)); };
  const saveNotes = (n: string) => { setNotes(n); localStorage.setItem("rise-notes", n); };
  const toggleTask = (id: number) => saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: number) => saveTasks(tasks.filter(t => t.id !== id));
  const addTask = () => { if (!newTask.trim()) return; saveTasks([...tasks, { id: Date.now(), text: newTask, done: false }]); setNewTask(""); };
  const doneCount = tasks.filter(t => t.done).length;

  const saveIdeas = (ideas: PostIdea[]) => { setPostIdeas(ideas); localStorage.setItem("rise-post-ideas", JSON.stringify(ideas)); };
  const addIdea = () => { if (!newIdea.trim()) return; saveIdeas([...postIdeas, { id: Date.now(), topic: newIdea, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), status: "Planned" }]); setNewIdea(""); };
  const deleteIdea = (id: number) => saveIdeas(postIdeas.filter(i => i.id !== id));

  useEffect(() => {
    setCurrentPage('dashboard');
    setPageData({ tasks: tasks.length, tasksDone: doneCount, notes: notes.length > 0 });
  }, [tasks, notes]);

  const handleCardClick = (tracker: typeof trackers[0]) => {
    if (tracker.label === "LinkedIn") {
      setLinkedinPanel(true);
    } else {
      onNavigate(tracker.page, tracker.section);
    }
  };

  const statusColors: Record<string, string> = {
    Planned: "bg-blue-100 text-blue-700",
    Posted: "bg-green-100 text-green-700",
    Skipped: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-4xl font-bold text-rise-text mb-1 tracking-tight">Let's level up, Rio!</h1>
      <p className="text-muted-foreground text-sm mb-6">Here's your progress today</p>

      {/* Daily Goal */}
      <div className="card-rise mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-rise-text text-sm">You're 45% to your daily goal</p>
          <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: "45%", height: "8px", background: "linear-gradient(90deg, hsl(var(--primary)), #ff4500)", borderRadius: "4px" }} />
          </div>
          <p className="text-muted-foreground text-xs mt-1">2,340/8000</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
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
            <div key={t.label} onClick={() => handleCardClick(t)}
              className={`card-rise flex flex-col items-center gap-2 w-[130px] cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${dimmed ? "opacity-40" : ""}`}>
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <Icon size={22} className="text-rise-text" />
              </div>
              <span className="font-semibold text-sm text-rise-text">{t.label}</span>
              {isLinkedin ? (
                <button onClick={(e) => { e.stopPropagation(); setLinkedinActive(!linkedinActive); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${linkedinActive ? "bg-primary" : "bg-gray-300"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${linkedinActive ? "left-5" : "left-0.5"}`} />
                </button>
              ) : (
                <ProgressRing progress={t.progress} />
              )}
              <span className="text-[11px] text-muted-foreground text-center">{t.stat}</span>
            </div>
          );
        })}
        <div className="w-[130px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 p-5 cursor-pointer hover:border-primary/50 transition-colors">
          <Plus size={24} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Add Tracker</span>
        </div>
      </div>

      {/* Notes + Tasks */}
      <div className="flex gap-4">
        <div className="card-rise flex-[3] flex flex-col min-h-[250px] border-l-[3px] border-l-primary">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-rise-text flex items-center gap-2"><Pencil size={14} /> Notes</h3>
            <span className="text-[10px] text-muted-foreground">Auto-saved</span>
          </div>
          <textarea value={notes} onChange={(e) => saveNotes(e.target.value)} placeholder="Type your thoughts..."
            className="flex-1 bg-transparent outline-none resize-none text-sm text-rise-text placeholder:text-muted-foreground leading-relaxed" />
        </div>
        <div className="card-rise flex-[2] flex flex-col min-h-[250px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-rise-text">Today's Tasks</h3>
            <span className="text-xs text-muted-foreground">{doneCount}/{tasks.length} completed</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 group">
                <button onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? "bg-primary border-primary" : "border-gray-300"}`}>
                  {task.done && <Check size={12} className="text-primary-foreground" />}
                </button>
                <span className={`text-sm flex-1 ${task.done ? "line-through text-muted-foreground" : "text-rise-text"}`}>{task.text}</span>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="Add a task..." className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 outline-none text-rise-text placeholder:text-muted-foreground" />
            <button onClick={addTask} className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Plus size={16} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* LinkedIn Panel */}
      {linkedinPanel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setLinkedinPanel(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-[400px] h-full bg-card overflow-y-auto animate-in slide-in-from-right duration-300"
            style={{ boxShadow: "var(--shadow-modal)" }} onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-rise-text">LinkedIn Growth</h2>
                <button onClick={() => setLinkedinPanel(false)} className="text-muted-foreground hover:text-rise-text"><X size={20} /></button>
              </div>
              <div className="card-rise mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-rise-text">Status</p>
                    <p className="text-sm text-muted-foreground">{linkedinActive ? "Active — reminders on" : "Inactive"}</p>
                  </div>
                  <button onClick={() => setLinkedinActive(!linkedinActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${linkedinActive ? "bg-primary" : "bg-gray-300"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${linkedinActive ? "left-6" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
              {linkedinActive && (
                <>
                  <div className="card-rise mb-4 space-y-2">
                    <p className="text-sm text-rise-text">📅 <span className="font-semibold">Next post in:</span> 3 days</p>
                    <p className="text-sm text-rise-text">📋 <span className="font-semibold">Project check:</span> Wednesday</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-rise-text mb-3">Post Ideas</h3>
                    <div className="space-y-2">
                      {postIdeas.map(idea => (
                        <div key={idea.id} className="card-rise flex items-start justify-between group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-rise-text truncate">{idea.topic}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground">{idea.date}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[idea.status]}`}>{idea.status}</span>
                            </div>
                          </div>
                          <button onClick={() => deleteIdea(idea.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                            <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input value={newIdea} onChange={e => setNewIdea(e.target.value)} onKeyDown={e => e.key === "Enter" && addIdea()}
                        placeholder="Add a post idea..." className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 outline-none text-rise-text placeholder:text-muted-foreground" />
                      <button onClick={addIdea} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">+ Add</button>
                    </div>
                  </div>
                  <div className="rounded-2xl p-4 bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={16} className="text-primary" />
                      <span className="text-sm font-semibold text-rise-text">This week, RISE suggests:</span>
                    </div>
                    <p className="text-sm text-rise-text mb-3">"Share your experience building a personal AI dashboard — what you learned and what surprised you."</p>
                    <button className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity">Save this idea</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
