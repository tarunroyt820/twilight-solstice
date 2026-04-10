import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import {
  Agreement,
  confirmSession,
  createSession,
  fileDispute,
  getAgreements,
  getSessions,
  reportNoShow,
  Session,
  submitReview,
} from "@/services/skillExchangeApi";
import { getCurrentUserIdFromToken } from "@/utils/authToken";
import { inputClass, sectionClass } from "./shared";

const getUserId = (value: string | { _id: string; fullName?: string }): string =>
  typeof value === "string" ? value : value._id;

const getUserName = (value: string | { _id: string; fullName?: string }, fallback = "Partner"): string =>
  typeof value === "string" ? fallback : value.fullName || fallback;

export function SkillExchangesPage() {
  const currentUserId = getCurrentUserIdFromToken();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [sessionsByAgreement, setSessionsByAgreement] = useState<Record<string, Session[]>>({});
  const [sessionDraft, setSessionDraft] = useState<Record<string, string>>({});
  const [disputeAgreementId, setDisputeAgreementId] = useState<string | null>(null);
  const [noShowSessionId, setNoShowSessionId] = useState<string | null>(null);
  const [reviewAgreementId, setReviewAgreementId] = useState<string | null>(null);
  const [reviewTargetId, setReviewTargetId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [disputeReason, setDisputeReason] = useState<"noshow" | "quality" | "other">("noshow");
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [noShowReason, setNoShowReason] = useState("");
  const [noShowProof, setNoShowProof] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const agreementsData = await getAgreements();
      setAgreements(agreementsData);
      const pairs = await Promise.all(agreementsData.map(async (agreement) => [agreement._id, await getSessions(agreement._id)] as const));
      setSessionsByAgreement(Object.fromEntries(pairs));
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getPartner = (agreement: Agreement) => {
    const participants = agreement.participants.map((participant) => ({
      id: getUserId(participant),
      name: getUserName(participant, "Partner"),
    }));
    return participants.find((participant) => participant.id !== currentUserId) || participants[0];
  };

  const createNewSession = async (agreementId: string) => {
    const dateTime = sessionDraft[agreementId];
    if (!dateTime) return toast.error("Pick a session date and time.");
    try {
      await createSession(agreementId, new Date(dateTime).toISOString());
      toast.success("Session created.");
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const confirm = async (sessionId: string) => {
    try {
      await confirmSession(sessionId);
      toast.success("Session confirmation submitted.");
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const submitNoShow = async () => {
    if (!noShowSessionId) return;
    try {
      await reportNoShow(noShowSessionId, noShowReason, noShowProof);
      toast.success("No-show reported.");
      setNoShowSessionId(null);
      setNoShowReason("");
      setNoShowProof("");
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const submitDisputeModal = async () => {
    if (!disputeAgreementId) return;
    try {
      await fileDispute({
        agreementId: disputeAgreementId,
        reason: disputeReason,
        description: disputeDescription,
        evidence: disputeEvidence ? [disputeEvidence] : [],
      });
      toast.success("Dispute filed.");
      setDisputeAgreementId(null);
      setDisputeDescription("");
      setDisputeEvidence("");
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const submitReviewModal = async () => {
    if (!reviewAgreementId || !reviewTargetId) return toast.error("Select a review target.");
    const tags = Array.from(document.querySelectorAll<HTMLInputElement>("input[data-review-tag]:checked")).map((el) => el.value);
    const mergedComment = [reviewComment.trim(), tags.length ? `Tags: ${tags.join(", ")}` : ""].filter(Boolean).join(" | ");
    try {
      await submitReview({
        agreementId: reviewAgreementId,
        revieweeId: reviewTargetId,
        rating: reviewRating,
        comment: mergedComment,
      });
      toast.success("Review submitted.");
      setReviewAgreementId(null);
      setReviewComment("");
      setReviewTargetId("");
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const visibleAgreements = useMemo(
    () => agreements.filter((agreement) => agreement.status === "active" || agreement.status === "completed"),
    [agreements],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Exchanges Dashboard</h2>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      <div className="space-y-4">
        {visibleAgreements.map((agreement) => {
          const partner = getPartner(agreement);
          const sessions = sessionsByAgreement[agreement._id] || [];
          const latest = sessions[sessions.length - 1];
          return (
            <div key={agreement._id} className={sectionClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-white">{agreement.skill}</p>
                  <p className="text-sm text-[rgba(189,216,233,0.75)]">Partner: {partner?.name || "Unknown"} | Status: {agreement.status}</p>
                  <p className="text-sm text-[rgba(189,216,233,0.75)]">Scheduled: {latest ? new Date(latest.scheduledAt).toLocaleString() : "Not scheduled"}</p>
                </div>
                {partner && (
                  <Button variant="outline" onClick={() => navigate(`/profile/${partner.id}`)}>View Profile</Button>
                )}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input type="datetime-local" className={inputClass} value={sessionDraft[agreement._id] || ""} onChange={(e) => setSessionDraft((prev) => ({ ...prev, [agreement._id]: e.target.value }))} />
                <Button onClick={() => createNewSession(agreement._id)}>Create Session</Button>
                <Button variant="outline" disabled={!latest || latest.status !== "scheduled"} onClick={() => latest && confirm(latest._id)}>Confirm Session</Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" disabled={!latest} onClick={() => latest && setNoShowSessionId(latest._id)}>Report No-Show</Button>
                <Button variant="outline" onClick={() => setDisputeAgreementId(agreement._id)}>File Dispute</Button>
                <Button variant="outline" onClick={() => {
                  setReviewAgreementId(agreement._id);
                  setReviewTargetId(partner?.id || "");
                }}>Submit Review</Button>
              </div>
            </div>
          );
        })}
        {visibleAgreements.length === 0 && <div className={sectionClass}>No agreements yet.</div>}
      </div>

      {noShowSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0A0E27] p-6">
            <h3 className="text-xl font-bold text-white">Report No-Show</h3>
            <input className={`${inputClass} mt-3`} placeholder="Reason" value={noShowReason} onChange={(e) => setNoShowReason(e.target.value)} />
            <textarea className={`${inputClass} mt-3`} placeholder="Proof URL or evidence text" value={noShowProof} onChange={(e) => setNoShowProof(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNoShowSessionId(null)}>Cancel</Button>
              <Button onClick={submitNoShow}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      {disputeAgreementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0A0E27] p-6">
            <h3 className="text-xl font-bold text-white">File Dispute</h3>
            <select className={`${inputClass} mt-3`} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value as "noshow" | "quality" | "other")}>
              <option value="noshow">No-show</option>
              <option value="quality">Quality</option>
              <option value="other">Other</option>
            </select>
            <textarea className={`${inputClass} mt-3`} placeholder="Evidence text or URL" value={disputeEvidence} onChange={(e) => setDisputeEvidence(e.target.value)} />
            <textarea className={`${inputClass} mt-3`} placeholder="Description" value={disputeDescription} onChange={(e) => setDisputeDescription(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDisputeAgreementId(null)}>Cancel</Button>
              <Button onClick={submitDisputeModal}>Submit Dispute</Button>
            </div>
          </div>
        </div>
      )}

      {reviewAgreementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0A0E27] p-6">
            <h3 className="text-xl font-bold text-white">Submit Review</h3>
            <label className="mt-3 block text-sm text-[rgba(189,216,233,0.8)]">Rating (1-5)</label>
            <input className={inputClass} type="number" min={1} max={5} value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} />
            <textarea className={`${inputClass} mt-3`} placeholder="Comment" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[rgba(189,216,233,0.85)]">
              {["helpful", "punctual", "knowledgeable", "clear-communicator"].map((tag) => (
                <label key={tag} className="flex items-center gap-2">
                  <input data-review-tag type="checkbox" value={tag} />
                  {tag}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewAgreementId(null)}>Cancel</Button>
              <Button onClick={submitReviewModal}>Submit Review</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
