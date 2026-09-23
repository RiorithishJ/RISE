import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

interface ModeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: "jarvis" | "rise";
  onModeChange?: (mode: "jarvis" | "rise") => void;
}

const ModeSwitcherModal = ({ isOpen, onClose, currentMode, onModeChange }: ModeSwitcherModalProps) => {
  const [targetMode, setTargetMode] = useState<"jarvis" | "rise">(currentMode === "jarvis" ? "rise" : "jarvis");

  if (!isOpen) return null;

  const switchMode = () => {
    onModeChange?.(targetMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mode switcher</p>
            <h3 className="text-xl font-semibold text-rise-text">Switch UI mode</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-rise-text">
            Current mode: <span className="font-semibold">{currentMode === "jarvis" ? "JARVIS" : "Rise"}</span>
          </div>
          <button
            onClick={() => setTargetMode("jarvis")}
            className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${targetMode === "jarvis" ? "border-primary bg-primary/10" : "border-border bg-background"}`}
          >
            <div>
              <p className="font-semibold text-rise-text">JARVIS Mode</p>
              <p className="text-sm text-muted-foreground">3D dark experience</p>
            </div>
            <ArrowRight size={16} className="text-primary" />
          </button>
          <button
            onClick={() => setTargetMode("rise")}
            className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${targetMode === "rise" ? "border-primary bg-primary/10" : "border-border bg-background"}`}
          >
            <div>
              <p className="font-semibold text-rise-text">Rise Mode</p>
              <p className="text-sm text-muted-foreground">Modern light dashboard</p>
            </div>
            <ArrowRight size={16} className="text-primary" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">Back</button>
          <button onClick={switchMode} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Confirm switch</button>
        </div>
      </div>
    </div>
  );
};

export default ModeSwitcherModal;
