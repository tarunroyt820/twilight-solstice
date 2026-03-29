import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-xl rounded-[2rem] border border-[rgba(22,160,133,0.20)] bg-[rgba(20,37,62,0.75)] p-10 text-center shadow-[0_40px_120px_-20px_rgba(0,0,0,0.40)]">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--color-teal)" }}>
          Navigation Error
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tighter text-white">
          Page Not Found
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          The page you are looking for is not available right now.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-[#16A085] px-8 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#168777]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
