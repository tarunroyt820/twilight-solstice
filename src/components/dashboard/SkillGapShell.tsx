import { useState } from "react";
import { Brain, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { askAI } from "@/services/aiApi";

const TARGET_ROLES = [
  "Senior Frontend Engineer",
  "Full-Stack Developer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
];

export function SkillGapShell() {
  const [targetRole, setTargetRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    const role = customRole || targetRole;

    if (!role) {
      toast.error("Please select or enter a target role");
      return;
    }

    setLoading(true);

    try {
      const result = await askAI(
        `Perform a detailed skill gap analysis for me if I want to become a ${role}. Based on my current profile skills, tell me: 1) Skills I already have that are relevant, 2) Skills I am missing, 3) A prioritised learning plan with estimated timeframes. Format clearly using markdown.`,
      );

      setAnalysis(result.answer);
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in space-y-8 fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Skill Gap Analysis</h2>
        <p className="mt-1 text-lg text-muted-foreground">
          Find out exactly what skills you need for your dream role.
        </p>
      </div>

      <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader className="p-8">
          <CardTitle className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            Choose Your Target Role
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-8 pt-0">
          <div className="flex flex-wrap gap-3">
            {TARGET_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setTargetRole(role);
                  setCustomRole("");
                }}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  targetRole === role && !customRole
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                }`}
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
              onChange={(event) => {
                setCustomRole(event.target.value);
                setTargetRole("");
              }}
              className="h-12 flex-1 rounded-2xl border border-border/40 bg-background px-5 text-sm font-semibold text-foreground transition-colors focus:border-primary/50 focus:outline-none"
            />

            <Button
              onClick={runAnalysis}
              disabled={loading}
              className="h-12 rounded-2xl px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analysing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyse
                </>
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
            <div className="prose-custom whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {analysis}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
