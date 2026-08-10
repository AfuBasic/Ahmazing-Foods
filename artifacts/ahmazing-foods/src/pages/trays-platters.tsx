import { useState } from "react";
import { WatermarkedImage } from "@/components/ui/watermarked-image";
import { Link } from "wouter";
import { GlassWater, MessageCircle, AlertCircle, CheckCircle2, Plus, Minus, CalendarDays, Check, MapPin, User } from "lucide-react";

const WA_NUMBER = "2348105506052";
const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}${p}`;
const BRAND_GREEN = "#0F9E0F";
const RUSH_FLAT_FEE = 20000;
const RUSH_CAP_PCT = 0.5;
const OFFICE_PHONE = "+234 (810)-550-6052";

// Bike delivery zones — Small Chop Boxes only (ceiling prices)
const BIKE_ZONES = [
  { id: "t1",  label: "Tier 1 — Lekki, Ikate, VGC, Chevron, Igbo-Efon",                               fee: 4500,  quote: false },
  { id: "t1b", label: "Tier 1B — Ajah, Abraham Adesanya, Lakowe, Awoyaya, Ogombo",                     fee: 6500,  quote: false },
  { id: "t2",  label: "Tier 2 — Lagos Island, Marina, Apapa, VI, Ikoyi, Banana Island, Yaba, Surulere", fee: 8500,  quote: false },
  { id: "t3",  label: "Tier 3 — Ikeja, Maryland, Gbagada, Anthony, Ojota",                             fee: 10500, quote: false },
  { id: "t4",  label: "Tier 4 — Festac, Oshodi, Isolo, Mushin, Amuwo-Odofin, Alimosho, Agege",        fee: 12500, quote: false },
  { id: "t5",  label: "Tier 5 — Ikorodu, Badagry, Epe, far Ibeju-Lekki",                              fee: null,  quote: true  },
] as const;
type BikeZoneId = typeof BIKE_ZONES[number]["id"];

// ── Delivery helpers ───────────────────────────────────────────────────────
function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function isSameDayRushNow(): boolean {
  const h = new Date().getHours();
  return h >= 6 && h < 9;
}
function fmt12hr(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
function rushFeeFor(priceNum: number): number {
  return Math.min(RUSH_FLAT_FEE, priceNum * RUSH_CAP_PCT);
}

// ── Static data ────────────────────────────────────────────────────────────
const DRINK_OPTIONS = [
  "Zobo Drink", "Yogurt Drink", "Ginger Immune Booster", "Turmeric Immune Booster",
  "Pineapple Ginger Drink", "Tiger Nut Milk", "Kale Cleanser", "Lemon Honey Cleanser",
  "Orange Juice", "Carrot Juice",
] as const;

const WINE_OPTIONS = ["White Wine", "Red Wine", "Non-Alcoholic Wine"] as const;
type WineOption = typeof WINE_OPTIONS[number];

const PEPPER_BLENDS = [
  "Straight Honey", "Honey-Pepper Blend", "Pepper-Citrus Blend", "Classic Ata",
] as const;

const RUSH_WINDOWS = [
  { val: "4pm-6pm", label: "4:00 – 6:00 PM" },
  { val: "6pm-8pm", label: "6:00 – 8:00 PM" },
] as const;

interface PlattersItem { name: string; priceNum: number; priceStr: string; contains: string; serves?: string; img: string; }
interface TrayItem     { name: string; priceNum: number; priceStr: string; contains: string; img: string; }
type DrinkMode = "none" | "pick2" | "pick4" | "fixed";
interface PackageItem  { name: string; priceNum: number; priceStr: string; contains: string; drinkMode: DrinkMode; fixedDrinks?: string; img: string; }

const PLATTERS: PlattersItem[] = [
  { name: "Breakfast Platter",               priceNum: 190000, priceStr: "₦190,000", serves: "Serves 6–8",
    img: "assets/platters/breakfast-platter.jpg",
    contains: "Pancakes, akara, sausage rolls, sandwiches, mixed fruit, sauce cups, a dessert cup (chin chin & yogurt mix)" },
  { name: "Dinner Platter",                  priceNum: 190000, priceStr: "₦190,000", serves: "Serves 6–8",
    img: "assets/platters/dinner-platter.jpg",
    contains: "Jollof & fried rice, 8 pieces peppered chicken, 8 pieces peppered beef, coleslaw, plantain, small chops, a dessert cup (chin chin & yogurt mix), dinner candles" },
  { name: "Anniversary Platter",             priceNum: 190000, priceStr: "₦190,000", serves: "Serves 6–8",
    img: "assets/platters/anniversary-platter.jpg",
    contains: "Jollof & fried rice, 8 pieces peppered chicken, 8 pieces peppered beef, coleslaw, plantain, small chops, a dessert cup (chin chin & yogurt mix), an anniversary card" },
  { name: "Birthday Platter",                priceNum: 190000, priceStr: "₦190,000", serves: "Serves 6–8",
    img: "assets/platters/birthday-platter.jpg",
    contains: "Jollof & fried rice, 8 pieces peppered chicken, 8 pieces peppered beef, coleslaw, plantain, small chops, a dessert cup (chin chin & yogurt mix), a birthday card & candles" },
  { name: "Party Starter Platter — Feeds 15", priceNum: 350000,  priceStr: "₦350,000",
    img: "assets/platters/party-starter-platter.jpg",
    contains: "Mixed jollof & fried rice, assorted proteins (chicken, beef, fish), grilled corn, coleslaw, small chops, plantain" },
  { name: "Party Starter Platter — Feeds 30", priceNum: 550000,  priceStr: "₦550,000",
    img: "assets/platters/party-starter-platter.jpg",
    contains: "Mixed jollof & fried rice, assorted proteins (chicken, beef, fish), grilled corn, coleslaw, small chops, plantain" },
  { name: "Party Starter Platter — Feeds 50", priceNum: 1000000, priceStr: "₦1,000,000",
    img: "assets/platters/party-starter-platter.jpg",
    contains: "Mixed jollof & fried rice, assorted proteins (chicken, beef, fish), grilled corn, coleslaw, small chops, plantain" },
];

const TRAYS: TrayItem[] = [
  { name: "Classic Tray",  priceNum: 120000, priceStr: "₦120,000",
    img: "assets/trays/classic-tray.jpg",
    contains: "Fruit salad, coleslaw, peppered fried fish (2 pcs), jollof rice, chocolates, water (1 bottle)" },
  { name: "Deluxe Tray",   priceNum: 145000, priceStr: "₦145,000",
    img: "assets/trays/deluxe-tray.jpg",
    contains: "Fruit salad, coleslaw, jollof rice, small chops, 2 chicken thighs (peppered), Pringles & chocolates, biscuits, water (1 bottle)" },
  { name: "Grand Tray",    priceNum: 170000, priceStr: "₦170,000",
    img: "assets/trays/grand-tray.jpg",
    contains: "Coleslaw, fruit salad, 10 inch cake, jollof rice, fried rice, fried plantain, half chicken (peppered), water (2 bottles)" },
  { name: "Ultimate Tray", priceNum: 190000, priceStr: "₦190,000",
    img: "assets/trays/ultimate-tray.jpg",
    contains: "Coleslaw, fruit salad, 10 inch cake, jollof rice, fried rice, spaghetti, small chops, chocolate/chips/biscuits, half chicken (peppered), pancakes, water (2 bottles)" },
];

const PACKAGES: PackageItem[] = [
  { name: "Small Chops — Starter", priceNum: 23000,  priceStr: "₦23,000",  drinkMode: "none",
    img: "assets/small-chops/starter.png",
    contains: "10 samosas, 10 spring rolls, 30 puff puff, 20 mosa, 5 peppered beef bites, 5 peppered gizzard, 5 sausages, 5 mini corn dogs" },
  { name: "Small Chops — Mini",    priceNum: 37000,  priceStr: "₦37,000",  drinkMode: "none",
    img: "assets/small-chops/mini.png",
    contains: "30 samosas, 30 spring rolls, 80 puff puff, 40 mosa, 50 peppered beef bites" },
  { name: "Small Chops — Full",    priceNum: 69000,  priceStr: "₦69,000",  drinkMode: "pick2",
    img: "assets/small-chops/full.png",
    contains: "45 samosas, 40 spring rolls, 5 spring rolls with prawns & mayo, 80 puff puff, 30 mosa, 40 peppered beef bites, 10 peppered chicken, 15 peppered gizzard, 5 grilled snail, 5 sausages, 5 mini corn dogs" },
  { name: "Small Chops — Premium", priceNum: 178000, priceStr: "₦178,000", drinkMode: "fixed",
    img: "assets/small-chops/premium.png",
    fixedDrinks: "Carrot Juice, Zobo Drink, Yogurt Drink, Pineapple Ginger Drink, Ginger Immune Booster, plus 2 bottles of still water",
    contains: "60 samosas, 50 spring rolls, 10 spring rolls with prawns & mayo, 60 puff puff, 20 peppered beef bites, 20 peppered chicken, 10 peppered turkey, 15 peppered gizzard, 10 grilled snail, 8 sausages, 10 mini corn dogs" },
];

// ── Blend helpers ─────────────────────────────────────────────────────────
type BlendMap = Partial<Record<typeof PEPPER_BLENDS[number], number>>;

function blendTotalUnits(bm: BlendMap): number {
  return PEPPER_BLENDS.reduce((s, b) => s + (bm[b] ?? 0), 0);
}
function blendExtraCharge(bm: BlendMap): number {
  return Math.max(0, blendTotalUnits(bm) - 1) * 3000;
}
function blendCostDisplay(bm: BlendMap): string {
  const u = blendTotalUnits(bm);
  if (u === 0) return "0 units selected — free";
  if (u === 1) return "1 unit selected — free";
  const extra = (u - 1) * 3000;
  return `${u} units selected — 1st free, +₦${extra.toLocaleString("en-NG")} for the extra ${u - 1}`;
}

// ── Types ─────────────────────────────────────────────────────────────────
interface CustInfo {
  name: string; phone: string; address: string;
  altName: string; altPhone: string;
}
function custLines(c: CustInfo): string[] {
  const lines = [`Name: ${c.name}`, `Phone: ${c.phone}`, `Delivery address: ${c.address}`];
  if (c.altName) lines.push(`Recipient (receiving order): ${c.altName}${c.altPhone ? ` | ${c.altPhone}` : ""}`);
  return lines;
}

// ── WA message builders ───────────────────────────────────────────────────
function deliveryDesc(date: string, time: string, isRush: boolean, rushWindowLabel: string): string {
  if (isRush) return `Today — ${rushWindowLabel}`;
  return time ? `${date} at ${fmt12hr(time)}` : date;
}

function buildPlatterMsg(item: PlattersItem, wine: string, blends: BlendMap, drinks: string[], delivInfo: string, cust: CustInfo): string {
  const blendItems = PEPPER_BLENDS.filter((b) => (blends[b] ?? 0) > 0).map((b) => ({ name: b, qty: blends[b]! }));
  const totalUnits = blendTotalUnits(blends);
  const extraBlend = blendExtraCharge(blends);
  const total = item.priceNum + extraBlend;

  const lines: string[] = [`Hi, I'd like to order the ${item.name} (${item.priceStr}).`, "", ...custLines(cust), ""];
  if (wine) lines.push(`Wine: ${wine}`);
  if (blendItems.length) {
    const desc = blendItems.map((b) => (b.qty > 1 ? `${b.name} x${b.qty}` : b.name)).join(", ");
    lines.push(`Pepper blend${blendItems.length > 1 || totalUnits > 1 ? "s" : ""}: ${desc}`);
    if (extraBlend > 0) lines.push(`Extra blend fee: ${totalUnits - 1} extra unit${totalUnits - 1 > 1 ? "s" : ""} × ₦3,000 = ₦${extraBlend.toLocaleString("en-NG")}`);
  }
  if (drinks.length) lines.push(`Free drink${drinks.length > 1 ? "s" : ""}: ${drinks.join(", ")}`);
  lines.push(`Delivery date: ${delivInfo}`);
  lines.push(`Delivery method: Car delivery required — please call ${OFFICE_PHONE} for car delivery pricing, or arrange your own pickup`);
  if (extraBlend > 0) lines.push(`TOTAL (excl. delivery): ₦${total.toLocaleString("en-NG")}`);
  lines.push("", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildTrayMsg(item: TrayItem, drinks: string[], delivInfo: string, cust: CustInfo): string {
  const lines: string[] = [`Hi, I'd like to order the ${item.name} (${item.priceStr}).`, "", ...custLines(cust), ""];
  if (drinks.length) lines.push(`Free drinks (${drinks.length}): ${drinks.join(", ")}`);
  lines.push(`Delivery date: ${delivInfo}`);
  lines.push(`Delivery method: Car delivery required — please call ${OFFICE_PHONE} for car delivery pricing, or arrange your own pickup`);
  lines.push("", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildPackageMsg(
  item: PackageItem, drinks: string[], delivInfo: string, rushFee: number,
  pkgDelivMode: "bike" | "own" | "", pkgZoneId: string, cust: CustInfo,
): string {
  const bikeZone = BIKE_ZONES.find((z) => z.id === pkgZoneId);
  const bikeFee = pkgDelivMode === "bike" && bikeZone && !bikeZone.quote ? bikeZone.fee : 0;
  const total = item.priceNum + rushFee + (bikeFee ?? 0);

  const lines: string[] = [`Hi, I'd like to order ${item.name} (${item.priceStr}).`, "", ...custLines(cust), ""];
  if (item.drinkMode === "fixed" && item.fixedDrinks) lines.push(`Includes: ${item.fixedDrinks}`);
  else if (drinks.length) lines.push(`Free drink${drinks.length > 1 ? "s" : ""}: ${drinks.join(", ")}`);
  lines.push(`Delivery date: ${delivInfo}`);
  if (pkgDelivMode === "bike" && bikeZone) {
    lines.push(bikeZone.quote
      ? `Delivery: Bike — ${bikeZone.label} — fee to be quoted`
      : `Delivery: Bike — ${bikeZone.label} — ₦${(bikeZone.fee!).toLocaleString("en-NG")}`
    );
  } else if (pkgDelivMode === "own") {
    lines.push(`Delivery: Customer's own arrangement — no delivery fee`);
  }
  if (rushFee > 0) lines.push(`Rush fee: ₦${Math.round(rushFee).toLocaleString("en-NG")}`);
  if (rushFee > 0 || bikeFee) lines.push(`TOTAL: ₦${Math.round(total).toLocaleString("en-NG")}`);
  lines.push("", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

// Pepper blend picker — platters only
function PepperBlendPicker({ blends, onChange }: { blends: BlendMap; onChange: (b: BlendMap) => void }) {
  const cost = blendCostDisplay(blends);
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
        Pepper blend(s) <span className="text-destructive">*</span>
        <span className="block text-[10px] font-normal normal-case tracking-normal text-muted-foreground mt-0.5">
          Tap +/− to match your guest count. 1st unit free, +₦3,000 per extra unit.
        </span>
      </label>
      <div className="space-y-2 mt-2">
        {PEPPER_BLENDS.map((blend) => {
          const qty = blends[blend] ?? 0;
          const checked = qty > 0;
          return (
            <div key={blend} className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange({ ...blends, [blend]: checked ? 0 : 1 })}
                  className="w-3.5 h-3.5 accent-[#0F9E0F]"
                />
                <span className="text-xs text-foreground truncate">{blend}</span>
              </label>
              {checked && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onChange({ ...blends, [blend]: Math.max(1, qty - 1) })}
                    className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => onChange({ ...blends, [blend]: qty + 1 })}
                    className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] font-medium text-muted-foreground mt-2 bg-muted/60 rounded-lg px-2.5 py-1.5">{cost}</p>
    </div>
  );
}

// Drink picker — trays (4) and platter/full-package (2)
function DrinkPicker({ drinks, maxDrinks, onChange }: {
  drinks: string[]; maxDrinks: number; onChange: (d: string[]) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1">
        Pick {maxDrinks} free drink{maxDrinks > 1 ? "s" : ""} <span className="text-destructive">*</span>
        <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
          ({drinks.length}/{maxDrinks} chosen)
        </span>
      </label>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {DRINK_OPTIONS.map((d) => {
          const sel = drinks.includes(d);
          const full = !sel && drinks.length >= maxDrinks;
          return (
            <button
              key={d}
              type="button"
              onClick={() => {
                if (sel) onChange(drinks.filter((x) => x !== d));
                else if (!full) onChange([...drinks, d]);
              }}
              disabled={full}
              className={[
                "text-[11px] px-2.5 py-1 rounded-full border transition-all",
                sel ? "bg-[#0F9E0F] text-white border-[#0F9E0F]"
                  : full ? "border-border text-muted-foreground/40 cursor-not-allowed"
                  : "border-border text-muted-foreground hover:border-[#0F9E0F]/60",
              ].join(" ")}
            >
              {sel && "✓ "}{d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Shared delivery date/time field
interface DeliveryState {
  date: string;
  time: string;
  rushWindow: string | null;
}
interface DeliveryFieldProps extends DeliveryState {
  onDate: (v: string) => void;
  onTime: (v: string) => void;
  onRushWindow: (v: string) => void;
}
function DeliveryField({ date, time, rushWindow, onDate, onTime, onRushWindow }: DeliveryFieldProps) {
  const today = getToday();
  const isToday = date === today;
  const sameDayEligible = isToday && isSameDayRushNow();
  const sameDayClosed = isToday && !isSameDayRushNow();

  function handleDateChange(v: string) {
    const newToday = getToday();
    if (v === newToday && !isSameDayRushNow()) {
      // Auto-advance: same-day window already closed
      const next = new Date();
      next.setDate(next.getDate() + 1);
      onDate(next.toISOString().slice(0, 10));
    } else {
      onDate(v);
    }
  }

  return (
    <div className="bg-muted/50 border border-border rounded-2xl p-5 mb-10">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-bold">When do you need it?</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Date picker */}
        <div className="flex-1">
          <label className="text-xs text-muted-foreground block mb-1">Delivery date</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F9E0F]/40"
          />
        </div>

        {/* Time field or rush windows */}
        {sameDayEligible ? (
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">
              Same-day delivery window <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              {RUSH_WINDOWS.map((w) => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => onRushWindow(w.val)}
                  className={[
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                    rushWindow === w.val
                      ? "bg-[#0F9E0F] text-white border-[#0F9E0F]"
                      : "border-border text-foreground hover:border-[#0F9E0F]/60",
                  ].join(" ")}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        ) : !isToday ? (
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Delivery time</label>
            <input
              type="time"
              value={time}
              min="09:00"
              max="21:00"
              onChange={(e) => onTime(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F9E0F]/40"
            />
          </div>
        ) : null}
      </div>

      {/* Hints */}
      {sameDayClosed && (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Same-day booking closes at 9:00 AM — the next available slot is tomorrow. Date has been moved forward.
        </p>
      )}
      {sameDayEligible && (
        <p className="mt-3 text-xs text-[#0F9E0F] bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          Same-day rush available — Small Chop Boxes only. Rush fee applies (lesser of ₦20,000 or 50% of item price).
          Platters &amp; Trays always need at least 24–48 hrs notice.
        </p>
      )}
      {!isToday && (
        <p className="mt-3 text-xs text-muted-foreground">
          Platters &amp; Trays: min 24–48 hrs notice. Small Chop Boxes: min 24 hrs (same-day available 6–9 AM only).
        </p>
      )}
    </div>
  );
}

// No-photo placeholder
function NoPhoto() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className="text-xs font-medium">Photo coming soon</span>
    </div>
  );
}

// ── Platter card ──────────────────────────────────────────────────────────
interface PlatterCardProps {
  item: PlattersItem;
  wine: string;
  blends: BlendMap;
  drinks: string[];
  delivInfo: string;
  deliveryOk: boolean;
  customerReady: boolean;
  custInfo: CustInfo;
  onWine: (w: string) => void;
  onBlend: (b: BlendMap) => void;
  onDrink: (d: string[]) => void;
}
function PlatterCard({ item, wine, blends, drinks, delivInfo, deliveryOk, customerReady, custInfo, onWine, onBlend, onDrink }: PlatterCardProps) {
  const wineOk = wine !== "";
  const blendOk = blendTotalUnits(blends) >= 1;
  const drinksOk = drinks.length === 2;
  const ready = wineOk && blendOk && drinksOk && deliveryOk && customerReady;

  const missing: string[] = [];
  if (!customerReady) missing.push("fill in your details in the 'Your Details' section above");
  if (!deliveryOk) missing.push("choose a future delivery date (Platters need 24–48 hrs notice)");
  if (!wineOk) missing.push("select a wine");
  if (!blendOk) missing.push("choose at least 1 pepper blend");
  if (!drinksOk) missing.push(`choose ${2 - drinks.length} more drink${2 - drinks.length > 1 ? "s" : ""}`);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted overflow-hidden relative">
        <img src={asset(item.img)} alt={item.name} className="w-full h-full object-cover" />
        {item.serves && (
          <span className="absolute bottom-2 right-2 bg-foreground/80 text-background text-[10px] font-semibold rounded-full px-2 py-0.5">
            {item.serves}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-display font-bold text-[16px] leading-tight">{item.name}</h3>
          {item.serves && <p className="text-xs font-semibold text-[#0F9E0F] mt-0.5">{item.serves}</p>}
          <p className="text-2xl font-bold mt-1">{item.priceStr}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            <span className="font-semibold text-foreground">Contains: </span>{item.contains}
          </p>
        </div>

        {/* Wine */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
            Wine choice <span className="text-destructive">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {WINE_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onWine(wine === w ? "" : w)}
                className={[
                  "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                  wine === w
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/40",
                ].join(" ")}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Pepper blend */}
        <PepperBlendPicker blends={blends} onChange={onBlend} />

        {/* Drinks */}
        <DrinkPicker drinks={drinks} maxDrinks={2} onChange={onDrink} />

        {/* Order button */}
        <div className="mt-auto pt-2 border-t border-border">
          {!ready ? (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Please {missing.join("; ")} before ordering.</span>
            </div>
          ) : (
            <a
              href={buildPlatterMsg(item, wine, blends, drinks, delivInfo, custInfo)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" /> Order on WhatsApp
            </a>
          )}
          {ready && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#0F9E0F]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All selections confirmed — ready to order</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tray card ─────────────────────────────────────────────────────────────
function TrayCard({ item, drinks, delivInfo, deliveryOk, customerReady, custInfo, onDrink }: {
  item: TrayItem; drinks: string[]; delivInfo: string; deliveryOk: boolean;
  customerReady: boolean; custInfo: CustInfo; onDrink: (d: string[]) => void;
}) {
  const drinksOk = drinks.length === 4;
  const ready = drinksOk && deliveryOk && customerReady;

  const missing: string[] = [];
  if (!customerReady) missing.push("fill in your details in the 'Your Details' section above");
  if (!deliveryOk) missing.push("choose a future delivery date (Trays need 24–48 hrs notice)");
  const diff = 4 - drinks.length;
  if (diff > 0) missing.push(`choose ${diff} more drink${diff > 1 ? "s" : ""}`);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted overflow-hidden">
        <img src={asset(item.img)} alt={item.name} className="w-full h-full object-cover" />
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-display font-bold text-[16px] leading-tight">{item.name}</h3>
          <p className="text-2xl font-bold mt-1">{item.priceStr}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            <span className="font-semibold text-foreground">Contains: </span>{item.contains}
          </p>
        </div>

        <DrinkPicker drinks={drinks} maxDrinks={4} onChange={onDrink} />

        <div className="mt-auto pt-2 border-t border-border">
          {!ready ? (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Please {missing.join("; ")} before ordering.</span>
            </div>
          ) : (
            <a
              href={buildTrayMsg(item, drinks, delivInfo, custInfo)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" /> Order on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Package card ──────────────────────────────────────────────────────────
function PackageCard({ item, drinks, delivInfo, isToday, sameDayEligible, rushWindow, pkgDelivMode, pkgZoneId, customerReady, custInfo, onDrink }: {
  item: PackageItem; drinks: string[]; delivInfo: string;
  isToday: boolean; sameDayEligible: boolean; rushWindow: string | null;
  pkgDelivMode: "bike" | "own" | ""; pkgZoneId: string;
  customerReady: boolean; custInfo: CustInfo; onDrink: (d: string[]) => void;
}) {
  const fee = (isToday && sameDayEligible) ? rushFeeFor(item.priceNum) : 0;

  const drinksOk = item.drinkMode === "pick2" ? drinks.length === 2 : true;
  const rushOk = !isToday || sameDayEligible;
  const windowOk = !sameDayEligible || rushWindow !== null;
  const delivOk = pkgDelivMode !== "" && (pkgDelivMode !== "bike" || pkgZoneId !== "");
  const ready = drinksOk && rushOk && windowOk && delivOk && customerReady;

  const missing: string[] = [];
  if (!customerReady) missing.push("fill in your details in the 'Your Details' section above");
  if (isToday && !sameDayEligible) missing.push("choose a future delivery date (same-day window is 6–9 AM only)");
  else if (sameDayEligible && !rushWindow) missing.push("select a delivery window above");
  if (!drinksOk) missing.push(`choose ${2 - drinks.length} more drink${2 - drinks.length > 1 ? "s" : ""}`);
  if (!delivOk) missing.push("choose a delivery option in the Small Chop Boxes section above");

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted overflow-hidden">
        <img src={asset(item.img)} alt={item.name} className="w-full h-full object-cover" />
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-display font-bold text-[16px] leading-tight">{item.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold">{item.priceStr}</p>
            {fee > 0 && (
              <span className="text-sm text-amber-600 font-semibold">
                + ₦{Math.round(fee).toLocaleString("en-NG")} rush fee
              </span>
            )}
          </div>
          {fee > 0 && fee < RUSH_FLAT_FEE && (
            <p className="text-[10px] text-muted-foreground">Rush fee capped at 50% of item price.</p>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            <span className="font-semibold text-foreground">Contains: </span>{item.contains}
          </p>
        </div>

        {/* Fixed drinks (Premium) */}
        {item.drinkMode === "fixed" && item.fixedDrinks && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
              Included drinks (fixed)
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.fixedDrinks}</p>
          </div>
        )}

        {/* Pick 2 drinks (Full) */}
        {item.drinkMode === "pick2" && (
          <DrinkPicker drinks={drinks} maxDrinks={2} onChange={onDrink} />
        )}

        <div className="mt-auto pt-2 border-t border-border">
          {!ready ? (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Please {missing.join("; ")} before ordering.</span>
            </div>
          ) : (
            <a
              href={buildPackageMsg(item, drinks, delivInfo, fee, pkgDelivMode, pkgZoneId, custInfo)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" /> Order on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function TraysAndPlattersPage() {
  // Delivery state (shared)
  const [delivDate, setDelivDate] = useState(getTomorrow);
  const [delivTime, setDelivTime] = useState("12:00");
  const [rushWindow, setRushWindow] = useState<string | null>(null);

  // Small Chop Boxes delivery option (bike-eligible)
  const [pkgDelivMode, setPkgDelivMode] = useState<"bike" | "own" | "">("");
  const [pkgZoneId,    setPkgZoneId]    = useState<BikeZoneId | "">("");

  // Customer details (page-level — shared across all cards)
  const [custName,    setCustName]    = useState("");
  const [custPhone,   setCustPhone]   = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [hasAlt,      setHasAlt]      = useState(false);
  const [altName,     setAltName]     = useState("");
  const [altPhone,    setAltPhone]    = useState("");
  const customerReady = !!(custName.trim() && custPhone.trim() && custAddress.trim());
  const custInfo: CustInfo = {
    name: custName.trim(), phone: custPhone.trim(), address: custAddress.trim(),
    altName: altName.trim(), altPhone: altPhone.trim(),
  };

  // Per-card state
  const [wineChoices, setWineChoices] = useState<Record<string, string>>({});
  const [drinkSel, setDrinkSel] = useState<Record<string, string[]>>({});
  const [blendSel, setBlendSel] = useState<Record<string, BlendMap>>({});

  const today = getToday();
  const isToday = delivDate === today;
  const sameDayEligible = isToday && isSameDayRushNow();

  // Delivery info for WA messages
  const rushWindowLabel = RUSH_WINDOWS.find((w) => w.val === rushWindow)?.label ?? "";
  const delivInfo = deliveryDesc(delivDate, delivTime, sameDayEligible && rushWindow !== null, rushWindowLabel);

  // Helpers for per-card state
  const getWine  = (name: string) => wineChoices[name] ?? "";
  const getDrinks = (name: string) => drinkSel[name] ?? [];
  const getBlends = (name: string) => blendSel[name] ?? {};

  const setWine   = (name: string, w: string) => setWineChoices((p) => ({ ...p, [name]: w }));
  const setDrinks = (name: string, d: string[]) => setDrinkSel((p) => ({ ...p, [name]: d }));
  const setBlends = (name: string, b: BlendMap) => setBlendSel((p) => ({ ...p, [name]: b }));

  const plattersDelivOk = !isToday;
  const traysDelivOk    = !isToday;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page header */}
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <GlassWater className="w-5 h-5 opacity-60" />
            <span className="text-background/60 text-sm font-medium uppercase tracking-wider">Trays & Platters</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Trays &amp;<br />Platters
          </h1>
          <p className="text-xl text-background/75 max-w-2xl leading-relaxed">
            For gifting, celebrations and gatherings — sized between a single meal and a fully catered event.
            Platters include your choice of wine plus two free drinks. Trays include four free drinks. Small Chop Boxes vary by tier.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 space-y-20">

        {/* ── Shared delivery date/time ────────────────────────────────── */}
        <DeliveryField
          date={delivDate} time={delivTime} rushWindow={rushWindow}
          onDate={(v) => { setDelivDate(v); setRushWindow(null); }}
          onTime={setDelivTime}
          onRushWindow={setRushWindow}
        />

        {/* ── Your Details ─────────────────────────────────────────────── */}
        <section className="max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-xl font-bold font-display">Your Details</h2>
            <span className="text-xs text-destructive font-semibold ml-1">*required</span>
          </div>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            So we know who to deliver to and can confirm your order by phone.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Full name *"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <input
              type="tel"
              placeholder="Phone number *"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <input
              type="text"
              placeholder="Delivery address *"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setHasAlt((v) => !v)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border text-sm hover:bg-muted transition-colors text-left"
            >
              <span className="text-muted-foreground">Someone else is receiving this order</span>
              <span className="text-xs text-muted-foreground">{hasAlt ? "▲ optional" : "▼ optional"}</span>
            </button>
            {hasAlt && (
              <div className="pl-4 border-l-2 border-border space-y-3">
                <input
                  type="text"
                  placeholder="Recipient's name"
                  value={altName}
                  onChange={(e) => setAltName(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Recipient's phone"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            )}
            {customerReady && (
              <div className="flex items-center gap-2 text-xs text-[#0F9E0F]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Details saved — you can now order from any item below</span>
              </div>
            )}
          </div>
        </section>

        {/* ── Platters ─────────────────────────────────────────────────── */}
        <section>
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-display mb-2">Platters</h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Every platter is ₦190,000 or more and includes your choice of wine, your pepper blend selection,
              and exactly 2 complimentary drinks.
            </p>
            <div className="mt-4 flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-2xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Car delivery required.</strong> Platters are multi-compartment and can't safely travel by bike.
                Call <a href="tel:+2348105506052" className="underline font-semibold">{"+234 (810)-550-6052"}</a> for a car delivery quote,
                or arrange your own pickup — your WhatsApp order message will include this note.
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {PLATTERS.map((item) => (
              <PlatterCard
                key={item.name}
                item={item}
                wine={getWine(item.name)}
                blends={getBlends(item.name)}
                drinks={getDrinks(item.name)}
                delivInfo={delivInfo}
                deliveryOk={plattersDelivOk}
                customerReady={customerReady}
                custInfo={custInfo}
                onWine={(w) => setWine(item.name, w)}
                onBlend={(b) => setBlends(item.name, b)}
                onDrink={(d) => setDrinks(item.name, d)}
              />
            ))}
          </div>
        </section>

        {/* ── Trays ────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-display mb-2">Trays</h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Our original food tray tiers, restored and updated. Each includes exactly 4 complimentary drinks of
              your choice — no wine, no pepper blend.
            </p>
            <div className="mt-4 flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-2xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Car delivery required.</strong> Food trays can't safely travel by bike.
                Call <a href="tel:+2348105506052" className="underline font-semibold">{"+234 (810)-550-6052"}</a> for a car delivery quote,
                or arrange your own pickup — your WhatsApp order message will include this note.
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {TRAYS.map((item) => (
              <TrayCard
                key={item.name}
                item={item}
                drinks={getDrinks(item.name)}
                delivInfo={delivInfo}
                deliveryOk={traysDelivOk}
                customerReady={customerReady}
                custInfo={custInfo}
                onDrink={(d) => setDrinks(item.name, d)}
              />
            ))}
          </div>
        </section>

        {/* ── Small Chop Boxes ─────────────────────────────────────────── */}
        <section>
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-display mb-2">Small Chop Boxes</h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Small chops, four sizes. Starter and Mini are pure snack boxes with no drinks. Full adds protein
              variety and 2 free drinks of your choice. Premium comes with 5 fixed drinks plus water — nothing
              to select. Same-day delivery available if you order between 6–9 AM; rush fee applies.
            </p>

            {/* Small Chops delivery option picker */}
            <div className="mt-6 bg-muted/50 border border-border rounded-2xl p-5 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold">How should we deliver your Small Chop Box?</span>
              </div>
              <div className="space-y-2">
                {/* Option 1: Bike Delivery */}
                <button
                  type="button"
                  onClick={() => setPkgDelivMode("bike")}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all",
                    pkgDelivMode === "bike"
                      ? "border-[#0F9E0F] bg-green-50"
                      : "border-border hover:border-[#0F9E0F]/40 bg-white",
                  ].join(" ")}
                >
                  <span className={[
                    "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                    pkgDelivMode === "bike" ? "border-[#0F9E0F] bg-[#0F9E0F]" : "border-muted-foreground/30 bg-white",
                  ].join(" ")}>
                    {pkgDelivMode === "bike" && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">Bike Delivery</span>
                    <span className="text-muted-foreground font-normal"> — select your zone below</span>
                  </span>
                </button>

                {/* Zone picker (shown when bike selected) */}
                {pkgDelivMode === "bike" && (
                  <div className="ml-4 pl-4 border-l-2 border-[#0F9E0F]/20 space-y-2">
                    {BIKE_ZONES.map((zone) => {
                      const sel = pkgZoneId === zone.id;
                      const [tierPart, areaPart] = zone.label.split(" — ");
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => setPkgZoneId(zone.id as BikeZoneId)}
                          className={[
                            "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                            sel ? "border-[#0F9E0F] bg-green-50" : "border-border hover:border-[#0F9E0F]/40 bg-white",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={[
                              "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                              sel ? "border-[#0F9E0F] bg-[#0F9E0F]" : "border-muted-foreground/30 bg-white",
                            ].join(" ")}>
                              {sel && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            <span className="text-sm leading-snug min-w-0">
                              <span className="font-semibold">{tierPart}</span>
                              <span className="text-muted-foreground font-normal"> — {areaPart}</span>
                            </span>
                          </div>
                          {zone.quote ? (
                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 shrink-0 whitespace-nowrap">
                              Contact Us
                            </span>
                          ) : (
                            <span className={["text-sm font-bold shrink-0 tabular-nums whitespace-nowrap", sel ? "text-[#0F9E0F]" : "text-foreground"].join(" ")}>
                              ₦{zone.fee!.toLocaleString("en-NG")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {pkgZoneId === "t5" && (
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                        <strong>Quote-only zone.</strong> We'll confirm the exact delivery fee via WhatsApp after you send your order.
                      </div>
                    )}
                  </div>
                )}

                {/* Option 3: Own Arrangement */}
                <button
                  type="button"
                  onClick={() => { setPkgDelivMode("own"); setPkgZoneId(""); }}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all",
                    pkgDelivMode === "own"
                      ? "border-[#0F9E0F] bg-green-50"
                      : "border-border hover:border-[#0F9E0F]/40 bg-white",
                  ].join(" ")}
                >
                  <span className={[
                    "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                    pkgDelivMode === "own" ? "border-[#0F9E0F] bg-[#0F9E0F]" : "border-muted-foreground/30 bg-white",
                  ].join(" ")}>
                    {pkgDelivMode === "own" && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">My Own Arrangement</span>
                    <span className="text-muted-foreground font-normal"> — I'll collect or arrange my own delivery. No fee.</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {PACKAGES.map((item) => (
              <PackageCard
                key={item.name}
                item={item}
                drinks={getDrinks(item.name)}
                delivInfo={delivInfo}
                isToday={isToday}
                sameDayEligible={sameDayEligible}
                rushWindow={rushWindow}
                pkgDelivMode={pkgDelivMode}
                pkgZoneId={pkgZoneId}
                customerReady={customerReady}
                custInfo={custInfo}
                onDrink={(d) => setDrinks(item.name, d)}
              />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-muted border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
          <div>
            <h3 className="text-2xl font-bold font-display mb-2">Need a full catered event?</h3>
            <p className="text-muted-foreground">Our catering service covers everything from setup to service for larger events.</p>
          </div>
          <Link
            href="/catering#catering-form"
            className="shrink-0 rounded-full px-8 py-3 font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: BRAND_GREEN }}
          >
            View Catering
          </Link>
        </div>
      </div>
    </div>
  );
}
