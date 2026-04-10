import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { getSkillProfile, ProficiencyLevel, SkillItem, upsertSkillProfile } from "@/services/skillExchangeApi";
import { getCurrentUserIdFromToken } from "@/utils/authToken";
import { inputClass, sectionClass, skillOptions } from "./shared";

export function SkillProfileSetupPage() {
  const [offered, setOffered] = useState<string[]>([]);
  const [wanted, setWanted] = useState<string[]>([]);
  const [offeredLevel, setOfferedLevel] = useState<ProficiencyLevel>("intermediate");
  const [wantedLevel, setWantedLevel] = useState<ProficiencyLevel>("intermediate");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const userId = getCurrentUserIdFromToken();
      if (!userId) return;
      try {
        const profile = await getSkillProfile(userId);
        setOffered(profile.skillsOffered.map((item) => item.name));
        setWanted(profile.skillsWanted.map((item) => item.name));
        setBio(profile.bio || "");
        setHourlyRate(profile.hourlyRate || 0);
      } catch {
        setOffered([]);
        setWanted([]);
      }
    };
    load();
  }, []);

  const toSkillItems = (items: string[], level: ProficiencyLevel): SkillItem[] =>
    items.map((name) => ({ name, category: "General", proficiencyLevel: level }));

  const save = async () => {
    setSaving(true);
    try {
      await upsertSkillProfile({
        skillsOffered: toSkillItems(offered.slice(0, 5), offeredLevel),
        skillsWanted: toSkillItems(wanted.slice(0, 5), wantedLevel),
        bio,
        hourlyRate,
        isActive: true,
      });
      toast.success("Skill profile saved.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white">Skill Profile</h2>
        <p className="text-sm text-[rgba(189,216,233,0.75)]">Choose up to 5 offered and 5 wanted skills.</p>
      </div>
      <div className={sectionClass}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[rgba(189,216,233,0.8)]">Offered Skills</label>
            <select className={`${inputClass} min-h-[160px]`} multiple value={offered} onChange={(e) => setOffered(Array.from(e.target.selectedOptions).map((opt) => opt.value).slice(0, 5))}>
              {skillOptions.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
            </select>
            <select className={inputClass} value={offeredLevel} onChange={(e) => setOfferedLevel(e.target.value as ProficiencyLevel)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[rgba(189,216,233,0.8)]">Wanted Skills</label>
            <select className={`${inputClass} min-h-[160px]`} multiple value={wanted} onChange={(e) => setWanted(Array.from(e.target.selectedOptions).map((opt) => opt.value).slice(0, 5))}>
              {skillOptions.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
            </select>
            <select className={inputClass} value={wantedLevel} onChange={(e) => setWantedLevel(e.target.value as ProficiencyLevel)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <textarea className={inputClass} rows={4} placeholder="Write your skill exchange bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <input className={inputClass} type="number" min={0} placeholder="Hourly rate in credits" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} />
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
        </div>
      </div>
    </div>
  );
}
