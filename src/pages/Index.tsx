import { useState, useCallback, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import DashboardPage from "@/components/DashboardPage";
import ProgressPage from "@/components/ProgressPage";
import FitnessPage from "@/components/FitnessPage";
import GitHubPage from "@/components/GitHubPage";
import StatsPage from "@/components/StatsPage";
import NewsPage from "@/components/NewsPage";
import RoadmapPage from "@/components/RoadmapPage";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";
import FullChatPage from "@/components/FullChatPage";
import AnalyzePage from "@/components/AnalyzePage";
import ModeSwitcherModal from "@/components/ModeSwitcherModal";
import { useRISEContext } from "@/contexts/RISEContext";

interface IndexProps {
  currentMode: "jarvis" | "rise";
  onModeChange: (mode: "jarvis" | "rise") => void;
}

const Index = ({ currentMode, onModeChange }: IndexProps) => {
  const { setCurrentPage } = useRISEContext();
  const [activePage, setActivePage] = useState("dashboard");
  const [scrollToSection, setScrollToSection] = useState<string | null>(null);
  const [isModeSwitcherOpen, setIsModeSwitcherOpen] = useState(false);

  // Keep the active page in context after navigation without triggering a render-phase state update.
  useEffect(() => {
    setCurrentPage(activePage);
  }, [activePage, setCurrentPage]);

  const navigateToSection = useCallback((page: string, section?: string) => {
    setActivePage(page);
    if (section) setScrollToSection(section);
  }, []);

  const handleScrollComplete = useCallback(() => {
    setScrollToSection(null);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    setActivePage(page);
  }, []);

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage onNavigate={navigateToSection} />,
    progress: <ProgressPage scrollToSection={scrollToSection} onScrollComplete={handleScrollComplete} />,
    fitness: <FitnessPage />,
    github: <GitHubPage />,
    stats: <StatsPage />,
    news: <NewsPage />,
    roadmap: <RoadmapPage />,
    profile: <ProfilePage />,
    settings: <SettingsPage />,
    analyze: <AnalyzePage />,
    chat: <FullChatPage />,
  };

  return (
    <div className="min-h-screen bg-background bg-grain">
      <div className="w-full h-screen bg-card flex overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} />
        <div className="flex-1">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsModeSwitcherOpen(true)} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm text-rise-text shadow-sm">
              <SlidersHorizontal size={16} />
              {currentMode === "jarvis" ? "JARVIS" : "Rise"}
            </button>
          </div>
          {pages[activePage] || <DashboardPage onNavigate={navigateToSection} />}
        </div>
        {activePage !== "chat" && <ChatPanel />}
      </div>
      <ModeSwitcherModal isOpen={isModeSwitcherOpen} onClose={() => setIsModeSwitcherOpen(false)} currentMode={currentMode} onModeChange={onModeChange} />
    </div>
  );
};

export default Index;
