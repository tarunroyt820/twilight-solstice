import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { askAI } from "@/services/aiApi";
import { toast } from "sonner";
import { Brain, Sparkles, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/common/Button";
const TARGET_ROLES = ["Senior Frontend Engineer", "Full-Stack Developer", "Machine Learning Engineer", "DevOps Engineer", "Product Manager"];
export function SkillGapShell() {
    const [targetRole, setTargetRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(false);
    const runAnalysis = async () => {
        const role = customRole || targetRole;
        if (!role) { toast.error("Please select or enter a target role"); return; }
        setLoading(true);
        try {
            const result = await askAI(`Perform a detailed skill gap analysis for me if I want to become a ${role}. Based on my current profile skills, tell me: 1) Skills I already have that are relevant, 2) Skills I am missing, 3) A prioritised learning plan with estimated timeframes. Format clearly using markdown.`);
            setAnalysis(result.answer);
        } catch {
            toast.error("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black tracking-tight">Skill Gap Analysis</h2>
                <p className="text-muted-foreground mt-1 text-lg">Find out exactly what skills you need for your dream role.</p>
            </div>
            <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm">
                <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-primary" />
                        Choose Your Target Role
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="flex flex-wrap gap-3">
                        {TARGET_ROLES.map((role) => (
                            <button
                                key={role}
                                onClick={() => { setTargetRole(role); setCustomRole(""); }}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${targetRole === role && !customRole ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Or type a custom role..."
                            value={customRole}
                            onChange={(e) => { setCustomRole(e.target.value); setTargetRole(""); }}
                            className="flex-1 h-12 rounded-2xl bg-background border border-border/40 px-5 text-foreground font-semibold text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <Button
                            onClick={runAnalysis}
                            disabled={loading}
                            className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />Analysing...</>
                            ) : (
                                <><Sparkles className="h-4 w-4 mr-2" />Analyse</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {analysis && (
                <Card className="rounded-[2.5rem] border-primary/20 bg-card/60 backdrop-blur-sm">
                    <CardHeader className="p-8">
                        <CardTitle className="flex items-center gap-3 text-primary">
                            <Brain className="h-6 w-6" />
                            Your Skill Gap Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="prose-custom text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                            {analysis}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
