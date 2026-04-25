import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, CheckCircle2, RefreshCw, Send, X } from "lucide-react";
import { toast } from "sonner";

import {
  acceptTradeRequest,
  counterTradeRequest,
  declineTradeRequest,
  getTradeRequests,
  TradeRequest,
} from "@/services/skillExchangeApi";
import { cn } from "@/lib/utils";
import { formatRelativeDate, getRequestStatusTone, inputClass, panelClass, sectionClass } from "./shared";

const getUserName = (value: string | { _id: string; fullName?: string }, fallback = "User"): string =>
  typeof value === "string" ? fallback : value.fullName || fallback;

type CounterDraft = {
  id: string;
  credits: string;
  duration: string;
  message: string;
};

export function SkillRequestsPage() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [counterDraft, setCounterDraft] = useState<CounterDraft | null>(null);
  const [saving, setSaving] = useState(false);

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

  const onCounter = async () => {
    if (!counterDraft) return;

    setSaving(true);
    try {
      await counterTradeRequest(counterDraft.id, {
        credits: counterDraft.credits ? Number(counterDraft.credits) : undefined,
        duration: counterDraft.duration ? Number(counterDraft.duration) : undefined,
        message: counterDraft.message.trim() || undefined,
      });
      toast.success("Counter offer sent.");
      setCounterDraft(null);
      load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => statusFilter === "all" || request.status === statusFilter);
  }, [requests, statusFilter]);

  const countsByStatus = useMemo(() => {
    return requests.reduce<Record<string, number>>(
      (accumulator, request) => {
        accumulator[request.status] = (accumulator[request.status] || 0) + 1;
        return accumulator;
      },
      { all: requests.length },
    );
  }, [requests]);

  const statuses = ["all", "pending", "accepted", "countered", "declined", "expired"];

  return (
    <div className="space-y-8">
      <div className={sectionClass}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,160,133,0.22)] bg-[rgba(22,160,133,0.08)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#7fe7d2]">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Trade Queue
            </div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Review proposals and keep the exchange moving</h2>
            <p className="mt-2 text-sm text-[rgba(189,216,233,0.76)] md:text-base">
              This is the Grox-style request center, now hooked into your live accept, decline, and counter backend routes.
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-[rgba(22,160,133,0.22)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[rgba(22,160,133,0.08)] disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      <div className={`${panelClass} p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-1">
            {(["received", "sent"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={cn(
                  "rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.18em] transition",
                  tab === value ? "bg-[rgba(22,160,133,0.16)] text-[#7fe7d2]" : "text-[rgba(189,216,233,0.62)]",
                )}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition",
                  statusFilter === status
                    ? "border-[rgba(22,160,133,0.28)] bg-[rgba(22,160,133,0.12)] text-[#7fe7d2]"
                    : "border-[rgba(255,255,255,0.08)] text-[rgba(189,216,233,0.62)]",
                )}
              >
                {status} ({countsByStatus[status] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className={`${panelClass} p-10 text-center`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.04)]">
              <Send className="h-7 w-7 text-[rgba(189,216,233,0.45)]" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-white">No requests in this view</h3>
            <p className="mt-2 text-sm text-[rgba(189,216,233,0.68)]">
              Switch tabs or filters to review another part of your exchange pipeline.
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const otherParty = tab === "received" ? getUserName(request.from, "Sender") : getUserName(request.to, "Receiver");

            return (
              <div
                key={request._id}
                className="rounded-[30px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(15,20,46,0.96),rgba(10,14,39,0.92))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.18)]"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[rgba(189,216,233,0.45)]">
                        {tab === "received" ? "Incoming request" : "Sent request"}
                      </div>
                      <h3 className="mt-2 text-2xl font-black text-white">{otherParty}</h3>
                      <p className="mt-2 text-sm text-[rgba(189,216,233,0.74)]">
                        {request.offeredSkill} for {request.requestedSkill}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-[rgba(189,216,233,0.72)]">
                      <div className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1">
                        {request.proposedDuration} mins
                      </div>
                      <div className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1">
                        {request.proposedCredits} credits
                      </div>
                      <div className="rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1">
                        {formatRelativeDate(request.createdAt)}
                      </div>
                    </div>

                    {request.counterOffer && (
                      <div className="rounded-3xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.08)] p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200">Counter offer</div>
                        <div className="mt-2 text-sm text-white">
                          {request.counterOffer.credits ? `${request.counterOffer.credits} credits` : "Credits unchanged"}
                          {" • "}
                          {request.counterOffer.duration ? `${request.counterOffer.duration} mins` : "Duration unchanged"}
                        </div>
                        {request.counterOffer.message && (
                          <p className="mt-2 text-sm text-[rgba(255,245,205,0.86)]">{request.counterOffer.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 xl:items-end">
                    <div className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${getRequestStatusTone(request.status)}`}>
                      {request.status}
                    </div>

                    {tab === "received" && request.status === "pending" && (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => onAccept(request._id)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#16A085,#12796d)] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(22,160,133,0.22)] transition hover:opacity-95"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            setCounterDraft({
                              id: request._id,
                              credits: String(request.proposedCredits),
                              duration: String(request.proposedDuration),
                              message: request.counterOffer?.message || "",
                            })
                          }
                          className="rounded-2xl border border-[rgba(245,158,11,0.24)] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-200 transition hover:bg-[rgba(245,158,11,0.08)]"
                        >
                          Counter
                        </button>
                        <button
                          onClick={() => onDecline(request._id)}
                          className="rounded-2xl border border-[rgba(244,63,94,0.24)] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-rose-200 transition hover:bg-[rgba(244,63,94,0.08)]"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {counterDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(1,4,18,0.82)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-[rgba(245,158,11,0.22)] bg-[linear-gradient(180deg,rgba(15,20,46,0.98),rgba(10,14,39,0.97))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200">Counter offer</div>
                <h3 className="mt-2 text-2xl font-black text-white">Adjust the proposal before sending it back</h3>
              </div>
              <button
                onClick={() => setCounterDraft(null)}
                className="rounded-xl border border-[rgba(255,255,255,0.08)] p-2 text-[rgba(189,216,233,0.7)] transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[rgba(189,216,233,0.5)]">
                  Credits
                </label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={counterDraft.credits}
                  onChange={(event) => setCounterDraft((current) => (current ? { ...current, credits: event.target.value } : current))}
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[rgba(189,216,233,0.5)]">
                  Duration
                </label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  className={inputClass}
                  value={counterDraft.duration}
                  onChange={(event) => setCounterDraft((current) => (current ? { ...current, duration: event.target.value } : current))}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[rgba(189,216,233,0.5)]">
                Message
              </label>
              <textarea
                rows={4}
                className={inputClass}
                value={counterDraft.message}
                onChange={(event) => setCounterDraft((current) => (current ? { ...current, message: event.target.value } : current))}
                placeholder="Add a short explanation for the counter."
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setCounterDraft(null)}
                className="rounded-2xl border border-[rgba(255,255,255,0.08)] px-5 py-3 text-sm font-bold text-white transition hover:border-[rgba(245,158,11,0.22)]"
              >
                Cancel
              </button>
              <button
                onClick={onCounter}
                disabled={saving}
                className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#241400] transition hover:opacity-95 disabled:opacity-60"
              >
                {saving ? "Sending..." : "Send Counter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
