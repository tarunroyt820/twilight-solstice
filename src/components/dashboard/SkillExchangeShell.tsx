import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";

const cards = [
  { title: "Setup Skills", desc: "Add offered and wanted skills.", path: "/profile/skills" },
  { title: "Set Availability", desc: "Add weekly time slots.", path: "/profile/availability" },
  { title: "Find Matches", desc: "Discover compatible users.", path: "/matches" },
  { title: "Manage Requests", desc: "Accept, decline, or counter offers.", path: "/requests" },
  { title: "Active Exchanges", desc: "Confirm sessions, file disputes, and review.", path: "/exchanges" },
  { title: "Notifications", desc: "Read updates and alerts.", path: "/notifications" },
];

export function SkillExchangeShell() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-black text-white">Skill Exchange</h2>
        <p className="text-sm text-[rgba(189,216,233,0.8)]">Complete setup, discover partners, and manage exchanges end-to-end.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-3xl border border-[rgba(22,160,133,0.25)] bg-[rgba(20,37,62,0.5)] p-5">
            <h3 className="text-lg font-bold text-white">{card.title}</h3>
            <p className="mt-1 text-sm text-[rgba(189,216,233,0.75)]">{card.desc}</p>
            <div className="mt-4">
              <Link to={card.path}>
                <Button className="w-full">Open</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
