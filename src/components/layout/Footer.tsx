import { Github, Linkedin, Twitter, Sparkles } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Roadmap", href: "#" },
    { label: "API", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="bg-[#140C30] border-t border-[rgba(22,160,133,0.20)]">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16 py-12 md:py-16 lg:py-24">
        <div className="grid gap-16 grid-cols-1 lg:grid-cols-6 items-start">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-10 w-full">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <Logo size="md" className="transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(22,160,133,0.6)]" />
                  <div className="absolute -inset-4 bg-[rgba(22,160,133,0.15)] blur-xl rounded-full opacity-40 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tighter text-white leading-none">NEXTARO</span>
                  <span className="text-[10px] font-black tracking-[0.3em] text-[#BDD8E9] uppercase ml-0.5 mt-1">Intelligence</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(22,160,133,0.1)] border border-[rgba(22,160,133,0.2)] text-white w-fit text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3" />
                V2.0 STABLE
              </div>
            </div>
            <p className="max-w-xs text-base font-medium leading-relaxed text-[#BDD8E9]">
              The neural operating system for modern career growth. Automate your mastery, exchange your skills, and master your professional destiny.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(22,160,133,0.1)] text-[#BDD8E9] transition-all hover:bg-[rgba(22,160,133,0.2)] hover:text-white hover:shadow-xl hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:col-span-4 lg:pt-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Core Platform</h3>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm font-bold text-[#BDD8E9] transition-colors hover:text-white hover:translate-x-1 inline-block">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Organization</h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm font-bold text-[#BDD8E9] transition-colors hover:text-white hover:translate-x-1 inline-block">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Developers</h3>
              <ul className="space-y-4">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm font-bold text-[#BDD8E9] transition-colors hover:text-white hover:translate-x-1 inline-block">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Compliance</h3>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm font-bold text-[#BDD8E9] transition-colors hover:text-white hover:translate-x-1 inline-block">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 md:mt-20 lg:mt-24 pt-8 md:pt-10 lg:pt-12 border-t border-[rgba(22,160,133,0.20)] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7BBDE8]">
            &copy; {new Date().getFullYear()} Nextaro Intelligence Protocol. Secure Build 8142.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-[#7BBDE8]">
            <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> ALL SYSTEMS OPERATIONAL</span>
            <span className="hover:text-white cursor-pointer transition-colors">Server Node: SG-01</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
