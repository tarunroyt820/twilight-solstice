import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { Logo } from "@/components/common/Logo";
import { requestPasswordReset } from "@/services/authApi";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await requestPasswordReset(email);
      toast.success(response.message);
      navigate("/login", { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Unable to request password reset.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-xl rounded-[2rem] border border-[rgba(22,160,133,0.20)] bg-[rgba(20,37,62,0.75)] p-10 text-center shadow-[0_40px_120px_-20px_rgba(0,0,0,0.40)]">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--color-teal)" }}>
          Password Recovery
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tighter text-white">
          Forgot Password
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Enter your email and we will send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <InputField
            id="forgot-email"
            label="EMAIL"
            type="email"
            placeholder="name@sector.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 items-center justify-center rounded-2xl bg-[#16A085] px-8 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#168777]"
          >
            {isLoading ? "SENDING..." : "SEND RESET LINK"}
          </Button>
        </form>

        <Link
          to="/login"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-transparent px-8 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/5"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
