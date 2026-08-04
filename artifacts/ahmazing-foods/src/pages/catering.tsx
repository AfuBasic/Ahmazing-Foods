import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, MessageCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;
const BRAND_GREEN = "#0F9E0F";
const BRAND_RED = "#C81212";

type FormData = {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  guests: string;
  date: string;
  time: string;
  service: string;
  location: string;
  menu: string;
  budget: string;
  notes: string;
};

export default function CateringPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    eventType: "Wedding",
    guests: "",
    date: "",
    time: "",
    service: "Delivery to venue",
    location: "",
    menu: "",
    budget: "Not sure yet",
    notes: "",
  });

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const isPickup = form.service === "Pickup from our kitchen";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.guests || !form.date) {
      alert("Please fill in your name, phone, guest count, and event date so we can quote accurately.");
      return;
    }
    const lines = [
      "Hi, I'd like to request a catering quote:",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : null,
      `Event type: ${form.eventType}`,
      `Guests: ${form.guests}`,
      `Date: ${form.date}${form.time ? " at " + form.time : ""}`,
      `Service: ${form.service}`,
      form.location ? `Venue/address: ${form.location}` : null,
      form.menu ? `Menu request: ${form.menu}` : null,
      `Budget: ${form.budget}`,
      form.notes ? `Notes: ${form.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/2348105506052?text=${encodeURIComponent(lines)}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Hero */}
      <div className="bg-foreground text-background pt-16 pb-16 rounded-b-[3rem] shadow-xl mb-0">
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-background/70 hover:text-background mb-8 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-background/50 mb-4">Event Catering · Lagos</span>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Catering for your event,{" "}
            <em className="not-italic text-primary">planned around you</em>.
          </h1>
          <p className="text-xl text-background/80 max-w-2xl leading-relaxed mb-8">
            Weddings, birthdays, corporate events, wakes, house parties — tell us the details
            and we'll come back with a menu and a quote built for your number of guests,
            not a generic package.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => document.getElementById('catering-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-full px-8 py-3 font-bold text-white shadow-md hover:opacity-90 transition-opacity"
              style={{ background: BRAND_GREEN }}
            >
              Start Your Request
            </button>
            <a
              href="https://wa.me/2348105506052?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20catering%20for%20an%20event"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-8 py-3 font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Hero photo */}
      <div className="container mx-auto px-4 md:px-6 -mt-10 mb-16">
        <div className="rounded-2xl overflow-hidden shadow-xl h-64 md:h-80">
          <img src={asset("food-catering.jpg")} alt="AHmazing Foods event catering spread" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* How it works */}
      <section className="py-16 bg-[#FCF1EF] border-t border-b border-dashed border-border mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">How it works</span>
            <h2 className="text-3xl font-bold font-display mt-3">No two events are the same, so no two quotes are either</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { n: "1", title: "Tell us about your event", body: "Guest count, date, venue, and what you'd like served — the form below covers it." },
              { n: "2", title: "We send a tailored quote", body: "Within 24 hours, based on your guest count, menu, and whether you need delivery or pickup." },
              { n: "3", title: "Confirm & we cook", body: "A deposit locks in your date. We handle the rest and deliver or set up in time for your event." },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-5">
                <div className="w-12 h-12 shrink-0 rounded-full text-white font-display font-bold text-xl flex items-center justify-center" style={{ background: BRAND_RED }}>
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

      {/* Form */}
      <div id="catering-form" className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Request a quote</span>
          <h2 className="text-3xl font-bold font-display mt-3 mb-2">Tell us about your event</h2>
          <p className="text-muted-foreground">Fill in as much as you can — the more detail, the more accurate your quote.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 max-w-5xl mx-auto">
          {/* Left column — fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Full name <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Phone <span className="text-destructive">*</span></label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="080..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Type of event</label>
                <select
                  value={form.eventType}
                  onChange={set("eventType")}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  {["Wedding", "Birthday", "Corporate event", "Wake / Funeral", "House party", "Other"].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Number of guests <span className="text-destructive">*</span></label>
                <input
                  type="number"
                  value={form.guests}
                  onChange={set("guests")}
                  min="10"
                  placeholder="e.g. 80"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Event date <span className="text-destructive">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Start time <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  type="time"
                  value={form.time}
                  onChange={set("time")}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Delivery or pickup</label>
              <select
                value={form.service}
                onChange={set("service")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {["Delivery to venue", "Pickup from our kitchen", "Full setup with service staff"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              {form.service === "Full setup with service staff" && (
                <p className="text-xs text-muted-foreground mt-1.5">Full setup includes chafing dishes, serving staff, and clean-up.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {isPickup ? "Anything else about pickup?" : "Event venue / delivery address"}
                {!isPickup && <span className="text-muted-foreground font-normal"> (optional)</span>}
              </label>
              <input
                type="text"
                value={form.location}
                onChange={set("location")}
                placeholder={isPickup ? "" : "Venue name, street, area, Lagos"}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">What would you like served?</label>
              <textarea
                value={form.menu}
                onChange={set("menu")}
                rows={3}
                placeholder="e.g. Jollof rice, 2 soups with swallow, grilled chicken, a drinks table for 80 guests"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Estimated budget</label>
              <select
                value={form.budget}
                onChange={set("budget")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {[
                  "Not sure yet — send recommendations",
                  "₦500,000 – ₦1,000,000",
                  "₦1,000,000 – ₦2,500,000",
                  "₦2,500,000 – ₦5,000,000",
                  "₦5,000,000 and above",
                ].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Anything else we should know? <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Allergies, cultural or religious dietary requirements, theme, timing constraints..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
            </div>
          </div>

          {/* Right column — summary ticket + submit */}
          <div className="lg:sticky lg:top-28 h-fit space-y-4">
            <div className="bg-foreground text-background rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-white/20 text-xs font-bold uppercase tracking-wider text-background/50">
                <span>Event Request</span>
                <span className="text-background/70">{form.name || "Draft"}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-background/70">{form.eventType || "Event type —"}</span>
                  <span className="font-semibold">{form.guests ? `${form.guests} guests` : "— guests"}</span>
                </div>
                <div className="flex justify-between text-background/60 text-xs">
                  <span>{form.date || "Date —"}</span>
                  <span>{form.service || "—"}</span>
                </div>
                <p className="pt-3 text-background/50 text-xs leading-relaxed border-t border-white/10">
                  We don't charge a fixed price here — every event gets a custom quote based on what you tell us. Submitting sends your request straight to our WhatsApp so we can reply quickly.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full py-4 font-bold text-white text-base flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
              style={{ background: BRAND_GREEN }}
            >
              <MessageCircle className="w-5 h-5" />
              Send Request via WhatsApp
            </button>
            <p className="text-xs text-muted-foreground text-center">We'll reply with a tailored quote, usually within 24 hours.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
