import Index from "./Index";

interface JarvisUIProps {
  currentMode: "jarvis" | "rise";
  onSwitchMode: (mode: "jarvis" | "rise") => void;
}

const JarvisUI = ({ currentMode, onSwitchMode }: JarvisUIProps) => (
  <div className="min-h-screen bg-[#05070d] text-white">
    <button
      onClick={() => onSwitchMode("rise")}
      className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur"
    >
      Switch to Rise
    </button>
    <Index currentMode={currentMode} onModeChange={onSwitchMode} />
  </div>
);

export default JarvisUI;
