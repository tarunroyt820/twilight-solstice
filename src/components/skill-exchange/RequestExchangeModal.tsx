import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { createTradeRequest } from "@/services/skillExchangeApi";
import { inputClass } from "./shared";

export function RequestExchangeModal({
  open,
  targetUserId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  targetUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState("");
  const [proposedDuration, setProposedDuration] = useState(60);
  const [proposedCredits, setProposedCredits] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await createTradeRequest({
        to: targetUserId,
        offeredSkill,
        requestedSkill,
        proposedDuration,
        proposedCredits,
        message,
      });
      toast.success("Exchange request sent.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-[rgba(22,160,133,0.35)] bg-[#0A0E27] p-6">
        <h3 className="text-xl font-bold text-white">Request Exchange</h3>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input className={inputClass} placeholder="Skill you offer" value={offeredSkill} onChange={(e) => setOfferedSkill(e.target.value)} required />
          <input className={inputClass} placeholder="Skill you want" value={requestedSkill} onChange={(e) => setRequestedSkill(e.target.value)} required />
          <input className={inputClass} type="number" min={15} value={proposedDuration} onChange={(e) => setProposedDuration(Number(e.target.value))} required />
          <input className={inputClass} type="number" min={0} value={proposedCredits} onChange={(e) => setProposedCredits(Number(e.target.value))} required />
          <textarea className={inputClass} placeholder="Message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Request"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
