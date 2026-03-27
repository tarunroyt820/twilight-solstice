import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { Logo } from "@/components/common/Logo";
import { resetPassword } from "@/services/authApi";
import { toast } from "sonner";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await resetPassword(token, password);
      toast.success(response.message);
      navigate("/login", { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Unable to reset password.";
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
          Password Reset
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tighter text-white">
          Reset Your Password
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Enter a new password to finish recovery.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <InputField
            id="new-password"
            label="NEW PASSWORD"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <InputField
            id="confirm-password"
            label="CONFIRM PASSWORD"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 items-center justify-center rounded-2xl bg-[#16A085] px-8 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#168777]"
          >
            {isLoading ? "RESETTING..." : "RESET PASSWORD"}
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
