import { useState, useEffect } from "react";
import { Search, ExternalLink, Bookmark, BookmarkCheck, RefreshCw } from "lucide-react";
import { useRISEContext } from "@/contexts/RISEContext";

const categories = ["All", "LLMs", "Agents", "Research", "Tools", "Open Source", "Industry"];

const newsItems = [
  { id: 1, category: "LLMs", title: "GPT-5 Sets New Benchmarks Across All Major Tasks", summary: "OpenAI's latest model shows significant improvements in reasoning, coding, and multimodal understanding. Early benchmarks suggest a 30% improvement over GPT-4 in complex reasoning tasks.", source: "TechCrunch", time: "2h ago", featured: true },
  { id: 2, category: "Agents", title: "LangChain v0.3 Released with Native Agent Support", summary: "Major update includes built-in agent orchestration and improved memory management.", source: "Dev.to", time: "4h ago" },
  { id: 3, category: "Research", title: "New Paper: Scaling Laws for AI Agent Architectures", summary: "Researchers find optimal model size-to-tool ratio for autonomous AI agents.", source: "ArXiv", time: "5h ago" },
  { id: 4, category: "Tools", title: "Cursor IDE Reaches 2M Users, Adds Collaborative Features", summary: "AI-first coding tool continues rapid growth with team collaboration support.", source: "The Verge", time: "6h ago" },
  { id: 5, category: "Industry", title: "Google DeepMind Unveils Gemini 3.0 Ultra", summary: "Multimodal model handles video, audio, code in single context window.", source: "Wired", time: "8h ago" },
  { id: 6, category: "LLMs", title: "Open Source Models Close Gap with Claude and GPT", summary: "Llama 4 and Mistral Large show competitive performance on enterprise tasks.", source: "Hacker News", time: "10h ago" },
  { id: 7, category: "Research", title: "Breakthrough in Efficient Transformer Architectures", summary: "New attention mechanism reduces compute requirements by 40% with minimal quality loss.", source: "ArXiv", time: "12h ago" },
  { id: 8, category: "Agents", title: "AutoGen Framework Gets Production-Ready Update", summary: "Microsoft's multi-agent framework now supports enterprise deployment patterns.", source: "Microsoft Blog", time: "1d ago" },
  { id: 9, category: "Open Source", title: "Hugging Face Launches Model Garden 2.0", summary: "New platform makes it easier to discover, compare, and deploy open-source models.", source: "VentureBeat", time: "1d ago" },
  { id: 10, category: "Tools", title: "Vercel AI SDK 4.0 Adds Multi-Modal Support", summary: "TypeScript SDK now supports image, audio, and video generation alongside text.", source: "Dev.to", time: "2d ago" },
];

const NewsPage = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "saved">("all");
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem("rise-news-bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  const { setCurrentPage, setPageData } = useRISEContext();

  useEffect(() => {
    setCurrentPage('news');
    setPageData({ newsItems: newsItems.length, bookmarks: bookmarks.length });
  }, [bookmarks]);

  const toggleBookmark = (id: number) => {
    const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem("rise-news-bookmarks", JSON.stringify(updated));
  };

  const filtered = newsItems.filter(n =>
    (view === "saved" ? bookmarks.includes(n.id) : true) &&
    (filter === "All" || n.category === filter) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase()))
  );

  const featured = view === "all" ? filtered.find(n => n.featured) : null;
  const rest = filtered.filter(n => n !== featured);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-rise-text">Today in AI</h2>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm hover:bg-secondary transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* View toggle + Search + Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button onClick={() => setView("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === "all" ? "bg-card text-rise-text shadow-sm" : "text-muted-foreground"}`}>
            All News
          </button>
          <button onClick={() => setView("saved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === "saved" ? "bg-card text-rise-text shadow-sm" : "text-muted-foreground"}`}>
            Saved ({bookmarks.length})
          </button>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-card rounded-xl px-4 py-2" style={{ boxShadow: "var(--shadow-card)" }}>
          <Search size={16} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..."
            className="flex-1 bg-transparent text-sm outline-none text-rise-text placeholder:text-muted-foreground" />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured && (
        <div className="card-rise mb-6">
          <div className="flex gap-6">
            <div className="w-2/5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center min-h-[160px]">
              <span className="text-5xl">🤖</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">{featured.category}</span>
              </div>
              <h3 className="text-lg font-bold text-rise-text mb-2">{featured.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{featured.summary}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{featured.source} · {featured.time}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleBookmark(featured.id)} className="text-muted-foreground hover:text-primary transition-colors">
                    {bookmarks.includes(featured.id) ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} />}
                  </button>
                  <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">Read More <ExternalLink size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {rest.map(n => (
          <div key={n.id} className="card-rise hover:scale-[1.01] transition-transform">
            <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">{n.category}</span>
            <h4 className="font-semibold text-rise-text mt-2 mb-1 text-sm">{n.title}</h4>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{n.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{n.source} · {n.time}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleBookmark(n.id)} className="text-muted-foreground hover:text-primary transition-colors">
                  {bookmarks.includes(n.id) ? <BookmarkCheck size={14} className="text-primary" /> : <Bookmark size={14} />}
                </button>
                <button className="text-[11px] text-primary font-medium hover:underline">Read More</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
