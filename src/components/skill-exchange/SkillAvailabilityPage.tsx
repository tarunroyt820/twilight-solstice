import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { AvailabilitySlot, getAvailability, saveAvailability } from "@/services/skillExchangeApi";
import { getCurrentUserIdFromToken } from "@/utils/authToken";
import { dayOptions, inputClass, sectionClass } from "./shared";

export function SkillAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [day, setDay] = useState("monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const userId = getCurrentUserIdFromToken();
      if (!userId) return;
      try {
        const data = await getAvailability(userId);
        setSlots(data.weeklySlots || []);
      } catch {
        setSlots([]);
      }
    };
    load();
  }, []);

  const addSlot = () => {
    const candidate: AvailabilitySlot = { day, startTime, endTime };
    const hasOverlap = slots.some(
      (slot) => slot.day === candidate.day && !(candidate.endTime <= slot.startTime || candidate.startTime >= slot.endTime),
    );
    if (hasOverlap) {
      toast.error("Slot overlaps with an existing slot.");
      return;
    }
    setSlots((prev) => [...prev, candidate]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveAvailability({ weeklySlots: slots, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      toast.success("Availability saved.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white">Availability</h2>
        <p className="text-sm text-[rgba(189,216,233,0.75)]">Set your weekly exchange time slots.</p>
      </div>
      <div className={sectionClass}>
        <div className="grid gap-3 md:grid-cols-4">
          <select className={inputClass} value={day} onChange={(e) => setDay(e.target.value)}>
            {dayOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input className={inputClass} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input className={inputClass} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <Button onClick={addSlot}>Add Slot</Button>
        </div>
        <div className="mt-5 space-y-2">
          {slots.length === 0 && <p className="text-sm text-[rgba(189,216,233,0.7)]">No slots saved yet.</p>}
          {slots.map((slot, index) => (
            <div key={`${slot.day}-${slot.startTime}-${index}`} className="flex items-center justify-between rounded-xl border border-[rgba(22,160,133,0.25)] p-3">
              <span className="text-sm text-white">{slot.day} - {slot.startTime} to {slot.endTime}</span>
              <Button variant="outline" onClick={() => setSlots((prev) => prev.filter((_, idx) => idx !== index))}>Delete</Button>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Availability"}</Button>
        </div>
      </div>
    </div>
  );
}
