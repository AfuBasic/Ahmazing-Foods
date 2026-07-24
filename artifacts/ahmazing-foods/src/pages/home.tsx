import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;

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
              Real soup, cooked in a{" "}
              <em className="not-italic text-primary">real kitchen</em>,
              ready when you need it.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              No storefront, no shortcuts — every pot is started only once it's booked.
              Choose your soup, stew or breakfast, pick your delivery slot, and we get cooking.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <a
                href="/book"
                onClick={(e) => { e.preventDefault(); window.location.href = `${BASE}book`; }}
                className="w-full sm:w-auto text-center rounded-full h-14 px-8 text-lg font-bold text-white shadow-xl transition-opacity hover:opacity-90"
                style={{ background: BRAND_GREEN, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                Book Your Meal
              </a>
              <Link
                href="/soups"
                className="w-full sm:w-auto text-center rounded-full h-14 px-8 text-lg font-bold border-2 border-border text-foreground hover:bg-muted transition-colors"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                See What's Available
              </Link>
            </div>
          </div>

          {/* Right — hero image + ticket */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 border-8 border-white">
              <img
                src={asset("food-egusi-top.jpg")}
                alt="Rich Nigerian soup with assorted meat, ready to eat"
                className="w-full aspect-[4/3] object-cover"
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
                  <span>+ Goat Meat</span>
                  <span>₦3,000</span>
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-2 border-t border-dashed border-border font-bold">
                <span>Total</span>
                <span className="text-primary">₦21,000</span>
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
              <img src={asset("food-egusi-hands.jpg")} alt="Hands holding a bowl of rich Nigerian soup" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src={asset("food-akara-pap.jpg")} alt="Akara served with pap" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src={asset("food-jollof-fish.jpg")} alt="Jollof rice plated with grilled fish" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { num: "01", title: "Soups",     href: "/soups",     img: "food-egusi-hands.jpg",  desc: "Onugbu, Egusi, Banga, Afang, Ogbono and more — by the litre or by the cooler." },
              { num: "02", title: "Stews",     href: "/stews",     img: "food-jollof-fish.jpg",  desc: "Classic Nigerian stews cooked fresh in small batches for families or events." },
              { num: "03", title: "Breakfast", href: "/breakfast", img: "food-akara-pap.jpg",    desc: "Akara, moin-moin, pancakes and more — the kind of breakfast that takes real time." },
              { num: "04", title: "Products",  href: "/products",  img: "assets/products/peanut-butter.jpg", desc: "Sauces, snacks and bottled drinks to stock your pantry — no MSG, no preservatives.", rawImg: true },
              { num: "05", title: "Catering",  href: "/catering",  img: "food-catering.jpg",     desc: "Weddings, birthdays, corporate events — tell us your guest count and we'll build a menu and quote." },
            ].map(({ num, title, href, img, desc, rawImg }) => (
              <Link key={href} href={href} className="group block">
                <div className="rounded-2xl overflow-hidden border border-border bg-card hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={rawImg ? `${BASE}${img}` : asset(img)}
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
                title: "Pick your meal & slot",
                body: "Choose your dish, size and protein, then tell us when you want it delivered.",
              },
              {
                n: "2",
                title: "Pay to confirm",
                body: "Bank transfer or payment on delivery locks in your slot. Booking within 24 hours adds a rush fee — shown before you confirm, never a surprise.",
              },
              {
                n: "3",
                title: "We cook, you're notified",
                body: "Your slot goes straight onto our kitchen calendar. We cook to order and get it to you in your chosen window.",
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-5">
                <div
                  className="w-12 h-12 shrink-0 rounded-full text-white font-display font-bold text-xl flex items-center justify-center"
                  style={{ background: "#C81212" }}
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
            className="shrink-0 rounded-full px-10 py-4 text-lg font-bold text-white shadow-xl hover:opacity-90 transition-opacity"
            style={{ background: BRAND_GREEN, display: "inline-flex", alignItems: "center" }}
          >
            Book Your Meal
          </Link>
        </div>
      </section>

    </div>
  );
}
