import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { getMatches } from "@/services/skillExchangeApi";
import { inputClass, parseTrustFromReasons, sectionClass } from "./shared";

export function SkillMatchesPage() {
  const [skill, setSkill] = useState("");
  const [matches, setMatches] = useState<Awaited<ReturnType<typeof getMatches>>["matches"]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getMatches(skill);
      setMatches(result.matches || []);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black text-white">Matches</h2>
          <p className="text-sm text-[rgba(189,216,233,0.75)]">Discover compatible skill exchange partners.</p>
        </div>
        <div className="flex gap-2">
          <input className={inputClass} placeholder="Filter by skill" value={skill} onChange={(e) => setSkill(e.target.value)} />
          <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Search"}</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => (
          <div key={match._id} className={sectionClass}>
            <h3 className="text-xl font-bold text-white">{match.userId.fullName || "Unknown User"}</h3>
            <p className="mt-2 text-sm text-[rgba(189,216,233,0.75)]">Offered: {match.skillsOffered.map((s) => s.name).join(", ") || "N/A"}</p>
            <p className="text-sm text-[rgba(189,216,233,0.75)]">Wanted: {match.skillsWanted.map((s) => s.name).join(", ") || "N/A"}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-[rgba(22,160,133,0.12)] p-2 text-white">Trust: {parseTrustFromReasons(match.matchReasons)}%</div>
              <div className="rounded-lg bg-[rgba(22,160,133,0.12)] p-2 text-white">Match: {match.matchScore}%</div>
            </div>
            <div className="mt-4">
              <Link to={`/profile/${match.userId._id}`}>
                <Button className="w-full">View Profile</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      {!loading && matches.length === 0 && <div className={sectionClass}>No matches found.</div>}
    </div>
  );
}
