import { useEffect, useState } from "react";
import { fetchAdminSummary, fetchHighRiskUsers, type AdminAnalyticsSummary, type HighRiskUser } from "@/services/adminAnalyticsApi";
import { Button } from "@/components/common/Button";

const cardClass = "rounded-2xl border border-[rgba(22,160,133,0.25)] bg-[rgba(20,37,62,0.55)] p-4";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export default function AdminDashboard() {
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);
  const [highRiskUsers, setHighRiskUsers] = useState<HighRiskUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryResponse, highRiskResponse] = await Promise.all([
        fetchAdminSummary(),
        fetchHighRiskUsers(),
      ]);
      setSummary(summaryResponse.data);
      setHighRiskUsers(Array.isArray(highRiskResponse.data?.users) ? highRiskResponse.data.users : []);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load admin analytics";
      setError(message);
      setSummary(null);
      setHighRiskUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Analytics</h1>
          <p className="text-sm text-[rgba(189,216,233,0.75)]">Platform health and reliability summary.</p>
        </div>
        <Button variant="outline" onClick={loadSummary} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300/40 bg-red-900/20 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && !summary && (
        <div className={cardClass}>Loading analytics...</div>
      )}

      {!loading && !error && summary && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Total Users</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.totalUsers}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Active Users (7d)</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.activeUsers}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Total Agreements</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.totalAgreements}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Completed Agreements</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.completedAgreements}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Completion Rate</p>
            <p className="mt-2 text-2xl font-bold text-white">{formatPercent(summary.platformCompletionRate)}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Open Disputes</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.openDisputes}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Expired Requests</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.expiredRequests}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Average Quality Score</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.averageQualityScore.toFixed(2)}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Avg Completion Streak</p>
            <p className="mt-2 text-2xl font-bold text-white">{summary.averageCompletionStreak.toFixed(2)}</p>
          </div>

          <div className={cardClass}>
            <p className="text-xs uppercase tracking-wide text-[rgba(189,216,233,0.7)]">Users With Achievements</p>
            <p className="mt-2 text-2xl font-bold text-white">{formatPercent(summary.achievementPercentage)}</p>
          </div>
        </div>
      )}

      {!loading && !error && highRiskUsers.length > 0 && (
        <div className="rounded-2xl border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.08)] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">⚠ High Risk Users</h2>
              <p className="text-sm text-[rgba(189,216,233,0.75)]">Accounts flagged by quality and behavioral patterns.</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {highRiskUsers.map((user) => (
              <div key={user._id || user.fullName} className="rounded-xl border border-[rgba(245,158,11,0.25)] bg-[rgba(20,37,62,0.45)] p-4">
                <p className="text-base font-bold text-white">{user.fullName || "Unknown User"}</p>
                <p className="text-sm text-[rgba(189,216,233,0.8)]">Trust: {Number(user.trustScore || 0)}</p>
                <p className="text-sm text-[rgba(189,216,233,0.8)]">Quality: {Number(user.qualityScore || 0).toFixed(2)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(user.riskFlags || []).map((flag) => (
                    <span key={flag} className="rounded-full bg-[rgba(245,158,11,0.18)] px-2 py-1 text-[11px] font-semibold text-[rgba(255,236,196,0.95)]">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && summary?.topCompletionStreakUsers?.length ? (
        <div className="rounded-2xl border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.08)] p-5">
          <h2 className="text-xl font-bold text-white">Top Streak Holders</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summary.topCompletionStreakUsers.map((user) => (
              <div key={user._id || user.fullName} className="rounded-xl border border-[rgba(34,197,94,0.18)] bg-[rgba(20,37,62,0.45)] p-4">
                <p className="text-base font-bold text-white">{user.fullName || "Unknown User"}</p>
                <p className="text-sm text-[rgba(189,216,233,0.8)]">Completion Streak: {Number(user.completionStreak || 0)}</p>
                <p className="text-sm text-[rgba(189,216,233,0.8)]">Response Streak: {Number(user.responseStreak || 0)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(user.achievements || []).map((achievement) => (
                    <span key={achievement} className="rounded-full bg-[rgba(34,197,94,0.18)] px-2 py-1 text-[11px] font-semibold text-[rgba(220,252,231,0.95)]">
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
