
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/common/Button";
import { Compass, Target, Map, Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/common/ProgressBar";
import { useState, useEffect } from "react";
import { askAI } from "@/services/aiApi";
import { toast } from "sonner";
function SkeletonCard() {
    return (
        <div className="rounded-3xl border border-border/30 bg-card/40 p-6 space-y-4 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-muted/50" />
            <div className="h-5 w-3/4 rounded-lg bg-muted/50" />
            <div className="h-4 w-1/2 rounded-lg bg-muted/40" />
            <div className="h-3 w-full rounded-full bg-muted/30 mt-4" />
            <div className="h-10 w-full rounded-xl bg-muted/30 mt-4" />
        </div>
    );
}

export function CareerPathShell() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);
    const [aiResponse, setAiResponse] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const generateCareerPath = async () => {
        setAiLoading(true);
        try {
            const result = await askAI("Based on my profile, what is the most detailed and personalised career path you would recommend for me? Include specific steps, skills and timelines.");
            setAiResponse(result.answer);
        } catch {
            toast.error("AI is unavailable. Please try again later.");
        } finally {
            setAiLoading(false);
        }
    };
    const paths = [
        { name: "Frontend Developer", match: 95, status: "Current", active: true },
        { name: "Full-Stack Engineer", match: 80, status: "Recommended", active: false },
        { name: "UI/UX Designer", match: 65, status: "Alternative", active: false },
    ];
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 rounded-lg bg-muted/40 animate-pulse" />
                <div className="h-4 w-96 rounded-lg bg-muted/30 animate-pulse" />
                <div className="grid gap-6 md:grid-cols-3 mt-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Career Path Finder</h2>
                    <p className="text-muted-foreground">AI-powered career recommendations based on your skills.</p>
                </div>
                <div className="flex gap-3">
                    <Button className="gap-2">
                        <Compass className="h-4 w-4" />
                        Retake Assessment
                    </Button>
                    <Button
                        onClick={generateCareerPath}
                        disabled={aiLoading}
                        className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                        <Sparkles className="h-4 w-4" />
                        {aiLoading ? "Generating..." : "AI Generate My Path"}
                    </Button>
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {paths.map((path) => (
                    <Card key={path.name} className={`rounded-3xl border-border/50 ${path.active ? 'ring-2 ring-primary' : ''}`}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <Target className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-full">
                                    {path.status}
                                </span>
                            </div>
                            <CardTitle className="mt-4">{path.name}</CardTitle>
                            <CardDescription>{path.match}% Match with your profile</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProgressBar label="Skills Match" value={path.match} showValue />
                            <Button variant="outline" className="w-full mt-4 rounded-xl">View Details</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {aiResponse && (
                <Card className="rounded-3xl border-primary/20 bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-5 w-5" />
                            Your Personalised AI Career Path
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose-custom text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                            {aiResponse}
                        </div>
                    </CardContent>
                </Card>
            )}
            <Card className="rounded-3xl border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Map className="h-5 w-5 text-primary" />
                        Active Career Roadmap
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative border-l-2 border-primary/20 ml-4 pb-4 space-y-8">
                        {[ 
                            { title: "Foundation", status: "Completed", desc: "HTML, CSS, Basic JavaScript" },
                            { title: "Frameworks", status: "In Progress", desc: "React, Tailwind, State Management" },
                            { title: "Advanced Topics", status: "Upcoming", desc: "Testing, Performance, CI/CD" },
                        ].map((step, i) => (
                            <div key={i} className="relative pl-8">
                                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary" />
                                <h4 className="font-bold">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.desc}</p>
                                <span className="text-xs text-primary font-medium">{step.status}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
