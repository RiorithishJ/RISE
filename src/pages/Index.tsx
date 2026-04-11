import { useState, useCallback, useEffect } from "react";
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
import { useRISEContext } from "@/contexts/RISEContext";

const Index = () => {
  const { setCurrentPage } = useRISEContext();
  const [activePage, setActivePage] = useState("dashboard");
  const [scrollToSection, setScrollToSection] = useState<string | null>(null);

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
    chat: <FullChatPage />,
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-grain">
      <div className="w-full max-w-[1400px] h-[calc(100vh-48px)] bg-card rounded-3xl flex overflow-hidden" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.1)" }}>
        <Sidebar activePage={activePage} onNavigate={handleNavigate} />
        {pages[activePage] || <DashboardPage onNavigate={navigateToSection} />}
        {activePage !== "chat" && <ChatPanel />}
      </div>
    </div>
  );
};

export default Index;
