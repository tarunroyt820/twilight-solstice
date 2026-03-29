import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  Compass,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import { logout } from "@/services/authApi";
import { getProfile } from "@/services/profileApi";
import { UserProfile } from "@/types/profile";

import { AIAssistantShell } from "./AIAssistantShell";
import { CareerPathShell } from "./CareerPathShell";
import { LearningShell } from "./LearningShell";
import { OverviewShell } from "./OverviewShell";
import { ResumeUpload } from "./ResumeUpload";
import { SettingsShell } from "./SettingsShell";
import { SkillExchangeShell } from "./SkillExchangeShell";
import { SkillGapShell } from "./SkillGapShell";

const primaryNavItems = [
  { icon: LayoutGrid, label: "Overview", id: "overview", path: "/dashboard/overview" },
  { icon: Compass, label: "Career Path", id: "career", path: "/dashboard/career" },
  { icon: TrendingUp, label: "Skill Gap", id: "skillgap", path: "/dashboard/skillgap" },
  { icon: BookOpen, label: "Learning", id: "learning", path: "/dashboard/learning" },
  { icon: RefreshCw, label: "Skill Exchange", id: "skills", path: "/dashboard/skills" },
  { icon: MessageSquare, label: "AI Assistant", id: "assistant", path: "/dashboard/assistant" },
];

const secondaryNavItems = [
  { icon: FileText, label: "My Resume", id: "resume", path: "/dashboard/resume" },
  { icon: Settings, label: "Settings", id: "settings", path: "/dashboard/settings" },
];

const allNavItems = [...primaryNavItems, ...secondaryNavItems];

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Dashboard: Error fetching profile", error);
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

  const handleDashboardLogoDoubleClick = () => {
    const confirmed = window.confirm("Do you want to sign out?");
    if (confirmed) handleLogout();
  };

  const getInitials = (name: string) =>
    name
      ? name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "JD";

  const activeItem = useMemo(
    () =>
      allNavItems.find((item) => location.pathname.startsWith(item.path)) ||
      allNavItems[0],
    [location.pathname],
  );
  const isAssistantRoute = location.pathname.startsWith("/dashboard/assistant");

  if (!profile) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{
            borderColor: "var(--color-teal)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  const renderNavSection = (
    title: string,
    items: typeof primaryNavItems,
    closeOnClick = false,
    expanded = true,
  ) => (
    <div>
      {expanded && (
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.25)]">
          {title}
        </p>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => closeOnClick && setSidebarOpen(false)}
            style={({ isActive }) => ({
              background: isActive
                ? "linear-gradient(135deg, rgba(22,160,133,0.22), rgba(22,160,133,0.08))"
                : "transparent",
              color: isActive ? "#16A085" : "rgba(255,255,255,0.45)",
              fontWeight: isActive ? 600 : 500,
            })}
            className={`group relative flex items-center rounded-[10px] py-2.5 text-[13px] transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.7)] ${
              expanded ? "gap-3 px-3 justify-start" : "justify-center px-0"
            }`}
            title={!expanded ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-[3px] bg-[#16A085]" />
                )}
                <item.icon className="h-[17px] w-[17px] shrink-0 opacity-90" />
                {expanded && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0E27] text-white transition-colors duration-300">
      <aside
        className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[rgba(22,160,133,0.15)] bg-[#0D1128] transition-[width] duration-300 lg:flex"
        style={{ width: desktopSidebarExpanded ? 272 : 88 }}
      >
        <div
          className={`flex h-16 items-center border-b border-[rgba(22,160,133,0.1)] ${
            desktopSidebarExpanded ? "justify-between px-[18px]" : "justify-center px-0"
          }`}
        >
          {desktopSidebarExpanded ? (
            <div className="flex items-center">
              <Logo
                size="sm"
                className="mr-2"
                onClick={() => {}}
                onDoubleClick={handleDashboardLogoDoubleClick}
              />
              <span className="text-[15px] font-semibold text-white">Nextaro</span>
            </div>
          ) : (
            <button
              onClick={() => setDesktopSidebarExpanded(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(22,160,133,0.08)] text-[#16A085] transition hover:bg-[rgba(22,160,133,0.18)]"
              aria-label="Expand sidebar"
              title="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {desktopSidebarExpanded && (
            <button
              onClick={() => setDesktopSidebarExpanded(false)}
              className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[rgba(22,160,133,0.08)] text-[rgba(255,255,255,0.5)] transition-colors hover:bg-[rgba(22,160,133,0.16)] hover:text-white"
              aria-label="Collapse sidebar"
              title="Close menu"
            >
              <ChevronLeft className="h-[17px] w-[17px]" />
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div className={`overflow-hidden py-3 ${desktopSidebarExpanded ? "px-[10px]" : "px-3"}`}>
            {renderNavSection("Main Menu", primaryNavItems, false, desktopSidebarExpanded)}
            <div className="mx-[6px] my-3 h-px bg-[rgba(22,160,133,0.08)]" />
            {renderNavSection("Others", secondaryNavItems, false, desktopSidebarExpanded)}
          </div>

          <div className="border-t border-[rgba(22,160,133,0.1)] p-3">
            <div
              className={`rounded-[10px] bg-[rgba(22,160,133,0.07)] ${
                desktopSidebarExpanded ? "flex items-center gap-3 px-3 py-2.5" : "flex justify-center px-0 py-3"
              }`}
            >
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,#16A085,#0e7c6b)] text-[12px] font-bold text-white">
                {getInitials(profile.fullName)}
              </div>
              {desktopSidebarExpanded && (
                <>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {profile.fullName}
                    </p>
                    <p className="truncate text-[11px] text-[rgba(22,160,133,0.85)]">
                      {profile.jobTitle || "Nextaro Explorer"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto rounded-[5px] p-1 text-[rgba(255,255,255,0.3)] transition hover:bg-[rgba(239,68,68,0.12)] hover:text-[#ef4444]"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-[15px] w-[15px]" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(20,12,48,0.6)] backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transform border-r border-[rgba(22,160,133,0.15)] bg-[#0D1128] transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[rgba(22,160,133,0.1)] px-5">
          <div className="flex items-center gap-2">
            <Logo
              size="sm"
              onClick={() => {}}
              onDoubleClick={handleDashboardLogoDoubleClick}
            />
            <span className="text-sm font-semibold text-white">Nextaro</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2 text-[rgba(255,255,255,0.5)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {renderNavSection("Main Menu", primaryNavItems, true, true)}
          {renderNavSection("Others", secondaryNavItems, true, true)}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-start gap-3 rounded-2xl px-4 py-4 font-semibold text-[rgba(255,255,255,0.6)] transition-all hover:bg-[rgba(239,68,68,0.12)] hover:text-[#ef4444]"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[rgba(22,160,133,0.08)] bg-[rgba(10,14,39,0.9)] px-6 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            {!isAssistantRoute && (
              <button
                onClick={() => setDesktopSidebarExpanded((current) => !current)}
                className="hidden h-9 w-9 items-center justify-center rounded-[9px] bg-[rgba(22,160,133,0.08)] text-[rgba(255,255,255,0.5)] transition-colors hover:bg-[rgba(22,160,133,0.16)] hover:text-white lg:flex"
                aria-label={desktopSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                title={desktopSidebarExpanded ? "Close menu" : "Open menu"}
              >
                {desktopSidebarExpanded ? (
                  <ChevronLeft className="h-[17px] w-[17px]" />
                ) : (
                  <Menu className="h-[17px] w-[17px]" />
                )}
              </button>
            )}
            {!isAssistantRoute && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[rgba(22,160,133,0.08)] text-[rgba(255,255,255,0.5)] transition-colors hover:bg-[rgba(22,160,133,0.16)] hover:text-white lg:hidden"
              >
                <Menu className="h-[17px] w-[17px]" />
              </button>
            )}
            <div className="text-base font-bold text-white">{activeItem.label}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-[180px] items-center gap-2 rounded-[9px] border border-[rgba(22,160,133,0.12)] bg-[rgba(22,160,133,0.06)] px-3 md:flex">
              <Search className="h-[13px] w-[13px] text-[rgba(255,255,255,0.3)]" />
              <input
                placeholder="Search..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[rgba(255,255,255,0.3)]"
              />
            </div>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-[9px] bg-[rgba(22,160,133,0.06)] text-[rgba(255,255,255,0.5)]">
              <Bell className="h-[15px] w-[15px]" />
              <span className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full border-2 border-[#0A0E27] bg-[#ef4444]" />
            </button>
            <div className="hidden items-center gap-3 border-l border-[rgba(22,160,133,0.12)] pl-3 sm:flex">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-white">
                  Hey, {profile.fullName.split(" ")[0] || "there"}
                </p>
                <p className="text-[11px] text-[rgba(22,160,133,0.8)]">
                  {profile.jobTitle || "Nextaro Explorer"}
                </p>
              </div>
              <div className="relative flex h-9 w-9 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#16A085,#0e7c6b)] text-[12px] font-bold text-white">
                {getInitials(profile.fullName)}
                <div className="absolute -bottom-px -right-px h-[10px] w-[10px] rounded-full border-2 border-[#0A0E27] bg-[#22c55e]" />
              </div>
            </div>
          </div>
        </header>

        <main
          className={cn(
            "flex-1 min-h-0 bg-[#0A0E27] p-5 lg:px-6 lg:py-5",
            isAssistantRoute ? "overflow-hidden" : "overflow-auto",
          )}
        >
          <div
            className={cn(
              "mx-auto w-full",
              isAssistantRoute ? "max-w-none" : "max-w-7xl",
              isAssistantRoute ? "flex h-full min-h-0 flex-col overflow-hidden" : "",
            )}
          >
            <Routes>
              <Route path="overview" element={<OverviewShell />} />
              <Route path="career" element={<CareerPathShell />} />
              <Route path="skillgap" element={<SkillGapShell />} />
              <Route path="learning" element={<LearningShell />} />
              <Route path="skills" element={<SkillExchangeShell />} />
              <Route
                path="assistant"
                element={
                  <div className="flex h-full min-h-0 flex-col overflow-hidden">
                    <AIAssistantShell />
                  </div>
                }
              />
              <Route path="resume" element={<ResumeUpload />} />
              <Route path="settings" element={<SettingsShell />} />
              <Route path="/" element={<Navigate to="overview" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
