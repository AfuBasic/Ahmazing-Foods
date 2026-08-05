/**
 * Partners & Investors page — gated investor pitch.
 * NOT in the main nav. Linked from footer only.
 * noindex — should not appear in search results.
 */

import { useState } from "react";

const BLOCKED_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "icloud.com", "aol.com", "live.com", "msn.com", "ymail.com", "protonmail.com",
];

export default function PartnersPage() {
  const [name,    setName]    = useState("");
  const [company, setCompany] = useState("");
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [emailErr, setEmailErr] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    if (BLOCKED_DOMAINS.includes(domain)) {
      setEmailErr("Please use a company email address, not a personal Gmail/Yahoo/Outlook/iCloud account.");
      return;
    }
    setEmailErr("");
    const lines = [
      "Hi, I'm interested in partnering with / investing in AHmazing Foods.",
      `Name: ${name}`,
      `Company: ${company}`,
      `Email: ${email}`,
      "",
      message,
    ];
    window.open(`https://wa.me/2348105506052?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* noindex meta — injected at render time */}
      {/* Note: for a production build, add <meta name="robots" content="noindex, nofollow"> via Helmet or the HTML template */}

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-foreground text-background pt-16 pb-20 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary block mb-4">
            Partnership &amp; Investment
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight">
            Building Nigeria's Next<br />Home-Cooked Food Brand
          </h1>
          <p className="text-xl text-background/80 max-w-2xl mx-auto leading-relaxed">
            AHmazing Foods started as a home kitchen in Agungi, Lekki. We've since built a full platform — daily meals,
            event catering, a wellness drinks line, and more — on real demand from a category that's still wide open.
            We're now raising capital to take this model beyond Lagos.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* ── Market stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {[
            {
              num: "#1",
              label: "Lagos has the worst traffic of any city measured worldwide — a 68.3-minute average one-way commute",
              source: "Numbeo Traffic Index, 2026",
            },
            {
              num: "2.21 hrs",
              label: "Lost to traffic every single day by the average Lagos commuter — roughly 30 hours a week",
              source: "Danne Institute for Research",
            },
            {
              num: "28% CAGR",
              label: "Nigeria's online food & grocery delivery market — fastest-growing in Middle East & Africa, $0.6B → $5.64B by 2034",
              source: "Deep Market Insights, 2026",
            },
          ].map((s) => (
            <div key={s.num} className="bg-card border border-border rounded-2xl p-6 text-center">
              <span className="font-display text-3xl font-black text-foreground block mb-2">{s.num}</span>
              <span className="text-sm text-muted-foreground leading-snug block mb-3">{s.label}</span>
              <span className="text-xs text-muted-foreground/60 font-mono">{s.source}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          A city this time-poor, in a market growing this fast, is exactly where a trusted home-cooked food brand should be scaling —
          not just surviving. We've already proven the model works in Lagos: real menu depth, real repeat customers,
          and an operation built to hold quality as it grows, not lose it.
        </p>

        {/* ── Funding ask ──────────────────────────────────────── */}
        <div className="bg-muted/50 border border-border rounded-2xl p-8 text-center mb-14">
          <h2 className="font-display font-black text-2xl mb-2">What We're Raising</h2>
          <p className="font-display text-5xl font-black text-primary mb-5">$500,000 – $1,000,000</p>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm">
            We're keeping this range open deliberately — the right structure depends on the right partner. Funds would go toward
            expanding our kitchen and delivery capacity, bringing the AHmazing model to new cities, and building the systems
            that let us maintain quality as we grow. We're happy to walk through specifics in conversation.
          </p>
        </div>

        {/* ── Contact form ─────────────────────────────────────── */}
        <div className="max-w-lg mx-auto">
          <h2 className="font-display font-black text-2xl mb-2">Let's Talk</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            We're looking for serious, vetted conversations — investors, partners, or organisations genuinely interested
            in Nigeria's home-food category.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-6 leading-relaxed">
            <strong>Please reach out from a company email address, not a personal Gmail/Yahoo/Outlook account.</strong>{" "}
            This helps us have the right conversation with the right people from the start.
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { id: "name",    label: "Full Name",              type: "text",  val: name,    set: setName },
              { id: "company", label: "Company / Organisation", type: "text",  val: company, set: setCompany },
            ].map(({ id, label, type, val, set }) => (
              <div key={id}>
                <label htmlFor={id} className="text-xs font-bold uppercase tracking-wide text-foreground block mb-1.5">
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  required
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            ))}

            <div>
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-foreground block mb-1.5">
                Company Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                placeholder="you@yourcompany.com"
                onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                className={[
                  "w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40",
                  emailErr ? "border-destructive" : "border-border",
                ].join(" ")}
              />
              {emailErr && <p className="text-destructive text-xs mt-1">{emailErr}</p>}
            </div>

            <div>
              <label htmlFor="message" className="text-xs font-bold uppercase tracking-wide text-foreground block mb-1.5">
                A little about your interest
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0F9E0F" }}
            >
              Start the Conversation →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
