import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { getNotifications, markAllNotificationsRead, markNotificationRead, NotificationItem } from "@/services/skillExchangeApi";
import { sectionClass } from "./shared";

export function SkillNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  const markOne = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const routeByType = (type: string) => {
    if (type.includes("request")) return "/requests";
    if (type.includes("session") || type.includes("exchange") || type.includes("noshow")) return "/exchanges";
    if (type.includes("dispute")) return "/exchanges";
    return "/notifications";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Notifications</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}>{loading ? "Refreshing..." : "Refresh"}</Button>
          <Button onClick={markAll}>Mark All Read</Button>
        </div>
      </div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification._id} className={`${sectionClass} ${notification.read ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white">{notification.message}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-[rgba(189,216,233,0.75)]">
                  {notification.type} | {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {!notification.read && <Button variant="outline" onClick={() => markOne(notification._id)}>Mark Read</Button>}
                <Link to={routeByType(notification.type)}><Button>Open</Button></Link>
              </div>
            </div>
          </div>
        ))}
        {!loading && notifications.length === 0 && <div className={sectionClass}>No notifications yet.</div>}
      </div>
    </div>
  );
}
