import { Link } from "wouter";
import { ArrowRight, Leaf } from "lucide-react";
import { WatermarkedImage } from "@/components/ui/watermarked-image";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;

const BRAND_RED = "#C81212";
const BRAND_GREEN = "#0F9E0F";

export default function Home() {
  return (
    <div className="flex flex-col w-full">

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="bg-[#FCF1EF] relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left copy */}
          <div className="flex-1 space-y-8 text-center lg:text-left max-w-xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C81212] bg-[#C81212]/10 px-3 py-1 rounded-full">
              Made to order · Lagos
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold font-display text-foreground leading-[1.1]">
              Real food cooked in a{" "}
              <em className="not-italic text-primary">real kitchen</em>,
              ready when you need it.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              No storefront, no shortcuts. Every pot is started only once it's booked.
              Choose your soup, stew or breakfast combo, pick your delivery slot, and we get cooking.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/book"
                className="w-full sm:w-auto text-center rounded-full h-14 px-8 text-lg font-bold text-white shadow-xl transition-opacity hover:opacity-90 inline-flex items-center justify-center"
                style={{ background: BRAND_GREEN }}
              >
                Book Your Meal
              </Link>
              <Link
                href="/soups"
                className="w-full sm:w-auto text-center rounded-full h-14 px-8 text-lg font-bold border-2 border-border text-foreground hover:bg-muted transition-colors inline-flex items-center justify-center"
              >
                See What's Available
              </Link>
            </div>
          </div>

          {/* Right — hero image + ticket */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 border-8 border-white aspect-[4/3]">
              <WatermarkedImage
                src={asset("food-egusi-top.jpg")}
                alt="Rich Nigerian soup with assorted meat, ready to eat"
              />
            </div>
            {/* Order ticket overlay */}
            <div className="absolute -bottom-6 -left-4 md:-left-10 bg-white rounded-2xl shadow-2xl border border-border p-4 w-64 z-10">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Order Ticket</span>
                <span>#0148</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">Onugbu Soup — 3L</span>
                  <span className="font-bold">₦18,000</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>+ Chicken</span>
                  <span>₦4,700</span>
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-2 border-t border-dashed border-border font-bold">
                <span>Total</span>
                <span className="text-primary">₦22,700</span>
              </div>
              <div className="mt-3 text-center">
                <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Booked ahead · No rush fee
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden aspect-[2/3]">
              <WatermarkedImage src={asset("food-egusi-hands.jpg")} alt="Hands holding a bowl of rich Nigerian soup" imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <WatermarkedImage src={asset("food-akara-pap.jpg")} alt="Akara served with pap" imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <WatermarkedImage src={asset("food-hero-soup.jpg")} alt="A rich pot of Nigerian soup ready to serve" imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ── MINDFUL MEALS DIFFERENTIATOR BANNER ─────────────────────── */}
      <section className="py-24 bg-foreground text-background overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 max-w-lg">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 opacity-60" />
              <span className="text-background/60 text-xs font-bold uppercase tracking-wider">What sets us apart</span>
            </div>
            <h2 className="text-4xl font-bold font-display leading-tight">
              Nigerian food can work for your health goals too
            </h2>
            <p className="text-background/70 leading-relaxed">
              We have curated specific meals from our menu — real dishes, cooked the same way —
              chosen because they genuinely support healthy eating.
              No supplements, no meal replacements, no removing everything you love.
            </p>
            <Link
              href="/healthy-meals"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 font-bold text-foreground shadow-lg hover:opacity-90 transition-opacity"
              style={{ background: "#FCF1EF" }}
            >
              See Healthy Meals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {[
                { label: "No MSG", sub: "Seasoned with crayfish and dried fish" },
                { label: "No preservatives", sub: "Cooked fresh, delivered same day" },
                { label: "Made to order", sub: "Your pot starts when you book" },
                { label: "Real ingredients", sub: "Nothing artificial, nothing processed" },
              ].map(({ label, sub }) => (
                <div key={label} className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="font-bold text-sm text-background mb-1">{label}</p>
                  <p className="text-xs text-background/50 leading-relaxed">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S ON ──────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What's on right now</span>
            <h2 className="text-4xl font-bold font-display mt-3 mb-4">Our menu grows with what we can actually deliver</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We only offer what we can cook properly — categories come online as capacity allows,
              so what you see here is what's truly bookable today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Soups",
                href: "/soups",
                img: "soups/egusi-soup.jpg",
                desc: "Freshly cooked Nigerian soups — sized by the litre or by the full cooler.",
              },
              {
                num: "02",
                title: "Stews",
                href: "/stews",
                img: "stews/peppered-chicken-stew.jpg",
                desc: "Classic Nigerian stews cooked fresh in small batches for families or events.",
              },
              {
                num: "03",
                title: "Breakfast",
                href: "/breakfast",
                img: "platters/breakfast-platter.jpg",
                desc: "Generous combo plates — akara, pap, yam, egg stew and more. One pack, one sitting.",
              },
              {
                num: "04",
                title: "Products",
                href: "/products",
                img: "products/zobo.jpg",
                desc: "Cold-pressed drinks, wellness shots and immune boosters — brewed fresh in small batches.",
              },
              {
                num: "05",
                title: "Trays & Platters",
                href: "/trays-platters",
                img: "trays/classic-tray.jpg",
                desc: "Gift trays, party platters and small chops packs — for celebrations, gifting and gatherings.",
              },
              {
                num: "06",
                title: "Catering",
                href: "/catering",
                img: "food-catering.jpg",
                desc: "Weddings, birthdays, corporate events — tell us your guest count and we'll build a menu.",
              },
            ].map(({ num, title, href, img, desc }) => (
              <Link key={href} href={href} className="group block">
                <div className="rounded-2xl overflow-hidden border border-border bg-card hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={asset(img)}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl font-display font-bold text-foreground/10">{num}</span>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="py-20 bg-[#FCF1EF] border-t border-b border-dashed border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How booking works</span>
            <h2 className="text-4xl font-bold font-display mt-3">Three steps, nothing complicated</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                n: "1",
                title: "Pick your meals & slot",
                body: "Add up to 5 dishes to your cart, choose sizes and proteins, then pick your delivery date and time.",
              },
              {
                n: "2",
                title: "Pay to confirm",
                body: "Pay before we start cooking — bank transfer or mobile money. We'll send account details once your slot is in. Same-day bookings have a tiered rush fee, shown upfront.",
              },
              {
                n: "3",
                title: "We cook, you're notified",
                body: "Once payment clears, your slot goes onto our kitchen calendar. We'll email and WhatsApp you the moment we start cooking.",
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-5">
                <div
                  className="w-12 h-12 shrink-0 rounded-full text-white font-display font-bold text-xl flex items-center justify-center"
                  style={{ background: BRAND_RED }}
                >
                  {n}
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg mb-2">{title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold font-display mb-2">Ready to book?</h2>
            <p className="text-muted-foreground">Pick a delivery date and we'll take it from there.</p>
          </div>
          <Link
            href="/book"
            className="shrink-0 rounded-full px-10 py-4 text-lg font-bold text-white shadow-xl hover:opacity-90 transition-opacity inline-flex items-center"
            style={{ background: BRAND_GREEN }}
          >
            Book Your Meal
          </Link>
        </div>
      </section>

      {/* ── PARTNERS & INVESTORS STRIP ──────────────────────────────────── */}
      <section style={{ background: "#1B1208" }} className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">

            {/* Left — copy */}
            <div className="flex-1 max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full border"
                style={{ color: BRAND_GREEN, borderColor: `${BRAND_GREEN}40` }}>
                Partnership & Investment
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white leading-tight mb-4">
                We're scaling a food brand<br className="hidden md:block" /> built on real, proven demand.
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                Every pot leaves this kitchen because someone already paid for it. No inventory waste, no guesswork —
                just a growing customer base and a kitchen that needs to grow with it.
                We're raising to expand capacity, logistics, and our product line. If you back food businesses in Nigeria, we'd like to talk.
              </p>
            </div>

            {/* Right — stats + CTA */}
            <div className="flex flex-col items-start lg:items-end gap-6 shrink-0">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: "100%", label: "Orders pre-paid before cooking" },
                  { stat: "₦0",   label: "Inventory waste by design" },
                  { stat: "10+",  label: "Menu categories, growing" },
                  { stat: "Lagos",label: "Starting — then Nigeria-wide" },
                ].map(({ stat, label }) => (
                  <div key={label} className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                    <p className="text-2xl font-display font-black text-white">{stat}</p>
                    <p className="text-[11px] text-white/50 mt-1 leading-snug">{label}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/partners"
                className="rounded-full px-8 py-3.5 font-bold text-sm text-foreground hover:opacity-90 transition-opacity whitespace-nowrap inline-flex items-center gap-2"
                style={{ background: BRAND_GREEN, color: "#fff" }}
              >
                Explore Investment Opportunity
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
