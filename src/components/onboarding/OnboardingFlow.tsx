import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";

export function OnboardingFlow() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-2xl rounded-[2rem] border border-[rgba(22,160,133,0.20)] bg-[rgba(20,37,62,0.75)] p-10 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.40)]">
        <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--color-teal)" }}>
          Onboarding
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tighter text-white">
          Welcome to Nextaro
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Your onboarding flow is temporarily simplified while we restore the rest of the workspace.
        </p>
        <Button
          className="mt-8 h-12 rounded-2xl bg-[#16A085] px-8 text-xs font-black uppercase tracking-widest text-white hover:bg-[#168777]"
          onClick={() => navigate("/dashboard/overview")}
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
}
