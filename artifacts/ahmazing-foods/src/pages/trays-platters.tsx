import { Link } from "wouter";
import { GlassWater, MessageCircle } from "lucide-react";

const WA_NUMBER = "2348105506052";

function waLink(item: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to order the ${item}`)}`;
}

interface TrayItem {
  name: string;
  size?: string;
  contains: string;
  price: string;
}

interface TrayGroup {
  heading: string;
  sub: string;
  items: TrayItem[];
  note?: string;
}

const groups: TrayGroup[] = [
  {
    heading: "Platters",
    sub: "Large spreads for parties and bigger gatherings — serves 8–15.",
    items: [
      {
        name: "Breakfast Platter",
        size: "Serves 8–10",
        contains: "Pancakes, akara, sausage rolls, sandwiches, mixed fruit, sauce cups",
        price: "₦154,000",
      },
      {
        name: "Rice & Grill Platter",
        size: "Jollof, grilled chicken, plantain · Serves 10–12",
        contains: "Jollof rice, fried rice, grilled chicken, turkey wings, spring rolls, coleslaw, fried plantain",
        price: "₦220,000",
      },
      {
        name: "Party Starter Platter",
        size: "Mixed rice, proteins & sides · Serves 12–15",
        contains: "Mixed jollof & fried rice, assorted proteins (chicken, beef, fish), grilled corn, coleslaw, small chops, plantain",
        price: "₦247,500",
      },
    ],
    note: "Add a vegetable-forward side (salad or steamed veg) and a dessert bite to balance the spread.",
  },
  {
    heading: "Trays",
    sub: "Curated gift trays — perfect for a single person or as a special gesture.",
    items: [
      {
        name: "Classic Tray",
        contains: "Fruit salad, coleslaw, peppered fried fish (2 pcs), jollof rice, chocolates, fruit juice (orange, pineapple or apple), water (1 bottle)",
        price: "₦34,500",
      },
      {
        name: "Deluxe Tray",
        contains: "Fruit salad, coleslaw, jollof rice, small chops, 2 chicken thighs (peppered), Pringles & chocolates, biscuits, fruit juice, water (1 bottle)",
        price: "₦51,750",
      },
      {
        name: "Grand Tray",
        contains: "Coleslaw, fruit salad, 10 inch cake, jollof rice, fried rice, fried plantain, half chicken (peppered), red wine, water (2 bottles)",
        price: "₦103,500",
      },
      {
        name: "Ultimate Tray",
        contains: "Coleslaw, fruit salad, 10 inch cake, jollof rice, fried rice, spaghetti, small chops, chocolate/chips/biscuits, half chicken (peppered), pancakes, fruit juice, red wine, water (2 bottles)",
        price: "₦132,250",
      },
    ],
    note: "Tray prices are based on historical rates marked up 15%. Contents can be adjusted — just mention it in your WhatsApp message.",
  },
  {
    heading: "Singles",
    sub: "Individual items — pick one, or mix a few to build your own tray.",
    items: [
      {
        name: "Jollof Lunch Pack",
        size: "Jollof, grilled protein & plantain",
        contains: "Jollof rice, one grilled protein, fried plantain, pepper sauce",
        price: "₦9,350 – ₦9,900",
      },
      {
        name: "Pasta Bowl",
        size: "Pasta with grilled protein",
        contains: "Pasta in tomato sauce, one grilled protein, side salad",
        price: "₦11,000",
      },
      {
        name: "Mini Pancakes",
        size: "Stack with syrup, 6 pcs",
        contains: "6 mini pancakes, syrup & dip cups",
        price: "₦4,950",
      },
      {
        name: "Small Chops Box",
        size: "Spring rolls, puff puff & more",
        contains: "Spring rolls, puff-puff, samosa, mixed skewers, dip",
        price: "₦6,000",
      },
    ],
    note: "Singles pair well — e.g. Jollof Lunch Pack + Small Chops Box, or any single + a bottled drink from our Products page.",
  },
];

export default function TraysAndPlattersPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page header */}
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <GlassWater className="w-5 h-5 opacity-60" />
            <span className="text-background/60 text-sm font-medium uppercase tracking-wider">New</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Trays &amp;<br />Platters
          </h1>
          <p className="text-xl text-background/75 max-w-2xl leading-relaxed">
            For gifting, small gatherings, and grazing — sized between a single meal and a full catered event.
            Choose a platter for a spread, a tray for a gift, or pick singles to build your own.
          </p>
        </div>
      </div>

      {/* Price note */}
      <div className="container mx-auto px-4 md:px-6 mb-12">
        <div className="rounded-2xl bg-muted border border-border px-6 py-4 text-sm text-muted-foreground">
          <strong className="text-foreground">About these prices:</strong>{" "}
          Based on current market rates, marked up 10% for AHmazing Foods.
          Photos are on the way — we're shooting fresh content soon.
        </div>
      </div>

      {/* Groups */}
      <div className="container mx-auto px-4 md:px-6 space-y-20">
        {groups.map((group) => (
          <section key={group.heading}>
            <div className="mb-10">
              <h2 className="text-3xl font-bold font-display mb-2">{group.heading}</h2>
              <p className="text-muted-foreground">{group.sub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                >
                  {/* Placeholder image area */}
                  <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span className="text-xs font-medium">Photo coming soon</span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1 gap-2">
                    <h3 className="font-display font-bold text-[16px] leading-tight">{item.name}</h3>
                    {item.size && (
                      <p className="text-xs font-medium text-primary/80">{item.size}</p>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.contains}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
                      <span className="font-bold text-foreground text-base">{item.price}</span>
                      <a
                        href={waLink(item.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
                        style={{ background: "#25D366" }}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Order
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {group.note && (
              <div className="mt-6 rounded-xl bg-muted/60 border border-border px-5 py-4 text-sm text-muted-foreground">
                <strong className="text-foreground">Tip: </strong>{group.note}
              </div>
            )}
          </section>
        ))}

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-muted border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
          <div>
            <h3 className="text-2xl font-bold font-display mb-2">Need a full catered event?</h3>
            <p className="text-muted-foreground">Our catering service covers everything from setup to service for larger events.</p>
          </div>
          <Link
            href="/catering"
            className="shrink-0 rounded-full px-8 py-3 font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: "#0F9E0F" }}
          >
            View Catering
          </Link>
        </div>
      </div>
    </div>
  );
}
