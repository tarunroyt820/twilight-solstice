import { CheckCircle, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedElement } from "@/components/ui/animated-element";
const plans = [
    {
        name: "Free",
        price: "£0",
        period: "forever",
        description: "Perfect for exploring your career options.",
        features: ["AI Career Chat (20 msgs/mo)", "Basic Career Path View", "Skill Exchange Browse", "Community Access"],
        cta: "Get Started Free",
        highlight: false,
        icon: Zap,
    },
    {
        name: "Pro",
        price: "£9",
        period: "per month",
        description: "For professionals serious about their growth.",
        features: ["Unlimited AI Career Chat", "Full Career Path Generation", "Skill Gap Analysis", "CV Upload & AI Parsing", "Priority Skill Matching", "Advanced Analytics"],
        cta: "Start Pro Trial",
        highlight: true,
        icon: Sparkles,
    },
    {
        name: "Teams",
        price: "£29",
        period: "per month",
        description: "For organisations upskilling their workforce.",
        features: ["Everything in Pro", "Up to 10 Team Members", "Team Analytics Dashboard", "Custom Career Templates", "Dedicated Support"],
        cta: "Contact Sales",
        highlight: false,
        icon: CheckCircle,
    },
];
export function PricingSection() {
    const navigate = useNavigate();
    return (
        <section id="pricing" className="w-full py-24 section-primary">
            <div className="container mx-auto max-w-6xl px-4 md:px-12">
                <AnimatedElement animation="slide-up" className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(22,160,133,0.12)] border border-[rgba(22,160,133,0.25)] text-[#16A085] text-sm font-black uppercase tracking-widest">
                        <Sparkles className="h-4 w-4" />
                        Simple Pricing
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                        Invest in Your <span className="text-teal-gradient">Future</span>
                    </h2>
                    <p className="text-[#BDD8E9] text-lg max-w-2xl mx-auto">
                        No hidden fees. Cancel anytime. Start free, upgrade when you're ready.
                    </p>
                </AnimatedElement>
                <div className="grid gap-8 md:grid-cols-3">
                    {plans.map((plan, i) => (
                        <AnimatedElement key={plan.name} animation="scale" delay={i * 0.1}>
                            <div className={`relative rounded-[2.5rem] p-8 flex flex-col h-full transition-all duration-300 ${plan.highlight
                                ? 'bg-gradient-to-b from-[rgba(22,160,133,0.2)] to-[rgba(20,37,62,0.8)] border-2 border-[rgba(22,160,133,0.5)] shadow-[0_0_40px_rgba(22,160,133,0.2)] scale-105'
                                : 'bg-[rgba(20,37,62,0.6)] border border-[rgba(22,160,133,0.15)] hover:border-[rgba(22,160,133,0.35)] hover:translate-y-[-4px]'
                            }`}>
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-[#16A085] text-white text-xs font-black uppercase tracking-widest shadow-lg">
                                        Most Popular
                                    </div>
                                )}
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-[rgba(22,160,133,0.15)] flex items-center justify-center">
                                            <plan.icon className="h-6 w-6 text-[#16A085]" />
                                        </div>
                                        <h3 className="text-xl font-black text-white">{plan.name}</h3>
                                    </div>
                                    <div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-5xl font-black text-white">{plan.price}</span>
                                            <span className="text-[#BDD8E9] font-medium mb-2">/{plan.period}</span>
                                        </div>
                                        <p className="text-[#BDD8E9] text-sm mt-2">{plan.description}</p>
                                    </div>
                                    <ul className="space-y-3">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-3 text-sm text-[#BDD8E9]">
                                                <CheckCircle className="h-4 w-4 text-[#16A085] shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    onClick={() => navigate("/signup")}
                                    className={`mt-8 w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 ${plan.highlight
                                        ? 'bg-[#16A085] text-white hover:bg-[#168777] glow-teal shadow-lg'
                                        : 'border border-[rgba(22,160,133,0.4)] text-white hover:bg-[rgba(22,160,133,0.15)]'
                                    }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        </AnimatedElement>
                    ))}
                </div>
            </div>
        </section>
    );
}
