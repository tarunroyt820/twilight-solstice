import { Button } from "@/components/common/Button";
import {
  BookOpen,
  Compass,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Settings,
  User,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate, Link } from "react-router-dom";
import { OverviewShell } from "./OverviewShell";
import { CareerPathShell } from "./CareerPathShell";
import { LearningShell } from "./LearningShell";
import { SkillExchangeShell } from "./SkillExchangeShell";
import { AIAssistantShell } from "./AIAssistantShell";
import { SettingsShell } from "./SettingsShell";
import Profile from "./Profile";
import { Logo } from "@/components/common/Logo";
import { getProfile } from "@/services/profileApi";
import { UserProfile } from "@/types/profile";
import { logout } from "@/services/authApi";

const navItems = [
  { icon: Home, label: "Overview", id: "overview", path: "/dashboard/overview" },
  { icon: Compass, label: "Career Path", id: "career", path: "/dashboard/career" },
  { icon: BookOpen, label: "Learning", id: "learning", path: "/dashboard/learning" },
  { icon: RefreshCw, label: "Skill Exchange", id: "skills", path: "/dashboard/skills" },
  { icon: MessageSquare, label: "AI Assistant", id: "assistant", path: "/dashboard/assistant" },
  { icon: Settings, label: "Settings", id: "settings", path: "/dashboard/settings" },
  { icon: User, label: "Profile", id: "profile", path: "/dashboard/profile" },
];

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Dashboard: Error fetching profile", error);
        // If profile fetch fails, token might be invalid
        logout();
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "JD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--color-teal)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden w-72 flex-col border-r border-[rgba(21,86,91,0.25)] bg-[rgba(13,17,40,0.95)] backdrop-blur-xl lg:flex sticky top-0 h-screen">
        <div className="flex h-32 items-center px-8">
          <Logo size="lg" />
        </div>

        <div className="flex flex-1 flex-col justify-between p-6">
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 group hover:scale-[1.02] ${isActive ? 'bg-[#16A085] text-white' : 'text-secondary hover:bg-[rgba(22,160,133,0.15)]'}`}
              >
                <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110`} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="group mt-auto flex w-full items-center justify-start gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm transition-opacity lg:hidden"
          style={{ background: 'rgba(20,12,48,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transform backdrop-blur-2xl transition-transform duration-300 ease-out lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ background: 'rgba(20,37,62,0.95)' }}
      >
        <div className="flex h-32 items-center justify-between px-8" style={{ borderBottomWidth: '1px', borderColor: 'var(--border-subtle)' }}>
          <Logo size="lg" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-teal-light)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-teal)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: isActive ? 'var(--glow-teal)' : 'none',
              })}
              className="flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold transition-all"
              onMouseEnter={(e) => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'var(--color-teal-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-start gap-3 rounded-2xl px-4 py-4 font-semibold transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background Decorative Blurs */}
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(22,160,133,0.05)' }} />
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(22,160,133,0.03)' }} />

        {/* Top Bar */}
        <header className="flex h-24 items-center justify-between backdrop-blur-xl px-6 lg:px-12 shrink-0 z-10 sticky top-0" style={{ borderBottomWidth: '1px', borderColor: 'var(--border-subtle)', background: 'rgba(20,12,48,0.85)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-2xl p-3 lg:hidden transition-colors"
              style={{ background: 'var(--color-teal-light)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-teal-glow)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-teal-light)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl" style={{ color: 'var(--text-primary)' }}>
                Hey, {profile?.fullName?.split(" ")[0] || "there"} 👋
              </h1>
              <p className="hidden text-sm font-medium sm:block" style={{ color: 'var(--text-secondary)' }}>
                Here's what's happening with your career today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{profile?.fullName}</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-teal)' }}>{profile?.jobTitle || "Nextaro Explorer"}</p>
            </div>
            <div className="group relative cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-xl transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(to bottom right, var(--color-teal), var(--color-teal-hover))', boxShadow: 'var(--glow-teal)' }}>
                {getInitials(profile?.fullName || "")}
              </div>
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 shadow-sm" style={{ borderColor: 'var(--bg-primary)', background: 'var(--color-teal)' }} />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto bg-[#140C30] p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">
          <div className="max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="overview" element={<OverviewShell />} />
              <Route path="career" element={<CareerPathShell />} />
              <Route path="learning" element={<LearningShell />} />
              <Route path="skills" element={<SkillExchangeShell />} />
              <Route path="assistant" element={<AIAssistantShell />} />
              <Route path="settings" element={<SettingsShell />} />
              <Route path="profile" element={<Profile />} />
              <Route path="/" element={<Navigate to="overview" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
