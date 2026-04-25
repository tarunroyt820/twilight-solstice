import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, RefreshCw, Search, Send } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { getCurrentUserIdFromToken } from "@/utils/authToken";
import {
  AgreementMessageItem,
  fetchAgreementMessages,
  fetchInboxSummaries,
  MessageInboxSummary,
  sendAgreementMessage,
} from "@/services/agreementMessageApi";
import { formatRelativeDate, inputClass, panelClass, sectionClass } from "./shared";

const getInitials = (name?: string) =>
  (name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function SkillMessagesPage() {
  const currentUserId = getCurrentUserIdFromToken();
  const [inbox, setInbox] = useState<MessageInboxSummary[]>([]);
  const [messages, setMessages] = useState<AgreementMessageItem[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);

  const loadInbox = useCallback(async (preferredAgreementId?: string) => {
    setLoadingInbox(true);
    try {
      const response = await fetchInboxSummaries();
      const nextInbox = Array.isArray(response.data?.inbox) ? response.data.inbox : [];
      setInbox(nextInbox);

      if (preferredAgreementId && nextInbox.some((item) => item.agreementId === preferredAgreementId)) {
        setSelectedAgreementId(preferredAgreementId);
      } else if (!selectedAgreementId && nextInbox[0]?.agreementId) {
        setSelectedAgreementId(nextInbox[0].agreementId);
      } else if (selectedAgreementId && !nextInbox.some((item) => item.agreementId === selectedAgreementId)) {
        setSelectedAgreementId(nextInbox[0]?.agreementId || "");
      }
    } catch (error) {
      toast.error((error as Error).message || "Failed to load inbox.");
    } finally {
      setLoadingInbox(false);
    }
  }, [selectedAgreementId]);

  const loadThread = useCallback(async (agreementId: string) => {
    if (!agreementId) {
      setMessages([]);
      return;
    }

    setLoadingThread(true);
    try {
      const response = await fetchAgreementMessages(agreementId);
      setMessages(Array.isArray(response.data?.messages) ? response.data.messages : []);
      setInbox((current) =>
        current.map((item) => (item.agreementId === agreementId ? { ...item, unreadCount: 0 } : item)),
      );
    } catch (error) {
      toast.error((error as Error).message || "Failed to load messages.");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (selectedAgreementId) {
      loadThread(selectedAgreementId);
    }
  }, [loadThread, selectedAgreementId]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadInbox(selectedAgreementId);
      if (selectedAgreementId) {
        loadThread(selectedAgreementId);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [loadInbox, loadThread, selectedAgreementId]);

  const selectedThread = useMemo(
    () => inbox.find((item) => item.agreementId === selectedAgreementId) || null,
    [inbox, selectedAgreementId],
  );

  const filteredInbox = useMemo(() => {
    return inbox.filter((item) => {
      const partnerName = item.partner?.fullName || "";
      const skill = item.skill || "";
      const preview = item.latestMessage?.message || "";
      const query = search.trim().toLowerCase();

      if (!query) return true;
      return (
        partnerName.toLowerCase().includes(query) ||
        skill.toLowerCase().includes(query) ||
        preview.toLowerCase().includes(query)
      );
    });
  }, [inbox, search]);

  const sendMessage = async () => {
    const message = draft.trim();
    if (!selectedAgreementId || !message || sending) return;

    setSending(true);
    try {
      await sendAgreementMessage(selectedAgreementId, message);
      setDraft("");
      await Promise.all([loadThread(selectedAgreementId), loadInbox(selectedAgreementId)]);
    } catch (error) {
      toast.error((error as Error).message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={sectionClass}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,160,133,0.22)] bg-[rgba(22,160,133,0.08)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#7fe7d2]">
              <MessageCircle className="h-3.5 w-3.5" />
              Exchange Inbox
            </div>
            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Message your active exchange partners from one inbox</h2>
            <p className="mt-2 text-sm text-[rgba(189,216,233,0.76)] md:text-base">
              This page uses live agreement-thread summaries, unread counts, and real thread messages from the backend.
            </p>
          </div>

          <button
            onClick={() => {
              loadInbox(selectedAgreementId);
              if (selectedAgreementId) loadThread(selectedAgreementId);
            }}
            disabled={loadingInbox || loadingThread}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-[rgba(22,160,133,0.22)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[rgba(22,160,133,0.08)] disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", (loadingInbox || loadingThread) && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className={`${panelClass} flex min-h-[640px] flex-col p-5`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(189,216,233,0.4)]" />
            <input
              className={cn(inputClass, "pl-11")}
              placeholder="Search chats"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
            {filteredInbox.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[rgba(255,255,255,0.1)] px-4 py-10 text-center text-sm text-[rgba(189,216,233,0.62)]">
                No message threads found.
              </div>
            ) : (
              filteredInbox.map((thread) => {
                const isActive = thread.agreementId === selectedAgreementId;
                const senderName = thread.latestMessage?.senderId?.fullName || (thread.latestMessage?.systemMessage ? "System" : thread.partner?.fullName || "Partner");

                return (
                  <button
                    key={thread.agreementId}
                    onClick={() => setSelectedAgreementId(thread.agreementId)}
                    className={cn(
                      "w-full rounded-3xl border p-4 text-left transition",
                      isActive
                        ? "border-[rgba(22,160,133,0.24)] bg-[rgba(22,160,133,0.08)]"
                        : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(22,160,133,0.14)]",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#16A085,#12796d)] text-sm font-black text-white">
                        {getInitials(thread.partner?.fullName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-white">{thread.partner?.fullName || "Partner"}</div>
                            <div className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-[rgba(189,216,233,0.45)]">
                              {thread.skill}
                            </div>
                          </div>
                          <div className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-[rgba(189,216,233,0.45)]">
                            {formatRelativeDate(thread.updatedAt)}
                          </div>
                        </div>

                        <div className="mt-3 truncate text-sm text-[rgba(189,216,233,0.72)]">
                          <span className="font-semibold text-[rgba(189,216,233,0.88)]">{senderName}: </span>
                          {thread.latestMessage?.message || "No messages yet."}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[rgba(189,216,233,0.45)]">
                        {thread.agreementStatus}
                      </div>
                      {thread.unreadCount > 0 && (
                        <div className="rounded-full bg-[#16A085] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                          {thread.unreadCount} new
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={`${panelClass} flex min-h-[640px] flex-col p-5`}>
          {!selectedThread ? (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-[rgba(189,216,233,0.62)]">
              Select a conversation to open the exchange thread.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#16A085,#12796d)] text-sm font-black text-white">
                    {getInitials(selectedThread.partner?.fullName)}
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{selectedThread.partner?.fullName || "Partner"}</div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[rgba(189,216,233,0.45)]">
                      {selectedThread.skill} • {selectedThread.agreementStatus}
                    </div>
                  </div>
                </div>

                <div className="text-xs uppercase tracking-[0.18em] text-[rgba(189,216,233,0.45)]">
                  {selectedThread.unreadCount > 0 ? `${selectedThread.unreadCount} unread` : "Up to date"}
                </div>
              </div>

              <div className="mt-5 flex-1 space-y-4 overflow-y-auto rounded-3xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
                {loadingThread ? (
                  <div className="flex h-full items-center justify-center text-sm text-[rgba(189,216,233,0.62)]">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[rgba(189,216,233,0.62)]">
                    No messages yet. Start the conversation here.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = Boolean(currentUserId && message.senderId?._id === currentUserId);
                    const senderName = message.senderId?.fullName || message.senderId?.name || "User";

                    return (
                      <div
                        key={message._id}
                        className={cn("flex", isMine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[78%] rounded-3xl px-4 py-3 text-sm shadow-[0_10px_24px_rgba(0,0,0,0.15)]",
                            message.systemMessage
                              ? "mx-auto bg-[rgba(255,255,255,0.05)] text-[rgba(189,216,233,0.7)]"
                              : isMine
                                ? "bg-[linear-gradient(135deg,#16A085,#12796d)] text-white"
                                : "bg-[rgba(255,255,255,0.06)] text-white",
                          )}
                        >
                          {!message.systemMessage && (
                            <div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                              {isMine ? "You" : senderName}
                            </div>
                          )}
                          <div className="leading-6">{message.message}</div>
                          {message.createdAt && (
                            <div className={cn("mt-2 text-[10px] uppercase tracking-[0.18em]", message.systemMessage ? "text-[rgba(189,216,233,0.5)]" : "text-white/65")}>
                              {formatRelativeDate(message.createdAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-5 flex gap-3">
                <textarea
                  rows={2}
                  className={inputClass}
                  placeholder="Type your message..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !draft.trim()}
                  className="inline-flex h-12 items-center gap-2 self-end rounded-2xl bg-[linear-gradient(135deg,#16A085,#12796d)] px-5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(22,160,133,0.22)] transition hover:opacity-95 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
