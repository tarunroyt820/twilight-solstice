import { Button } from "@/components/common/Button";

export function PricingSection() {
  const plans = [
    { name: "Starter", price: "Free", desc: "Explore the core dashboard and profile tools." },
    { name: "Pro", price: "$19", desc: "Unlock deeper recommendations and career insights." },
    { name: "Teams", price: "$49", desc: "Support mentors, teams, and collaborative growth paths." },
  ];

  return (
    <section className="px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--color-teal)" }}>
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tighter text-white">Choose Your Nextaro Plan</h2>
          <p className="mt-4 text-base" style={{ color: "var(--text-secondary)" }}>
            Simple plans while the product is still evolving.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-[2rem] border border-[rgba(22,160,133,0.20)] bg-[rgba(20,37,62,0.65)] p-8">
              <h3 className="text-2xl font-black text-white">{plan.name}</h3>
              <p className="mt-3 text-3xl font-black" style={{ color: "var(--color-teal)" }}>{plan.price}</p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{plan.desc}</p>
              <Button className="mt-6 h-11 rounded-2xl bg-[#16A085] px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-[#168777]">
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
