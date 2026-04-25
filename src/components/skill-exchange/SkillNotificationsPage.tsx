import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationItem,
} from "@/services/skillExchangeApi";
import {
  formatRelativeDate,
  getNotificationRoute,
  getNotificationTone,
  panelClass,
  sectionClass,
} from "./shared";

type FilterOption = "all" | "unread" | "request" | "message" | "match" | "system";

export function SkillNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "unread") return !notification.read;
      return notification.type.includes(activeFilter);
    });
  }, [activeFilter, notifications]);

  const markOne = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((current) => current.map((item) => (item._id === id ? { ...item, read: true } : item)));
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const filters: FilterOption[] = ["all", "unread", "request", "message", "match", "system"];

  return (
    <div className="space-y-8">
      <div className={sectionClass}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,160,133,0.22)] bg-[rgba(22,160,133,0.08)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#7fe7d2]">
              <Bell className="h-3.5 w-3.5" />
              Alert Center
            </div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Keep up with requests, sessions, and exchange milestones</h2>
            <p className="mt-2 text-sm text-[rgba(189,216,233,0.76)] md:text-base">
              This page now uses your live notification routes while keeping the cleaner Grox dashboard feel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(22,160,133,0.22)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[rgba(22,160,133,0.08)] disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
            <button
              onClick={markAll}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#16A085,#12796d)] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(22,160,133,0.22)] transition hover:opacity-95"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      <div className={`${panelClass} p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition",
                  activeFilter === filter
                    ? "border-[rgba(22,160,133,0.28)] bg-[rgba(22,160,133,0.12)] text-[#7fe7d2]"
                    : "border-[rgba(255,255,255,0.08)] text-[rgba(189,216,233,0.62)]",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[rgba(189,216,233,0.68)]">
            <Filter className="h-3.5 w-3.5" />
            {unreadCount} unread
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className={`${panelClass} p-10 text-center`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.04)]">
              <Bell className="h-7 w-7 text-[rgba(189,216,233,0.45)]" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-white">No notifications in this filter</h3>
            <p className="mt-2 text-sm text-[rgba(189,216,233,0.68)]">Try another filter or refresh to pull new events.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const tone = getNotificationTone(notification.type);

            return (
              <div
                key={notification._id}
                className={cn(
                  "rounded-[28px] border bg-[linear-gradient(180deg,rgba(15,20,46,0.96),rgba(10,14,39,0.92))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.18)] transition hover:border-[rgba(22,160,133,0.2)]",
                  notification.read ? "border-[rgba(255,255,255,0.06)]" : "border-[rgba(22,160,133,0.18)]",
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${tone.dot}`} />
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${tone.chip}`}>
                        {tone.label}
                      </span>
                      {!notification.read && (
                        <span className="rounded-full border border-[rgba(22,160,133,0.22)] bg-[rgba(22,160,133,0.08)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#7fe7d2]">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-sm leading-7 text-white">{notification.message}</p>
                    <div className="mt-3 text-xs uppercase tracking-[0.18em] text-[rgba(189,216,233,0.44)]">
                      {formatRelativeDate(notification.createdAt)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {!notification.read && (
                      <button
                        onClick={() => markOne(notification._id)}
                        className="rounded-2xl border border-[rgba(22,160,133,0.24)] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#7fe7d2] transition hover:bg-[rgba(22,160,133,0.08)]"
                      >
                        Mark Read
                      </button>
                    )}
                    <Link
                      to={getNotificationRoute(notification.type)}
                      className="rounded-2xl border border-[rgba(255,255,255,0.08)] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-[rgba(22,160,133,0.22)] hover:text-[#7fe7d2]"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
