import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { updateProfile } from "@/services/profileApi";
import { toast } from "sonner";
import { GraduationCap, Briefcase, Target, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
const steps = [
    { id: 1, title: "What's your current role?", icon: Briefcase },
    { id: 2, title: "What's your experience level?", icon: GraduationCap },
    { id: 3, title: "What's your career goal?", icon: Target },
];
export function OnboardingFlow() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        jobTitle: "",
        experienceLevel: "beginner",
        careerGoal: "",
    });
    const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
    const back = () => setStep((s) => Math.max(s - 1, 0));
    const finish = async () => {
        setSaving(true);
        try {
            await updateProfile(data as any);
            toast.success("Profile setup complete! Welcome aboard 🚀");
            navigate("/dashboard/overview");
        } catch {
            toast.error("Failed to save. Redirecting anyway...");
            navigate("/dashboard/overview");
        } finally {
            setSaving(false);
        }
    };
    const levels = ["beginner", "intermediate", "senior"];
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-xl space-y-8">
                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black text-muted-foreground uppercase tracking-widest">
                        <span>Step {step + 1} of {steps.length}</span>
                        <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="bg-card/60 backdrop-blur-xl rounded-[2.5rem] border border-border/40 p-10 space-y-8"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                {(() => { const Icon = steps[step].icon; return <Icon className="h-7 w-7 text-primary" />; })()}
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-foreground">{steps[step].title}</h2>
                        </div>
                        {step === 0 && (
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Frontend Developer, Student, Data Analyst..."
                                value={data.jobTitle}
                                onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                                className="w-full h-14 rounded-2xl bg-background border border-border/40 px-5 text-foreground font-semibold text-base focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        )}
                        {step === 1 && (
                            <div className="grid gap-3">
                                {levels.map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setData({ ...data, experienceLevel: lvl })}
                                        className={`flex items-center justify-between h-14 rounded-2xl px-5 border font-bold capitalize transition-all ${data.experienceLevel === lvl ? 'border-primary bg-primary/10 text-primary' : 'border-border/40 text-muted-foreground hover:border-primary/30'}`}
                                    >
                                        {lvl}
                                        {data.experienceLevel === lvl && <CheckCircle className="h-5 w-5" />}
                                    </button>
                                ))}
                            </div>
                        )}
                        {step === 2 && (
                            <textarea
                                autoFocus
                                rows={4}
                                placeholder="e.g. Become a Senior Full-Stack Engineer at a tech startup..."
                                value={data.careerGoal}
                                onChange={(e) => setData({ ...data, careerGoal: e.target.value })}
                                className="w-full rounded-2xl bg-background border border-border/40 px-5 py-4 text-foreground font-semibold text-base focus:outline-none focus:border-primary/50 transition-colors resize-none"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
                <div className="flex gap-4">
                    {step > 0 && (
                        <button
                            onClick={back}
                            className="flex-1 h-14 rounded-2xl border border-border/40 text-muted-foreground font-black uppercase tracking-widest hover:bg-muted/20 transition-all flex items-center justify-center gap-2"
                        >
                            <ChevronLeft className="h-5 w-5" /> Back
                        </button>
                    )}
                    {step < steps.length - 1 ? (
                        <button
                            onClick={next}
                            className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:bg-[#168777] transition-all flex items-center justify-center gap-2"
                        >
                            Next <ChevronRight className="h-5 w-5" />
                        </button>
                    ) : (
                        <button
                            onClick={finish}
                            disabled={saving}
                            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? "Saving..." : "Launch My Journey 🚀"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
