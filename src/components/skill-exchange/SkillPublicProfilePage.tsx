import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { hasValidToken } from "@/components/auth/ProtectedRoute";
import { getReviews, getSkillProfile, Review } from "@/services/skillExchangeApi";
import { getCurrentUserIdFromToken } from "@/utils/authToken";
import { sectionClass } from "./shared";
import { RequestExchangeModal } from "./RequestExchangeModal";

export function SkillPublicProfilePage() {
  const { userId = "" } = useParams();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getSkillProfile>> | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileData, reviewData] = await Promise.all([getSkillProfile(userId), getReviews(userId)]);
        setProfile(profileData);
        setReviews(reviewData);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  const isOwn = getCurrentUserIdFromToken() === userId;

  if (loading) return <div className={sectionClass}>Loading profile...</div>;
  if (!profile) return <div className={sectionClass}>Profile not found.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className={sectionClass}>
        <h2 className="text-3xl font-black text-white">Public Skill Profile</h2>
        <p className="mt-2 text-sm text-[rgba(189,216,233,0.75)]">{profile.bio || "No bio added."}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[rgba(189,216,233,0.8)]">Offered Skills</p>
            <p className="mt-1 text-sm text-white">{profile.skillsOffered.map((item) => item.name).join(", ") || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[rgba(189,216,233,0.8)]">Wanted Skills</p>
            <p className="mt-1 text-sm text-white">{profile.skillsWanted.map((item) => item.name).join(", ") || "N/A"}</p>
          </div>
        </div>
        {hasValidToken() && !isOwn && (
          <div className="mt-5">
            <Button onClick={() => setRequestOpen(true)}>Request Exchange</Button>
          </div>
        )}
      </div>
      <div className={sectionClass}>
        <h3 className="text-xl font-bold text-white">Reviews</h3>
        <div className="mt-3 space-y-3">
          {reviews.length === 0 && <p className="text-sm text-[rgba(189,216,233,0.75)]">No reviews yet.</p>}
          {reviews.map((review) => (
            <div key={review._id} className="rounded-xl border border-[rgba(22,160,133,0.2)] p-3">
              <p className="text-sm text-white">Rating: {review.rating}/5</p>
              <p className="mt-1 text-sm text-[rgba(189,216,233,0.8)]">{review.comment || "No comment."}</p>
            </div>
          ))}
        </div>
      </div>
      <RequestExchangeModal open={requestOpen} targetUserId={userId} onClose={() => setRequestOpen(false)} onSuccess={() => {}} />
    </div>
  );
}
