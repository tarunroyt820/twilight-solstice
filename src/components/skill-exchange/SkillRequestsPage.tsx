import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { acceptTradeRequest, counterTradeRequest, declineTradeRequest, getTradeRequests, TradeRequest } from "@/services/skillExchangeApi";
import { sectionClass } from "./shared";

const getUserName = (value: string | { _id: string; fullName?: string }, fallback = "User"): string =>
  typeof value === "string" ? fallback : value.fullName || fallback;

export function SkillRequestsPage() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTradeRequests(tab);
      setRequests(data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const onAccept = async (id: string) => {
    try {
      await acceptTradeRequest(id);
      toast.success("Request accepted.");
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const onDecline = async (id: string) => {
    try {
      await declineTradeRequest(id);
      toast.success("Request declined.");
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const onCounter = async (id: string) => {
    const credits = window.prompt("Counter credits");
    const duration = window.prompt("Counter duration in minutes");
    const message = window.prompt("Counter message");
    try {
      await counterTradeRequest(id, {
        credits: credits ? Number(credits) : undefined,
        duration: duration ? Number(duration) : undefined,
        message: message || undefined,
      });
      toast.success("Counter sent.");
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Requests</h2>
        <Button variant="outline" onClick={load}>{loading ? "Refreshing..." : "Refresh"}</Button>
      </div>
      <div className="flex gap-2">
        <Button variant={tab === "received" ? "default" : "outline"} onClick={() => setTab("received")}>Received</Button>
        <Button variant={tab === "sent" ? "default" : "outline"} onClick={() => setTab("sent")}>Sent</Button>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request._id} className={sectionClass}>
            <p className="text-sm text-white">{getUserName(request.from, "Sender")} {"->"} {getUserName(request.to, "Receiver")}</p>
            <p className="mt-1 text-sm text-[rgba(189,216,233,0.8)]">
              {request.offeredSkill} for {request.requestedSkill} ({request.proposedDuration} mins, {request.proposedCredits} credits)
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-[rgba(189,216,233,0.7)]">Status: {request.status}</p>
            {tab === "received" && request.status === "pending" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => onAccept(request._id)}>Accept</Button>
                <Button variant="outline" onClick={() => onDecline(request._id)}>Decline</Button>
                <Button variant="outline" onClick={() => onCounter(request._id)}>Counter</Button>
              </div>
            )}
          </div>
        ))}
        {!loading && requests.length === 0 && <div className={sectionClass}>No requests in this tab.</div>}
      </div>
    </div>
  );
}
