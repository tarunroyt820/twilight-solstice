import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Target,
    Brain,
    BookOpen,
    Users,
    LineChart,
    TrendingUp,
    ChevronRight,
    Sparkles,
    Zap,
    Award,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getOverviewData } from "@/services/overviewApi";
import { DashboardOverviewData, OverviewActivityType } from "@/types/overview";

const recommendationStyles: Record<string, { color: string; bg: string }> = {
    "system-design": { color: "text-cyan-500", bg: "bg-cyan-500/10" },
    testing: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
    cloud: { color: "text-orange-500", bg: "bg-orange-500/10" },
    communication: { color: "text-purple-500", bg: "bg-purple-500/10" },
    "problem-solving": { color: "text-blue-500", bg: "bg-blue-500/10" },
    default: { color: "text-primary", bg: "bg-primary/10" },
};

const activityIcons: Record<OverviewActivityType, typeof Target> = {
    learning: BookOpen,
    mentor: Users,
    career: Target,
    achievement: Award,
};

const formatActivityTime = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));
    if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
};

const getTrajectoryLabel = (status: DashboardOverviewData["trajectory"]["status"]) => {
    if (status === "on_track") return "ON TRACK";
    if (status === "attention") return "NEEDS ATTENTION";
    return "AT RISK";
};

export function OverviewShell() {
    const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        getOverviewData()
            .then((data) => {
                if (mounted) {
                    setOverview(data);
                }
            })
            .catch((err) => {
                if (mounted) {
                    setError(err?.response?.data?.message || err.message || "Unable to load overview data.");
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (error) {
        return (
            <Card className="rounded-[2.5rem] border border-[rgba(22,160,133,0.20)] bg-card/60 p-8">
                <p className="text-lg font-bold text-destructive">{error}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Make sure you are logged in and the dashboard API is running.
                </p>
            </Card>
        );
    }

    if (!overview) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-72 rounded-2xl bg-muted/40" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-40 rounded-[2.5rem] bg-muted/30" />
                    ))}
                </div>
                <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
                    <div className="h-[420px] rounded-[2.5rem] bg-muted/30 xl:col-span-2" />
                    <div className="h-[420px] rounded-[2.5rem] bg-muted/30" />
                </div>
                <div className="h-[520px] rounded-[3rem] bg-muted/30" />
            </div>
        );
    }

    const statCards = [
        { title: "Profile Completion", value: `${overview.overviewStats.profileCompletion}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
        { title: "Skills Mastered", value: overview.overviewStats.skillsMastered.toString(), icon: Brain, color: "text-accent", bg: "bg-accent/10" },
        { title: "Conversations", value: overview.overviewStats.conversationCount.toString(), icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Recent Activity", value: overview.overviewStats.activityCount.toString(), icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
    ];

    const activityFeed = overview.activityFeed;
    const recommendationItems = overview.recommendations;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="mb-3 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                        Live user data
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight">Performance Overview</h2>
                    <p className="text-muted-foreground mt-1 text-lg">Your professional growth at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl h-12 px-6 font-semibold border-border/40 hover:bg-muted/50">
                        Generate Report
                    </Button>
                    <Button className="rounded-2xl h-12 px-6 font-semibold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Analysis
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <Card key={i} className="rounded-[2.5rem] border border-[rgba(22,160,133,0.20)] bg-card/60 backdrop-blur-sm shadow-xl shadow-black/5 hover:border-[rgba(22,160,133,0.50)] hover:shadow-[0_0_25px_rgba(22,160,133,0.12)] hover:translate-y-[-4px] transition-all duration-300 cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tight text-foreground">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
                <Card className="rounded-[2.5rem] border border-[rgba(22,160,133,0.20)] bg-card/60 backdrop-blur-sm shadow-xl shadow-black/5 hover:border-[rgba(22,160,133,0.40)] hover:shadow-[0_0_30px_rgba(22,160,133,0.10)] lg:col-span-2 overflow-hidden transition-all duration-300">
                    <CardHeader className="p-8">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <LineChart className="h-6 w-6 text-primary" />
                                {overview.trajectory.title}
                            </CardTitle>
                            <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                                {getTrajectoryLabel(overview.trajectory.status)}
                            </div>
                        </div>
                        <CardDescription className="text-base font-medium">{overview.trajectory.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-10">
                        <div className="relative pt-2">
                            <ProgressBar label="Profile completion" value={overview.trajectory.overallCompletion} showValue className="h-4" />
                            <div className="flex justify-between mt-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {overview.trajectory.phaseLabels.map((label, index) => (
                                    <span key={label} className={index === 1 ? "text-primary" : ""}>
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                { label: "Current Node", value: overview.trajectory.currentNode, icon: Zap },
                                { label: "Career Goal", value: overview.trajectory.careerGoal, icon: TrendingUp },
                                { label: "Sections", value: `${overview.trajectory.sectionsCompleted} / ${overview.trajectory.sectionsTotal}`, icon: Award },
                            ].map((box, i) => (
                                <div key={i} className="group rounded-3xl border border-border/40 bg-muted/20 p-6 transition-all hover:bg-muted/30">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-xl bg-background/50 text-muted-foreground group-hover:text-primary transition-colors">
                                            <box.icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            {box.label}
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-foreground">{box.value}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-sm shadow-xl shadow-black/5 lg:col-span-1 flex flex-col">
                    <CardHeader className="p-8">
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-accent" />
                            Live Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex-1">
                        {activityFeed.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-border/50 p-6 text-sm text-muted-foreground">
                                No recent activity yet.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-border/40">
                                    {activityFeed.map((activity) => {
                                        const ActivityIcon = activityIcons[activity.type];
                                        return (
                                            <div
                                                key={activity.id}
                                                className="relative flex items-start gap-5 group"
                                            >
                                                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card border border-border/50 shadow-sm group-hover:scale-110 transition-transform">
                                                    <ActivityIcon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-tighter">
                                                        {formatActivityTime(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <Button variant="ghost" className="w-full mt-10 rounded-2xl font-bold text-muted-foreground hover:bg-muted/50 group">
                                    Full Activity
                                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-[3rem] blur-3xl -z-10" />
                <Card className="rounded-[3rem] border-border/40 bg-card/80 backdrop-blur-md shadow-2xl shadow-black/5 overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-accent/20">
                                    <Brain className="h-8 w-8 text-accent" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-3xl font-black tracking-tight text-foreground">AI Recommendations</CardTitle>
                                    <CardDescription className="text-lg font-medium">Suggestions based on the user’s current profile</CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-border bg-transparent hover:bg-muted/50 transition-all">
                                Refresh Recommendations
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        {recommendationItems.length === 0 ? (
                            <div className="rounded-[2.5rem] border border-dashed border-border/50 p-8 text-sm text-muted-foreground">
                                No recommendations yet. Fill in your profile and skills to generate suggestions.
                            </div>
                        ) : (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {recommendationItems.map((skill) => {
                                    const styles = recommendationStyles[skill.category] || recommendationStyles.default;
                                    return (
                                        <div
                                            key={skill.id}
                                            className="group relative rounded-[2.5rem] border border-border/40 bg-background/50 p-8 transition-all hover:bg-background hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`p-3 rounded-2xl ${styles.bg}`}>
                                                    <Zap className={`h-6 w-6 ${styles.color}`} />
                                                </div>
                                                <span className="rounded-full bg-green-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-green-500">
                                                    {skill.demand} Demand
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black text-foreground mb-1 group-hover:text-primary transition-colors">{skill.name}</h4>
                                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-none">{skill.level}</p>

                                            <div className="mt-8 space-y-4">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-xs font-black uppercase text-muted-foreground">Progress</span>
                                                    <span className="text-sm font-black text-foreground">{skill.progress}%</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                                                        style={{ width: `${skill.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <Button className="mt-8 w-full rounded-[1.25rem] h-14 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/10 hover:shadow-primary/20 group-hover:scale-[1.02] transition-all">
                                                {skill.progress === 0 ? "Start Learning" : "Resume Learning"}
                                                <Sparkles className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
