import { useEffect, useState } from "react";
import { Sparkles, Orbit } from "lucide-react";

interface ModeSelectorProps {
  onModeSelect: (mode: "jarvis" | "rise") => void;
}

const ModeSelector = ({ onModeSelect }: ModeSelectorProps) => {
  const [hasPreviousMode, setHasPreviousMode] = useState(false);

  useEffect(() => {
    setHasPreviousMode(!!localStorage.getItem("appMode"));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,115,0,0.15),_transparent_45%),linear-gradient(135deg,_#fff9f5,_#ffffff)] p-6">
      <div className="w-full max-w-5xl rounded-3xl border border-border bg-card/90 p-8 shadow-2xl backdrop-blur">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">RISE workspace</p>
          <h1 className="mt-3 text-4xl font-bold text-rise-text">Choose your interface</h1>
          <p className="mt-3 text-sm text-muted-foreground">Start in JARVIS for the cinematic dark mode or Rise for the modern light dashboard.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <button onClick={() => onModeSelect("jarvis")} className="rounded-2xl border border-border bg-background p-6 text-left transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Orbit size={22} /></div>
              <div>
                <h2 className="text-xl font-semibold text-rise-text">JARVIS Mode</h2>
                <p className="text-sm text-muted-foreground">3D dark experience with immersive visuals</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Keep the cinematic UI and switch effortlessly between modes later.</p>
          </button>

          <button onClick={() => onModeSelect("rise")} className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-left transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Sparkles size={22} /></div>
              <div>
                <h2 className="text-xl font-semibold text-rise-text">Rise Mode</h2>
                <p className="text-sm text-muted-foreground">Modern light dashboard with all the same data</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Use the polished dashboard for planning, stats, and progress tracking.</p>
          </button>
        </div>

        {hasPreviousMode && (
          <p className="mt-6 text-center text-sm text-muted-foreground">A previous mode was detected. You can still switch later from the top-right control.</p>
        )}
      </div>
    </div>
  );
};

export default ModeSelector;
