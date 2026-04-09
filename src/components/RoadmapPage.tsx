import { useState } from "react";
import { Lock, Check, X, Plus, Edit3 } from "lucide-react";

interface Skill {
  id: number;
  name: string;
  description: string;
  subtopics: { name: string; done: boolean }[];
  status: "completed" | "current" | "locked";
  progress: number;
}

const initialSkills: Skill[] = [
  { id: 1, name: "Python Basics", description: "Core Python fundamentals", subtopics: [{ name: "Variables & Types", done: true }, { name: "Functions", done: true }, { name: "OOP", done: true }], status: "completed", progress: 100 },
  { id: 2, name: "Python Advanced", description: "Advanced Python patterns", subtopics: [{ name: "Decorators", done: true }, { name: "Generators", done: true }, { name: "Async/Await", done: true }], status: "completed", progress: 100 },
  { id: 3, name: "ML Fundamentals", description: "Machine learning basics", subtopics: [{ name: "NumPy", done: true }, { name: "Pandas", done: true }, { name: "Scikit-learn", done: false }], status: "current", progress: 66 },
  { id: 4, name: "Deep Learning", description: "Neural networks deep dive", subtopics: [{ name: "PyTorch", done: false }, { name: "CNNs", done: false }, { name: "RNNs", done: false }], status: "locked", progress: 0 },
  { id: 5, name: "NLP & Transformers", description: "Natural language processing", subtopics: [{ name: "BERT", done: false }, { name: "GPT", done: false }, { name: "Attention", done: false }], status: "locked", progress: 0 },
  { id: 6, name: "LLMs & Prompting", description: "Large language models", subtopics: [{ name: "Prompt Engineering", done: false }, { name: "RAG", done: false }, { name: "Fine-tuning", done: false }], status: "locked", progress: 0 },
  { id: 7, name: "AI Agents", description: "Autonomous AI systems", subtopics: [{ name: "LangChain", done: false }, { name: "AutoGen", done: false }, { name: "OpenClaw", done: false }], status: "locked", progress: 0 },
  { id: 8, name: "Deployment", description: "Production deployment", subtopics: [{ name: "Docker", done: false }, { name: "APIs", done: false }, { name: "Cloud", done: false }], status: "locked", progress: 0 },
];

const RoadmapPage = () => {
  const [skills] = useState<Skill[]>(initialSkills);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-rise-text">Your AI Engineer Journey</h2>
        <button className="text-xs bg-rise-bg px-3 py-1.5 rounded-lg text-rise-muted font-medium flex items-center gap-1 hover:bg-gray-200 transition-colors">
          <Edit3 size={12} /> Edit Mode
        </button>
      </div>

      {/* Path */}
      <div className="flex flex-col items-center relative">
        {/* End goal */}
        <div className="card-rise flex items-center gap-3 mb-4 px-6 py-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-rise-orange/20">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-bold text-rise-text">AI ENGINEER</p>
            <p className="text-xs text-rise-muted">End Goal</p>
          </div>
        </div>

        {[...skills].reverse().map((skill, idx) => (
          <div key={skill.id} className="flex flex-col items-center">
            {/* Connector */}
            <div className={`w-0.5 h-8 ${skill.status === "locked" ? "bg-gray-200" : "bg-rise-orange"}`} />

            {/* Node */}
            <button
              onClick={() => setSelectedSkill(skill)}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all
                ${skill.status === "completed" ? "bg-rise-orange" : ""}
                ${skill.status === "current" ? "border-2 border-rise-orange animate-pulse-ring" : ""}
                ${skill.status === "locked" ? "bg-gray-200" : ""}
              `}>
                {skill.status === "completed" && <Check size={20} className="text-white" />}
                {skill.status === "current" && <span className="w-3 h-3 rounded-full bg-rise-orange" />}
                {skill.status === "locked" && <Lock size={16} className="text-gray-400" />}
              </div>
              <div className="text-left">
                <p className={`font-semibold text-sm ${skill.status === "locked" ? "text-rise-muted" : "text-rise-text"}`}>
                  {skill.name}
                </p>
                <p className="text-xs text-rise-muted">{skill.subtopics.map(s => s.name).join(", ")}</p>
              </div>
              {skill.status !== "locked" && (
                <span className="text-xs text-rise-orange font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  {skill.progress}%
                </span>
              )}
            </button>
          </div>
        ))}

        {/* Start */}
        <div className="w-0.5 h-8 bg-rise-orange" />
        <div className="px-4 py-2 rounded-full bg-rise-orange text-white text-sm font-semibold">START</div>
      </div>

      {/* Skill Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedSkill(null)}>
          <div className="bg-white rounded-2xl p-6 w-[400px] max-h-[80vh] overflow-y-auto" style={{ boxShadow: "var(--shadow-modal)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-rise-text text-lg">{selectedSkill.name}</h3>
              <button onClick={() => setSelectedSkill(null)}><X size={20} className="text-rise-muted" /></button>
            </div>
            <p className="text-sm text-rise-muted mb-4">{selectedSkill.description}</p>
            
            <h4 className="text-sm font-semibold text-rise-text mb-2">Sub-topics</h4>
            <div className="space-y-2 mb-4">
              {selectedSkill.subtopics.map((st, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${st.done ? "bg-rise-orange border-rise-orange" : "border-gray-300"}`}>
                    {st.done && <Check size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm ${st.done ? "line-through text-rise-muted" : "text-rise-text"}`}>{st.name}</span>
                </label>
              ))}
            </div>

            <h4 className="text-sm font-semibold text-rise-text mb-2">Progress</h4>
            <div className="w-full h-2 bg-rise-bg rounded-full overflow-hidden mb-4">
              <div className="h-full bg-rise-orange rounded-full" style={{ width: `${selectedSkill.progress}%` }} />
            </div>
            <p className="text-sm text-rise-muted mb-4">{selectedSkill.progress}% complete</p>

            {selectedSkill.status !== "completed" && (
              <button className="w-full py-2 rounded-lg bg-rise-orange text-white text-sm font-medium hover:opacity-90 transition-opacity">
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
