import { useState, useEffect } from "react";
import { Lock, Check, X, Plus, Edit3, Trash2, GripVertical } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";
import { useDatabaseService } from "@/hooks/useDatabaseService";

interface Skill {
  id: number;
  name: string;
  description: string;
  subtopics: { name: string; done: boolean }[];
  status: "completed" | "current" | "locked";
  progress: number;
  resources: string[];
}

const initialSkills: Skill[] = [
  { id: 1, name: "Python Basics", description: "Core Python fundamentals", subtopics: [{ name: "Variables & Types", done: true }, { name: "Functions", done: true }, { name: "OOP", done: true }], status: "completed", progress: 100, resources: [] },
  { id: 2, name: "Python Advanced", description: "Advanced Python patterns", subtopics: [{ name: "Decorators", done: true }, { name: "Generators", done: true }, { name: "Async/Await", done: true }], status: "completed", progress: 100, resources: [] },
  { id: 3, name: "ML Fundamentals", description: "Machine learning basics", subtopics: [{ name: "NumPy", done: true }, { name: "Pandas", done: true }, { name: "Scikit-learn", done: false }, { name: "Cross-validation", done: false }], status: "current", progress: 50, resources: [] },
  { id: 4, name: "Deep Learning", description: "Neural networks deep dive", subtopics: [{ name: "PyTorch", done: false }, { name: "CNNs", done: false }, { name: "RNNs", done: false }], status: "locked", progress: 0, resources: [] },
  { id: 5, name: "NLP & Transformers", description: "Natural language processing", subtopics: [{ name: "BERT", done: false }, { name: "GPT", done: false }, { name: "Attention", done: false }], status: "locked", progress: 0, resources: [] },
  { id: 6, name: "LLMs & Prompting", description: "Large language models", subtopics: [{ name: "Prompt Engineering", done: false }, { name: "RAG", done: false }, { name: "Fine-tuning", done: false }], status: "locked", progress: 0, resources: [] },
  { id: 7, name: "AI Agents", description: "Autonomous AI systems", subtopics: [{ name: "LangChain", done: false }, { name: "AutoGen", done: false }, { name: "OpenClaw", done: false }], status: "locked", progress: 0, resources: [] },
  { id: 8, name: "Deployment", description: "Production deployment", subtopics: [{ name: "Docker", done: false }, { name: "APIs", done: false }, { name: "Cloud", done: false }], status: "locked", progress: 0, resources: [] },
];

const RoadmapPage = () => {
  const db = useDatabaseService();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newResource, setNewResource] = useState("");

  const { setCurrentPage, setPageData } = useRISEContext();

  useEffect(() => {
    const loadSkills = async () => {
      const saved = await db.getRecord("coding_skills", "roadmap");
      if (saved?.items && Array.isArray(saved.items)) {
        setSkills(saved.items as Skill[]);
      }
    };

    void loadSkills();
  }, [db]);

  useEffect(() => {
    setCurrentPage('roadmap');
    setPageData({ skills: skills.map(s => ({ name: s.name, progress: s.progress, status: s.status })) });
  }, [skills]);

  const saveSkills = async (s: Skill[]) => {
    setSkills(s);
    await db.saveRecord("coding_skills", { id: "roadmap", items: s, updatedAt: new Date().toISOString() });
  };

  const toggleSubtopic = (skillId: number, idx: number) => {
    const updated = skills.map(s => {
      if (s.id !== skillId) return s;
      const subs = s.subtopics.map((t, i) => i === idx ? { ...t, done: !t.done } : t);
      const progress = Math.round((subs.filter(t => t.done).length / subs.length) * 100);
      return { ...s, subtopics: subs, progress };
    });
    saveSkills(updated);
    const updatedSkill = updated.find(s => s.id === skillId);
    if (updatedSkill && selectedSkill) setSelectedSkill(updatedSkill);
  };

  const markComplete = (skillId: number) => {
    const updated = skills.map(s => s.id === skillId ? { ...s, status: "completed" as const, progress: 100, subtopics: s.subtopics.map(t => ({ ...t, done: true })) } : s);
    void saveSkills(updated);
    setSelectedSkill(null);
  };

  const addResource = () => {
    if (!newResource.trim() || !selectedSkill) return;
    const updated = skills.map(s => s.id === selectedSkill.id ? { ...s, resources: [...s.resources, newResource] } : s);
    void saveSkills(updated);
    setSelectedSkill({ ...selectedSkill, resources: [...selectedSkill.resources, newResource] });
    setNewResource("");
  };

  const deleteSkill = (id: number) => void saveSkills(skills.filter(s => s.id !== id));

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now(), name: "New Skill", description: "Description", subtopics: [{ name: "Topic 1", done: false }], status: "locked", progress: 0, resources: [],
    };
    void saveSkills([...skills, newSkill]);
  };

  const orderedSkills = [...skills].reverse();

  // Path positions - winding left/right
  const getNodePosition = (idx: number, total: number) => {
    const positions = ["left", "right"];
    return positions[idx % 2];
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-rise-text">Your AI Engineer Journey</h2>
        <button onClick={() => setEditMode(!editMode)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors ${editMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}>
          <Edit3 size={12} /> {editMode ? "Done Editing" : "Edit Roadmap"}
        </button>
      </div>

      <div className="relative max-w-xl mx-auto">
        {/* End goal */}
        <div className="flex justify-center mb-2">
          <div className="card-rise flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-primary/20">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-bold text-rise-text text-lg">AI ENGINEER</p>
              <p className="text-xs text-muted-foreground">End Goal</p>
            </div>
          </div>
        </div>

        {/* Nodes */}
        {orderedSkills.map((skill, idx) => {
          const pos = getNodePosition(idx, orderedSkills.length);
          const isLeft = pos === "left";

          return (
            <div key={skill.id} className="flex flex-col items-center">
              {/* Connector line */}
              <svg width="60" height="40" className="text-primary">
                <path d={isLeft ? "M30 0 Q10 20 30 40" : "M30 0 Q50 20 30 40"} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
              </svg>

              {/* Node row */}
              <div className={`flex items-center gap-4 w-full ${isLeft ? "flex-row pl-4" : "flex-row-reverse pr-4"}`}>
                {/* Node circle */}
                <button
                  onClick={() => skill.status !== "locked" && setSelectedSkill(skill)}
                  disabled={skill.status === "locked" && !editMode}
                  className={`relative shrink-0 transition-all ${skill.status === "locked" && !editMode ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className={`flex items-center justify-center rounded-full transition-all
                    ${skill.status === "completed" ? "w-12 h-12 bg-primary shadow-lg shadow-primary/30" : ""}
                    ${skill.status === "current" ? "w-14 h-14 border-3 border-primary animate-pulse-ring" : ""}
                    ${skill.status === "locked" ? "w-12 h-12 bg-muted" : ""}
                  `}>
                    {skill.status === "completed" && <Check size={20} className="text-primary-foreground" />}
                    {skill.status === "current" && <span className="w-4 h-4 rounded-full bg-primary" />}
                    {skill.status === "locked" && <Lock size={16} className="text-muted-foreground" />}
                  </div>
                  {skill.status === "current" && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">CURRENT</span>
                  )}
                </button>

                {/* Info */}
                <div className={`flex-1 ${isLeft ? "text-left" : "text-right"}`}>
                  <p className={`font-semibold text-sm ${skill.status === "locked" ? "text-muted-foreground" : "text-rise-text"}`}>
                    {skill.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{skill.subtopics.map(s => s.name).join(", ")}</p>
                  {skill.status !== "locked" && (
                    <div className="flex items-center gap-2 mt-1" style={{ justifyContent: isLeft ? "flex-start" : "flex-end" }}>
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${skill.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-primary font-medium">{skill.progress}%</span>
                    </div>
                  )}
                </div>

                {editMode && (
                  <button onClick={() => deleteSkill(skill.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Start node */}
        <div className="flex flex-col items-center mt-2">
          <svg width="60" height="30"><path d="M30 0 L30 30" stroke="hsl(14, 78%, 56%)" strokeWidth="2" strokeDasharray="6 4" /></svg>
          <div className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30">
            START
          </div>
        </div>

        {editMode && (
          <div className="flex justify-center mt-6">
            <button onClick={addSkill} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-secondary">
              <Plus size={16} /> Add Skill Node
            </button>
          </div>
        )}
      </div>

      {/* Skill Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => setSelectedSkill(null)}>
          <div className="bg-card rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" style={{ boxShadow: "var(--shadow-modal)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-rise-text text-lg">{selectedSkill.name}</h3>
              <button onClick={() => setSelectedSkill(null)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{selectedSkill.description}</p>

            {/* Progress slider */}
            <h4 className="text-sm font-semibold text-rise-text mb-2">Your Progress</h4>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-1">
              <div className="h-full rounded-full transition-all" style={{ width: `${selectedSkill.progress}%`, background: "linear-gradient(90deg, hsl(var(--primary)), #ff4500)" }} />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{selectedSkill.progress}% complete</p>

            <h4 className="text-sm font-semibold text-rise-text mb-2">Topics</h4>
            <div className="space-y-2 mb-4">
              {selectedSkill.subtopics.map((st, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleSubtopic(selectedSkill.id, i)}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${st.done ? "bg-primary border-primary" : "border-gray-300"}`}>
                    {st.done && <Check size={12} className="text-primary-foreground" />}
                  </div>
                  <span className={`text-sm ${st.done ? "line-through text-muted-foreground" : "text-rise-text"}`}>{st.name}</span>
                </label>
              ))}
            </div>

            {/* Resources */}
            <h4 className="text-sm font-semibold text-rise-text mb-2">Resources</h4>
            {selectedSkill.resources.length > 0 && (
              <div className="space-y-1 mb-2">
                {selectedSkill.resources.map((r, i) => (
                  <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline truncate">{r}</a>
                ))}
              </div>
            )}
            <div className="flex gap-2 mb-4">
              <input value={newResource} onChange={e => setNewResource(e.target.value)} onKeyDown={e => e.key === "Enter" && addResource()}
                placeholder="Add resource link..." className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 outline-none text-rise-text placeholder:text-muted-foreground" />
              <button onClick={addResource} className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-secondary">
                <Plus size={16} />
              </button>
            </div>

            {selectedSkill.status !== "completed" && (
              <button onClick={() => markComplete(selectedSkill.id)}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Mark Complete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
