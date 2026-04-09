import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import DashboardPage from "@/components/DashboardPage";
import ProgressPage from "@/components/ProgressPage";
import StatsPage from "@/components/StatsPage";
import NewsPage from "@/components/NewsPage";
import RoadmapPage from "@/components/RoadmapPage";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";

const pages: Record<string, React.FC> = {
  dashboard: DashboardPage,
  progress: ProgressPage,
  stats: StatsPage,
  news: NewsPage,
  roadmap: RoadmapPage,
  profile: ProfilePage,
  settings: SettingsPage,
};

const Index = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const PageComponent = pages[activePage] || DashboardPage;

  return (
    <div className="min-h-screen bg-rise-bg flex items-center justify-center p-6">
      <div className="w-full max-w-[1400px] h-[calc(100vh-48px)] bg-white rounded-3xl flex overflow-hidden" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.1)" }}>
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <PageComponent />
        <ChatPanel />
      </div>
    </div>
  );
};

export default Index;
