import Index from "./Index";

interface RiseDashboardProps {
  currentMode: "jarvis" | "rise";
  onSwitchMode: (mode: "jarvis" | "rise") => void;
}

const RiseDashboard = ({ currentMode, onSwitchMode }: RiseDashboardProps) => (
  <div>
    <button
      onClick={() => onSwitchMode("jarvis")}
      className="absolute right-4 top-4 z-10 rounded-full border border-border bg-background px-3 py-2 text-sm text-rise-text shadow-sm"
    >
      Switch to JARVIS
    </button>
    <Index currentMode={currentMode} onModeChange={onSwitchMode} />
  </div>
);

export default RiseDashboard;
