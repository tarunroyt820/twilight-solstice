import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0E27] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[rgba(22,160,133,0.25)] bg-[rgba(20,37,62,0.5)] p-8 md:p-12">
        <h1 className="text-4xl font-black">Skill Exchange Terms</h1>
        <p className="mt-4 text-sm leading-7 text-[rgba(189,216,233,0.85)]">
          By joining Skill Exchange, you agree to communicate respectfully, honor scheduled sessions, and provide
          honest reviews. Credits and trust scores are adjusted based on exchange outcomes, no-show reports, disputes,
          and completed sessions.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-6 text-sm text-[rgba(189,216,233,0.85)]">
          <li>Do not share harmful, illegal, or abusive content.</li>
          <li>Cancel in advance when you cannot attend a session.</li>
          <li>No-show reports must include clear reason and proof.</li>
          <li>Disputes should include factual details and evidence only.</li>
          <li>Reviews must reflect real exchange experience.</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/signup"><Button>Back To Sign Up</Button></Link>
          <Link to="/dashboard/skills"><Button variant="outline">Go To Skill Exchange</Button></Link>
        </div>
      </div>
    </div>
  );
}
