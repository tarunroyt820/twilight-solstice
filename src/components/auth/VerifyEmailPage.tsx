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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verificationEmail = location.state?.verificationEmail;
    if (verificationEmail) {
      setEmail(verificationEmail);
    }
  }, [location.state]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await verifyEmail(email, otp);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to verify email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await resendVerification(email);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-primary)" }}>
      <div className="w-full max-w-xl rounded-[2rem] border border-[rgba(22,160,133,0.20)] bg-[rgba(20,37,62,0.75)] p-10 text-center shadow-[0_40px_120px_-20px_rgba(0,0,0,0.40)]">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">Verify Your Email</h1>
        <form onSubmit={handleVerify} className="mt-8 space-y-4 text-left">
          <InputField id="verify-email" label="EMAIL" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <InputField id="verify-otp" label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-2xl bg-[#16A085] text-xs font-black uppercase tracking-widest text-white hover:bg-[#168777]">
            {isLoading ? "VERIFYING..." : "VERIFY EMAIL"}
          </Button>
        </form>
        <button type="button" onClick={handleResend} className="mt-5 text-sm font-bold underline underline-offset-4" style={{ color: "var(--color-teal)" }}>
          Resend OTP
        </button>
        <Link to="/login" className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-transparent px-8 text-xs font-black uppercase tracking-widest text-white">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
