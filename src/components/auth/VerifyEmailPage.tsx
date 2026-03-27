import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { resendVerification, verifyEmail } from "@/services/authApi";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { toast } from "sonner";

export function VerifyEmailPage() {
  const location = useLocation() as { state?: { verificationEmail?: string } };
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Enter the OTP sent to your email.");

  useEffect(() => {
    const verificationEmail = location.state?.verificationEmail;
    if (typeof verificationEmail === "string" && verificationEmail) {
      setEmail(verificationEmail);
    }
  }, [location.state]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      setStatus("error");
      setMessage("Email and OTP are required.");
      return;
    }

    try {
      setStatus("loading");
      const response = await verifyEmail(email, otp);
      setStatus("success");
      setMessage(response.message);
      toast.success(response.message);
    } catch (error: any) {
      setStatus("error");
      const errorMessage = error.response?.data?.message || error.message || "Unable to verify email.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email first so we know where to send the OTP.");
      return;
    }

    try {
      const response = await resendVerification(email);
      toast.success(response.message);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Unable to resend verification email.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-xl rounded-[2rem] border border-[rgba(22,160,133,0.20)] bg-[rgba(20,37,62,0.75)] p-10 text-center shadow-[0_40px_120px_-20px_rgba(0,0,0,0.40)]">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--color-teal)" }}>
          Email Verification
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tighter text-white">
          {status === "success" ? "Email Verified" : "Verify Your Email"}
        </h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-4 text-left">
          <InputField
            id="verify-email"
            label="EMAIL"
            type="email"
            placeholder="name@sector.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            id="verify-otp"
            label="OTP"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full h-12 items-center justify-center rounded-2xl bg-[#16A085] px-8 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#168777]"
          >
            {status === "loading" ? "VERIFYING..." : "VERIFY EMAIL"}
          </Button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          className="mt-5 text-sm font-bold underline underline-offset-4 decoration-2"
          style={{ color: "var(--color-teal)" }}
        >
          Resend OTP
        </button>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#16A085] px-8 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#168777]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
