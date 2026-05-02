import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { RequestExchangeModal } from "@/components/skill-exchange/RequestExchangeModal";
import { inputClass, sectionClass } from "@/components/skill-exchange/shared";
import { DiscoveryProfile, fetchTrendingSkills, searchProfiles } from "@/services/discoveryApi";
import { getCurrentUserIdFromToken } from "@/utils/authToken";

type SortBy = "match" | "trust" | "rate";

const PAGE_SIZE = 10;

export default function FindPeople() {
  const currentUserId = useMemo(() => getCurrentUserIdFromToken(), []);
  const requestSequenceRef = useRef(0);

  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [personName, setPersonName] = useState("");
  const [skill, setSkill] = useState("");
  const [minTrustScore, setMinTrustScore] = useState("");
  const [maxHourlyRate, setMaxHourlyRate] = useState("");
  const [availabilityOverlap, setAvailabilityOverlap] = useState(false);
  const [availableThisWeek, setAvailableThisWeek] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("match");
  const [trendingSkills, setTrendingSkills] = useState<string[]>([]);

  const [requestTargetUserId, setRequestTargetUserId] = useState<string | null>(null);

  const fetchProfiles = async (targetPage = page) => {
    const seq = ++requestSequenceRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await searchProfiles({
        page: targetPage,
        limit: PAGE_SIZE,
        personName: personName.trim() || undefined,
        skillOffered: skill.trim() || undefined,
        minTrustScore: minTrustScore ? Number(minTrustScore) : undefined,
        maxHourlyRate: maxHourlyRate ? Number(maxHourlyRate) : undefined,
        availabilityOverlap,
        availableThisWeek,
        sortBy,
      });

      if (seq !== requestSequenceRef.current) {
        return;
      }

      setProfiles(Array.isArray(response.data.results) ? response.data.results : []);
      setTotalPages(Math.max(Number(response.data.totalPages || 1), 1));
    } catch (err: any) {
      if (seq !== requestSequenceRef.current) {
        return;
      }

      const message = err?.response?.data?.message || "Failed to load profiles";
      setError(message);
      setProfiles([]);
      setTotalPages(1);
    } finally {
      if (seq === requestSequenceRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfiles(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, availabilityOverlap, availableThisWeek]);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const response = await fetchTrendingSkills();
        const items = Array.isArray(response.data?.trending) ? response.data.trending : [];
        setTrendingSkills(items.map((item) => String(item?._id || "")).filter(Boolean));
      } catch (_error) {
        setTrendingSkills([]);
      }
    };

    loadTrending();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchProfiles(1);
    }, 400);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, personName]);

  const runSearch = () => {
    setPage(1);
    fetchProfiles(1);
  };

  const openRequestModal = (profile: DiscoveryProfile) => {
    const targetUserId = profile?.userId?._id;
    if (!targetUserId) return;

    if (currentUserId && targetUserId === currentUserId) {
      toast.error("You cannot send a request to yourself.");
      return;
    }

    if (Number(profile?.userId?.activeExchangeCount || 0) >= 3) {
      toast.error("This user has reached the maximum active exchanges.");
      return;
    }

    setRequestTargetUserId(targetUserId);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Find People</h1>
        <p className="text-sm text-[rgba(189,216,233,0.75)]">Discover and request skill exchange partners.</p>
      </div>

      <div className={`${sectionClass} space-y-4`}>
        {trendingSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-[rgba(189,216,233,0.85)]">
            <span className="font-semibold text-white">Trending:</span>
            {trendingSkills.map((trend) => (
              <button
                key={trend}
                type="button"
                className="rounded-full border border-[rgba(22,160,133,0.4)] bg-[rgba(22,160,133,0.15)] px-3 py-1 text-xs text-[rgba(189,216,233,0.95)] transition hover:bg-[rgba(22,160,133,0.25)]"
                onClick={() => {
                  setSkill(trend);
                  setPage(1);
                }}
              >
                {trend}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            className={inputClass}
            placeholder="Search by name..."
            value={personName}
            onChange={(event) => setPersonName(event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Search offered skill..."
            value={skill}
            onChange={(event) => setSkill(event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Min trust score"
            type="number"
            min={0}
            value={minTrustScore}
            onChange={(event) => setMinTrustScore(event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Max hourly rate"
            type="number"
            min={0}
            value={maxHourlyRate}
            onChange={(event) => setMaxHourlyRate(event.target.value)}
          />
          <select className={inputClass} value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)}>
            <option value="match">Sort by Smart Match</option>
            <option value="trust">Sort by Trust</option>
            <option value="rate">Sort by Rate</option>
          </select>
          <Button onClick={runSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-[rgba(189,216,233,0.85)]">
          <input
            type="checkbox"
            checked={availabilityOverlap}
            onChange={(event) => setAvailabilityOverlap(event.target.checked)}
          />
          Only show users with availability overlap
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-[rgba(189,216,233,0.85)]">
          <input
            type="checkbox"
            checked={availableThisWeek}
            onChange={(event) => setAvailableThisWeek(event.target.checked)}
          />
          Available This Week
        </label>
      </div>

      {loading && <div className={sectionClass}>Loading...</div>}
      {!loading && error && <div className={`${sectionClass} text-red-300`}>{error}</div>}
      {!loading && !error && profiles.length === 0 && <div className={sectionClass}>No results found</div>}

      {!loading && !error && profiles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile, index) => {
            const userId = profile?.userId?._id || `unknown-${index}`;
            const fullName = profile?.userId?.fullName || "Unknown User";
            const trustScore = Number(profile?.userId?.trustScore || 0);
            const hourlyRate = Number(profile?.hourlyRate || 0);
            const matchScore = Number(profile?.matchScore || 0);
            const completionRate = Number(profile?.completionRate ?? 0);
            const responseRate = Number(profile?.responseRate ?? 0);
            const badges = Array.isArray(profile?.reliabilityBadges) ? profile.reliabilityBadges : [];
            const achievements = Array.isArray(profile?.achievements) ? profile.achievements : [];

            return (
              <div key={userId} className={`${sectionClass} flex flex-col gap-3`}>
                <h3 className="text-xl font-bold text-white">{fullName}</h3>
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-[rgba(22,160,133,0.4)] bg-[rgba(22,160,133,0.2)] px-2 py-1 text-[11px] font-semibold text-[rgba(210,241,235,0.95)]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                {achievements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((achievement) => (
                      <span
                        key={achievement}
                        className="rounded-full border border-[rgba(168,85,247,0.4)] bg-[rgba(168,85,247,0.16)] px-2 py-1 text-[11px] font-semibold text-[rgba(243,232,255,0.95)]"
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-[rgba(189,216,233,0.75)]">
                  Offered: {(profile.skillsOffered || []).map((item) => item?.name).filter(Boolean).join(", ") || "N/A"}
                </p>
                <p className="text-sm text-[rgba(189,216,233,0.75)]">
                  Wanted: {(profile.skillsWanted || []).map((item) => item?.name).filter(Boolean).join(", ") || "N/A"}
                </p>
                <p className="text-sm text-[rgba(189,216,233,0.75)]">
                  Completion Rate: {(completionRate * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-[rgba(189,216,233,0.75)]">
                  Response: {(responseRate * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-[rgba(189,216,233,0.75)]">Trust Score: {trustScore}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-[rgba(22,160,133,0.12)] p-2 text-white">Trust: {trustScore}</div>
                  <div className="rounded-lg bg-[rgba(22,160,133,0.12)] p-2 text-white">Rate: ${hourlyRate}/hr</div>
                  <div className="rounded-lg bg-[rgba(22,160,133,0.12)] p-2 text-white">Match: {matchScore}%</div>
                </div>
                <Button onClick={() => openRequestModal(profile)}>Request Exchange</Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
          Previous
        </Button>
        <span className="text-sm text-[rgba(189,216,233,0.85)]">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" disabled={page >= totalPages || loading} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}>
          Next
        </Button>
      </div>

      <RequestExchangeModal
        open={Boolean(requestTargetUserId)}
        targetUserId={requestTargetUserId || ""}
        onClose={() => setRequestTargetUserId(null)}
        onSuccess={() => fetchProfiles(page)}
      />
    </div>
  );
}

