import { Home, TrendingUp, BarChart3, Newspaper, Map, User, Settings } from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", id: "dashboard" },
  { icon: TrendingUp, label: "Progress", id: "progress" },
  { icon: BarChart3, label: "Stats", id: "stats" },
  { icon: Newspaper, label: "News", id: "news" },
  { icon: Map, label: "Roadmap", id: "roadmap" },
  { icon: User, label: "Profile", id: "profile" },
  { icon: Settings, label: "Settings", id: "settings" },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar = ({ activePage, onNavigate }: SidebarProps) => {
  return (
    <div className="w-[80px] bg-rise-dark rounded-l-3xl flex flex-col items-center py-6 gap-1 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 rounded-full bg-rise-orange flex items-center justify-center mb-6">
        <span className="text-white font-bold text-lg">R</span>
      </div>

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl w-[64px] transition-all cursor-pointer
                ${isActive 
                  ? "bg-rise-orange" 
                  : "hover:bg-white/10"
                }`}
            >
              <Icon
                size={20}
                className={isActive ? "text-white" : "text-gray-400"}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-white" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom monogram */}
      <div className="mt-auto">
        <span className="text-gray-500 text-[10px] font-semibold tracking-wider">RISE</span>
      </div>
    </div>
  );
};

export default Sidebar;
