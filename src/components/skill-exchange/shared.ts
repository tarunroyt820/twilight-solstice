export const sectionClass =
  "rounded-3xl border border-[rgba(22,160,133,0.25)] bg-[rgba(20,37,62,0.5)] p-6 md:p-8";

export const inputClass =
  "w-full rounded-xl border border-[rgba(22,160,133,0.35)] bg-[rgba(10,14,39,0.8)] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[rgba(22,160,133,0.4)]";

export const skillOptions = [
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "System Design",
  "UI/UX",
  "Data Science",
  "Cloud",
  "DevOps",
  "Communication",
];

export const dayOptions = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const parseTrustFromReasons = (reasons: string[] = []): string => {
  const trustReason = reasons.find((reason) => reason.toLowerCase().includes("trust baseline"));
  if (!trustReason) return "N/A";
  const match = trustReason.match(/(\d+)/);
  return match ? `${match[1]}` : "N/A";
};
