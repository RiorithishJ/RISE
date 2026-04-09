import { useState } from "react";
import { Search, ExternalLink } from "lucide-react";

const categories = ["All", "LLM", "Agents", "Research", "Tools", "Industry"];
const newsItems = [
  { id: 1, category: "LLM", title: "GPT-5 Sets New Benchmarks Across All Major Tasks", summary: "OpenAI's latest model shows significant improvements in reasoning, coding, and multimodal understanding.", source: "TechCrunch", time: "2h ago", featured: true },
  { id: 2, category: "Agents", title: "LangChain v0.3 Released with Native Agent Support", summary: "Major update includes built-in agent orchestration and improved memory management.", source: "Dev.to", time: "4h ago" },
  { id: 3, category: "Research", title: "New Paper: Scaling Laws for AI Agent Architectures", summary: "Researchers find optimal model size-to-tool ratio for autonomous AI agents.", source: "ArXiv", time: "5h ago" },
  { id: 4, category: "Tools", title: "Cursor IDE Reaches 2M Users, Adds Collaborative Features", summary: "AI-first coding tool continues rapid growth with team collaboration support.", source: "The Verge", time: "6h ago" },
  { id: 5, category: "Industry", title: "Google DeepMind Unveils Gemini 3.0 Ultra", summary: "Multimodal model handles video, audio, code in single context window.", source: "Wired", time: "8h ago" },
  { id: 6, category: "LLM", title: "Open Source Models Close Gap with Claude and GPT", summary: "Llama 4 and Mistral Large show competitive performance on enterprise tasks.", source: "Hacker News", time: "10h ago" },
  { id: 7, category: "Research", title: "Breakthrough in Efficient Transformer Architectures", summary: "New attention mechanism reduces compute requirements by 40% with minimal quality loss.", source: "ArXiv", time: "12h ago" },
  { id: 8, category: "Agents", title: "AutoGen Framework Gets Production-Ready Update", summary: "Microsoft's multi-agent framework now supports enterprise deployment patterns.", source: "Microsoft Blog", time: "1d ago" },
];

const NewsPage = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = newsItems.filter(n =>
    (filter === "All" || n.category === filter) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase()))
  );

  const featured = filtered.find(n => n.featured);
  const rest = filtered.filter(n => !n.featured);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h2 className="text-2xl font-bold text-rise-text mb-4">Today in AI</h2>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2" style={{ boxShadow: "var(--shadow-card)" }}>
          <Search size={16} className="text-rise-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..."
            className="flex-1 bg-transparent text-sm outline-none text-rise-text placeholder:text-rise-muted" />
        </div>
        <div className="flex gap-1 bg-white rounded-xl p-1" style={{ boxShadow: "var(--shadow-card)" }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === c ? "bg-rise-orange text-white" : "text-rise-muted hover:bg-rise-bg"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <div className="card-rise mb-6">
          <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl mb-4 flex items-center justify-center">
            <span className="text-4xl">🤖</span>
          </div>
          <span className="text-[10px] bg-rise-orange text-white px-2 py-0.5 rounded-full font-medium">{featured.category}</span>
          <h3 className="text-lg font-bold text-rise-text mt-2 mb-1">{featured.title}</h3>
          <p className="text-sm text-rise-muted mb-2">{featured.summary}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-rise-muted">{featured.source} · {featured.time}</span>
            <button className="text-xs text-rise-orange font-medium flex items-center gap-1 hover:underline">Read More <ExternalLink size={12} /></button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {rest.map(n => (
          <div key={n.id} className="card-rise">
            <span className="text-[10px] bg-rise-orange text-white px-2 py-0.5 rounded-full font-medium">{n.category}</span>
            <h4 className="font-semibold text-rise-text mt-2 mb-1 text-sm">{n.title}</h4>
            <p className="text-xs text-rise-muted mb-2 line-clamp-2">{n.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-rise-muted">{n.source} · {n.time}</span>
              <button className="text-[11px] text-rise-orange font-medium hover:underline">Read More</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
