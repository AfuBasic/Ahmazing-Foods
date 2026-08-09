import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";

import { useListMenuItems, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import {
  Loader2,
  Trash2,
  PlusCircle,
  AlertCircle,
  ShoppingCart,
  ChevronRight,
  Check,
  Minus,
  Plus,
  Users,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageCircle,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ── STATIC PRODUCTS (not in DB — used for deep-link auto-add) ───────────────
const STATIC_PRODUCTS: Record<string, number> = {
  // Seeds & Spices — hidden, restore when section is re-enabled
  // "Chili Pepper": 2000,
  // "Cameroon Pepper": 2500,
  // "Soya Mix": 2500,
  // "Cinnamon Powder": 2000,
  // "Chia Seeds": 3500,
  // "Melon Seed": 3000,
  // Snacks — hidden, restore when section is re-enabled
  // "Roasted Peanuts": 1800,
  // "Plantain Chips — Toasted & Crunchy": 2200,
  // "Plantain Chips — Ripe & Spicy": 2200,
  // "Coated Peanuts": 2000,
  // "Yogurt Mix — Seed & Nut Blend": 2800,
  // "Chin Chin": 2800,
  // "Corn Sticks": 4000,
  // "Cashew Nuts": 2800,
  // Drinks & Wellness
  "Zobo Drink": 2900,
  "Pineapple Ginger Drink": 2900,
  "Orange Juice": 2900,
  "Lemon Honey Cleanser": 3100,
  "Ginger Immune Booster": 3200,
  "Turmeric Immune Booster": 3200,
  "Yogurt Drink": 3300,
  "Tiger Nut Milk": 3300,
  "Carrot Juice": 3300,
  "Kale Cleanser": 3700,
};

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_FOOD_MEALS = 5; // soups / stews / breakfast limit
const MAX_PROTEIN_QTY = 10;
const MAX_ITEM_QTY = 20;

const DELIVERY_SLOTS = [
  "9am–11am",
  "11am–1pm",
  "1pm–3pm",
  "3pm–5pm",
  "5pm–7pm",
  "7pm–9pm",
];
const SAME_DAY_SLOTS = ["4:00–6:00 PM", "6:00–8:00 PM"];
const PEPPER_LABELS = [
  "Low 🌶️",
  "Medium 🌶️🌶️",
  "Really Peppery 🌶️🌶️🌶️",
] as const;
const PEPPER_COLORS = [
  "text-emerald-600",
  "text-amber-600",
  "text-red-600",
] as const;

const FOOD_CATS = new Set(["soups", "stews", "breakfast"]);
const isFoodCat = (cat: string) => FOOD_CATS.has(cat);

// Category display order and labels in the dropdown
const CAT_ORDER = [
  "soups",
  "stews",
  "breakfast",
  "drinks",
  "snacks",
  "spices",
  "platters",
] as const;
const CAT_LABELS: Record<string, string> = {
  soups: "Soups",
  stews: "Stews",
  breakfast: "Breakfast",
  drinks: "Drinks & Wellness",
  snacks: "Snacks",
  spices: "Seeds & Spices",
  platters: "Platters & Trays",
};

const RUSH_FEE_RATES: Record<number, number> = {
  1: 20000,
  2: 15000,
  3: 13000,
  4: 12000,
  5: 10000,
};
function calcRushFee(isRush: boolean, n: number) {
  if (!isRush) return 0;
  const c = Math.min(Math.max(n, 1), 5);
  return (RUSH_FEE_RATES[c] ?? 10000) * c;
}

// ── DELIVERY ZONES (bike delivery — ceiling prices, bike-eligible categories only) ──
const DELIVERY_ZONES = [
  {
    id: "t1",
    tier: "1",
    label: "Tier 1 — Lekki, Ikate, VGC, Chevron, Igbo-Efon",
    fee: 4500,
    quote: false,
  },
  {
    id: "t1b",
    tier: "1B",
    label: "Tier 1B — Ajah, Abraham Adesanya, Lakowe, Awoyaya, Ogombo",
    fee: 6500,
    quote: false,
  },
  {
    id: "t2",
    tier: "2",
    label:
      "Tier 2 — Lagos Island, Marina, Apapa, VI, Ikoyi, Banana Island, Yaba, Surulere",
    fee: 8500,
    quote: false,
  },
  {
    id: "t3",
    tier: "3",
    label: "Tier 3 — Ikeja, Maryland, Gbagada, Anthony, Ojota",
    fee: 10500,
    quote: false,
  },
  {
    id: "t4",
    tier: "4",
    label:
      "Tier 4 — Festac, Oshodi, Isolo, Mushin, Amuwo-Odofin, Alimosho, Agege",
    fee: 12500,
    quote: false,
  },
  {
    id: "t5",
    tier: "5",
    label: "Tier 5 — Ikorodu, Badagry, Epe, far Ibeju-Lekki",
    fee: null,
    quote: true,
  },
] as const;
type DeliveryZoneId = (typeof DELIVERY_ZONES)[number]["id"];

// ── TYPES ────────────────────────────────────────────────────────────────────
interface SelProtein {
  name: string;
  qty: number;
  extraCost: number;
}

interface CartItem {
  id: string;
  menuItemId: number;
  menuItemName: string;
  category: string;
  selectedSize: string;
  itemQty: number; // how many of this item
  selectedProteins: SelProtein[]; // multiple proteins each with qty
  price: number; // itemQty × (basePrice + sum(protein.extraCost × protein.qty))
}

// ── FORM SCHEMA ───────────────────────────────────────────────────────────────
const customerSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  deliveryAddress: z.string().min(5, "Please enter your delivery address"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliverySlot: z.string().min(1, "Delivery slot is required"),
  notes: z.string().optional(),
  recipientName: z.string().optional().or(z.literal("")),
  recipientPhone: z.string().optional().or(z.literal("")),
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────────────────────
function scrollTo(el: HTMLElement | null, delay = 140) {
  if (!el) return;
  const t = setTimeout(
    () => el.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    delay,
  );
  return () => clearTimeout(t);
}

// ── QUANTITY CONTROL ──────────────────────────────────────────────────────────
function QtyControl({
  value,
  min = 1,
  max = MAX_ITEM_QTY,
  onChange,
  size = "md",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8";
  const num = size === "sm" ? "w-8 text-sm" : "w-10 text-base";
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btn} rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-30`}
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className={`${num} text-center font-bold tabular-nums`}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btn} rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-30`}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── SUB-STEP LABEL ─────────────────────────────────────────────────────────────
function SubStepLabel({
  letter,
  done,
  children,
}: {
  letter: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm font-semibold flex items-center gap-2">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors duration-300 ${
          done
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground border border-border"
        }`}
      >
        {done ? <Check className="w-2.5 h-2.5" /> : letter}
      </span>
      {children}
    </label>
  );
}

// ── CART LINE DESCRIPTION ─────────────────────────────────────────────────────
function cartLineDesc(item: CartItem): string {
  const qty = item.itemQty > 1 ? ` ×${item.itemQty}` : "";
  const prots = item.selectedProteins
    .map((p) => `${p.name}${p.qty > 1 ? ` ×${p.qty}` : ""}`)
    .join(", ");
  return `${item.selectedSize}${qty}${prots ? ` + ${prots}` : ""}`;
}

// ── SEARCHABLE ITEM SELECT COMBOBOX ──────────────────────────────────────────
function SearchableItemSelect({
  items,
  loading,
  selectedId,
  onSelect,
}: {
  items: any[];
  loading: boolean;
  selectedId: number;
  onSelect: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedId),
    [items, selectedId]
  );

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase().trim();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.category && i.category.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q))
    );
  }, [items, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={loading}
          className="w-full h-12 justify-between text-base px-4 bg-background font-normal border-border hover:bg-muted/50 transition-colors"
        >
          {loading ? (
            <span className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading menu items...
            </span>
          ) : selectedItem ? (
            <span className="font-bold text-foreground truncate flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold rounded-md bg-primary/10 text-primary shrink-0">
                {CAT_LABELS[selectedItem.category] || selectedItem.category}
              </span>
              <span className="truncate">{selectedItem.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground truncate">
              Search or select a dish, drink, snack, spice, platter...
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border border-border shadow-xl overflow-hidden" align="start">
        {/* Search Bar */}
        <div className="p-3 border-b border-border bg-muted/40 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search (e.g. Okro, Platter, Zobo, Egusi, Chin Chin...)"
            className="w-full bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs text-muted-foreground hover:text-foreground font-bold px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Grouped Items List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/40 p-1">
          {CAT_ORDER.map((cat) => {
            const catItems = filteredItems.filter((i) => i.available && i.category === cat);
            if (!catItems.length) return null;
            return (
              <div key={cat} className="py-1">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 sticky top-0 z-10 flex items-center justify-between">
                  <span>{CAT_LABELS[cat] || cat}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground/75">
                    {catItems.length} item{catItems.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {catItems.map((item) => {
                  const isSelected = item.id === selectedId;
                  const minPrice = item.sizes?.[0]?.price;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.id.toString());
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-colors group hover:bg-primary/10",
                        isSelected ? "bg-primary/15 font-bold text-primary" : "text-foreground"
                      )}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate font-medium group-hover:text-primary">
                          {item.name}
                        </span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground truncate font-normal">
                            {item.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {minPrice && (
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">
                            {formatNaira(minPrice)}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No items matching "<strong className="text-foreground">{search}</strong>" found.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function BookPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: menuItems, isLoading: loadingMenu } = useListMenuItems(
    {},
    { query: { queryKey: ["menuItems"] } },
  );
  const createOrder = useCreateOrder();
  const [hasAltRecipient, setHasAltRecipient] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneId | "">("");
  const [deliveryMode, setDeliveryMode] = useState<"bike" | "car" | "own" | "">(
    "bike",
  );
  const [carZone, setCarZone] = useState<DeliveryZoneId | "">("");
  // Named item that last forced bike off (shown as inline explanation)
  const [bikeBlockReason, setBikeBlockReason] = useState<string | null>(null);

  // ── CART ────────────────────────────────────────────────────────────────────
  const {
    cart,
    addToCart: addGlobalCart,
    removeFromCart,
    clearCart,
    cartTotal,
  } = useCart();
  const [pepperLevel, setPepperLevel] = useState<number>(1);
  const [pepperTouched, setPepperTouched] = useState(true);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  // ── CONFIGURATOR STATE ────────────────────────────────────────────────────
  const [configItemId, setConfigItemId] = useState<number>(0);
  const [configSize, setConfigSize] = useState<string>("");
  const [itemQty, setItemQty] = useState<number>(1);
  // proteins: Record<proteinName, qty>
  const [proteins, setProteins] = useState<Record<string, number>>({});

  // ── SCROLL REFS ────────────────────────────────────────────────────────────
  const sizeRef = useRef<HTMLDivElement>(null);
  const qtyRef = useRef<HTMLDivElement>(null);
  const proteinRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLDivElement>(null);
  const pepperRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);

  // ── DEEP-LINK: pre-fill cart from URL params ──────────────────────────────
  const deepLinkDone = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deepLinkParams = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      cat: p.get("cat") ?? "",
      item: p.get("item") ?? "",
      size: p.get("size") ?? "",
      qty: Math.max(1, parseInt(p.get("qty") ?? "1", 10) || 1),
    };
  }, []);

  // ── FORM ───────────────────────────────────────────────────────────────────
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryAddress: "",
      deliveryDate: "",
      deliverySlot: "",
      notes: "",
    },
  });
  const deliveryDate = form.watch("deliveryDate");
  const deliverySlot = form.watch("deliverySlot");

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const configItem = useMemo(
    () => menuItems?.find((m) => m.id === configItemId),
    [menuItems, configItemId],
  );
  const hasProteins = !!(configItem && configItem.proteins.length > 0);
  const isFood = !!(configItem && isFoodCat(configItem.category));
  const distinctFoodIds = useMemo(
    () =>
      new Set(
        cart.filter((i) => isFoodCat(i.category)).map((i) => i.menuItemId),
      ),
    [cart],
  );
  // Same-day delivery is ONLY available when ordering between 6 AM and 9 AM.
  // After 9 AM, today's date is removed from the date picker entirely.
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const currentHour = now.getHours();
  const sameDayAvailable = currentHour >= 6 && currentHour < 9;

  // ── REACTIVE: car-only detection (derived fresh from live cart every render) ──
  // "platters" category in book.tsx maps to Platters & Trays — car-only per delivery rules
  const carOnlyCartItem = useMemo(
    () => cart.find((i) => i.category === "platters"),
    [cart],
  );
  const cartRequiresCar = !!carOnlyCartItem;

  const isRushDay = useMemo(
    () => !!deliveryDate && deliveryDate === todayStr,
    [deliveryDate, todayStr],
  );
  const rushFee = useMemo(
    () => calcRushFee(isRushDay, distinctFoodIds.size),
    [isRushDay, distinctFoodIds.size],
  );

  // Sunday = no orders (rest day). Deliveries can still happen on Sunday.
  const isSundayToday = new Date().getDay() === 0;

  // Pre-filled WhatsApp URL for car delivery quote requests — includes area + date + full cart
  const carWaUrl = useMemo(() => {
    const carZoneObj = DELIVERY_ZONES.find((z) => z.id === carZone);
    const lines = [
      "🚗 *Car Delivery Quote Request*",
      "",
      "Hi AHmazing Foods! I'm placing an order and need a car delivery quote.",
      "",
      ...(carZoneObj ? [`*Delivery area:* ${carZoneObj.label}`] : []),
      ...(deliveryDate ? [`*Delivery date:* ${deliveryDate}`] : []),
      ...(deliverySlot ? [`*Delivery window:* ${deliverySlot}`] : []),
      "",
      "*My cart:*",
      ...cart.map(
        (ci, i) =>
          `${i + 1}. ${ci.menuItemName} — ${cartLineDesc(ci)} (${formatNaira(ci.price)})`,
      ),
      "",
      `*Cart total (excl. delivery):* ${formatNaira(cartTotal)}`,
      "",
      "Please contact me to discuss and confirm the car delivery fee.",
      "",
      "---",
      "PAY BY TRANSFER:",
      "Account Name: Ahmazing Cuisine",
      "Bank: FCMB",
      "Account Number: 1009414545",
    ];
    return `https://wa.me/2348105506052?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [cart, cartTotal, carZone, deliveryDate, deliverySlot]);

  const selectedZone = DELIVERY_ZONES.find((z) => z.id === deliveryZone);
  const deliveryFee =
    deliveryMode === "bike" && selectedZone && !selectedZone.quote
      ? (selectedZone.fee ?? 0)
      : 0;
  const grandTotal = cartTotal + rushFee + deliveryFee;

  // Live price for the item being configured
  const proteinSubtotal = useMemo(
    () =>
      Object.entries(proteins).reduce((sum, [name, qty]) => {
        const p = configItem?.proteins.find((p) => p.name === name);
        return sum + (p?.extraCost ?? 0) * qty;
      }, 0),
    [proteins, configItem],
  );
  const configUnitPrice = useMemo(() => {
    if (!configItem || !configSize) return 0;
    const base =
      configItem.sizes.find((s) => s.label === configSize)?.price ?? 0;
    return base + proteinSubtotal;
  }, [configItem, configSize, proteinSubtotal]);
  const configPrice = configUnitPrice * itemQty;

  const canAddToCart = useMemo(() => {
    if (!configItem || !configSize) return false;
    if (
      isFood &&
      !distinctFoodIds.has(configItemId) &&
      distinctFoodIds.size >= MAX_FOOD_MEALS
    )
      return false;
    return true;
  }, [configItem, configSize, configItemId, isFood, distinctFoodIds]);

  const availableDates = useMemo(() => {
    // Same-day (index 0 = today) only available when ordering 6–9 AM.
    // Outside that window, start from tomorrow.
    const startOffset = sameDayAvailable ? 0 : 1;
    return Array.from({ length: 14 }).map((_, i) =>
      format(addDays(new Date(), startOffset + i), "yyyy-MM-dd"),
    );
  }, [sameDayAvailable]);

  // ── REACTIVE: clear Bike selection the instant a car-only item enters cart ──
  // Runs every time cartRequiresCar flips. Uses functional updater so deliveryMode
  // is not a stale dependency that would cause an infinite loop.
  useEffect(() => {
    if (!cartRequiresCar) {
      // All car-only items gone — clear the block reason so Bike re-appears
      setBikeBlockReason(null);
      return;
    }
    // Cart now contains at least one car-only item. If bike was selected, cancel it.
    setDeliveryMode((prev) => {
      if (prev === "bike") {
        setDeliveryZone("");
        setBikeBlockReason(carOnlyCartItem!.menuItemName);
        return "";
      }
      return prev;
    });
  }, [cartRequiresCar]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── RESET: clear all delivery state when cart is fully emptied ────────────
  useEffect(() => {
    if (cart.length === 0) {
      setDeliveryMode("");
      setDeliveryZone("");
      setCarZone("");
      setBikeBlockReason(null);
    }
  }, [cart.length]);

  // ── RESET configurator when dish changes ─────────────────────────────────
  useEffect(() => {
    setConfigSize("");
    setItemQty(1);
    setProteins({});
  }, [configItemId]);

  // ── RESET itemQty when size changes ───────────────────────────────────────
  useEffect(() => {
    setItemQty(1);
  }, [configSize]);

  // ── AUTO-SCROLL: dish selected → size ────────────────────────────────────
  useEffect(() => {
    if (configItem) return scrollTo(sizeRef.current);
  }, [configItem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AUTO-SCROLL: size selected → qty/protein/addBtn ──────────────────────
  useEffect(() => {
    if (!configSize || !configItem) return;
    // scroll to protein if food with proteins, otherwise to quantity/add area
    return hasProteins
      ? scrollTo(proteinRef.current)
      : scrollTo(qtyRef.current);
  }, [configSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AUTO-SCROLL: first protein ticked → add button ───────────────────────
  const prevProteinCount = useRef(0);
  useEffect(() => {
    const n = Object.keys(proteins).length;
    if (n === 1 && prevProteinCount.current === 0) scrollTo(addBtnRef.current);
    prevProteinCount.current = n;
  }, [proteins]);

  // ── DEEP-LINK: auto-add item from URL params when menu loads ──────────────
  useEffect(() => {
    if (deepLinkDone.current) return;
    if (!deepLinkParams.cat || !deepLinkParams.item) return;

    // Products are static (not in DB) — handle without waiting for API
    if (deepLinkParams.cat === "products") {
      const unitPrice = STATIC_PRODUCTS[deepLinkParams.item];
      if (!unitPrice) return;
      const MIN_DRINK_QTY = 6;
      const itemQty = Math.max(MIN_DRINK_QTY, deepLinkParams.qty);
      deepLinkDone.current = true;
      if (
        !cart.some(
          (i) =>
            i.category === "products" && i.menuItemName === deepLinkParams.item,
        )
      ) {
        addGlobalCart({
          id: `dl-prod-${Date.now()}`,
          menuItemId: 0,
          menuItemName: deepLinkParams.item,
          category: "products",
          selectedSize: "Standard",
          itemQty,
          selectedProteins: [],
          price: unitPrice * itemQty,
        });
      }
      setJustAdded(deepLinkParams.item);
      setTimeout(() => setJustAdded(null), 6000);
      return;
    }

    if (!menuItems?.length) return;
    const found = menuItems.find(
      (m) =>
        m.category === deepLinkParams.cat &&
        m.name.toLowerCase() === deepLinkParams.item.toLowerCase(),
    );
    if (!found) return;
    const sizeObj = deepLinkParams.size
      ? (found.sizes.find((s) => s.label === deepLinkParams.size) ??
        found.sizes[0])
      : found.sizes[0];
    if (!sizeObj) return;
    deepLinkDone.current = true;
    if (
      !cart.some(
        (i) => i.menuItemId === found.id && i.selectedSize === sizeObj.label,
      )
    ) {
      addGlobalCart({
        id: `dl-${found.id}-${Date.now()}`,
        menuItemId: found.id,
        menuItemName: found.name,
        category: found.category,
        selectedSize: sizeObj.label,
        itemQty: 1,
        selectedProteins: [],
        price: sizeObj.price,
      });
    }
    setJustAdded(found.name);
    setTimeout(() => setJustAdded(null), 6000);
  }, [menuItems, deepLinkParams, cart, addGlobalCart]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  function selectDish(val: string) {
    setConfigItemId(parseInt(val));
  }

  function toggleProtein(name: string) {
    setProteins((prev) => {
      if (prev[name] !== undefined) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: 1 };
    });
  }

  function setProteinQty(name: string, qty: number) {
    setProteins((prev) => ({
      ...prev,
      [name]: Math.max(1, Math.min(MAX_PROTEIN_QTY, qty)),
    }));
  }

  function addToCart() {
    if (!configItem || !configSize) return;
    const selProteins: SelProtein[] = Object.entries(proteins).map(
      ([name, qty]) => {
        const p = configItem.proteins.find((p) => p.name === name);
        return { name, qty, extraCost: p?.extraCost ?? 0 };
      },
    );
    const name = configItem.name;
    addGlobalCart({
      id: crypto.randomUUID(),
      menuItemId: configItem.id,
      menuItemName: name,
      category: configItem.category,
      selectedSize: configSize,
      itemQty,
      selectedProteins: selProteins,
      price: configPrice,
    });
    setConfigItemId(0);
    setJustAdded(name);
    setTimeout(() => setJustAdded(null), 4000);
    toast({
      title: "Added to cart",
      description: `${name} — ${configSize}${itemQty > 1 ? ` ×${itemQty}` : ""}`,
    });
    scrollTo(step1Ref.current, 240);
  }

  function onSubmit(values: z.infer<typeof customerSchema>) {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Add at least one item before booking.",
      });
      return;
    }
    if (!pepperTouched) {
      toast({
        variant: "destructive",
        title: "Pepper level required",
        description: "Please set your pepper preference before confirming.",
      });
      scrollTo(pepperRef.current, 0);
      return;
    }
    if (!deliveryMode) {
      toast({
        variant: "destructive",
        title: "Delivery option required",
        description: "Please choose a delivery option in Step 3.",
      });
      return;
    }
    if (deliveryMode === "bike" && !deliveryZone) {
      toast({
        variant: "destructive",
        title: "Delivery zone required",
        description: "Please select your delivery zone in Step 3.",
      });
      return;
    }
    // Prefer the first DB-backed item as primary so the API can look it up;
    // fall back to cart[0] only if the cart is entirely static products.
    const primary = cart.find((i) => i.menuItemId > 0) ?? cart[0];
    const cartSummary = cart
      .map(
        (ci, i) =>
          `${i + 1}. ${ci.menuItemName} — ${cartLineDesc(ci)} (${formatNaira(ci.price)})`,
      )
      .join("\n");
    const notesStr =
      [
        `CART (${cart.length} item${cart.length === 1 ? "" : "s"}):\n${cartSummary}`,
        `Pepper: ${PEPPER_LABELS[pepperLevel]}`,
        `Delivery: ${values.deliveryDate} · ${values.deliverySlot}`,
        rushFee > 0
          ? `Subtotal: ${formatNaira(cartTotal)} + Rush fee: ${formatNaira(rushFee)} = Total: ${formatNaira(grandTotal)}`
          : `Total: ${formatNaira(grandTotal)}`,
        `Customer: ${values.customerName} | ${values.customerPhone}${values.customerEmail ? ` | ${values.customerEmail}` : ""}`,
        `Delivery address: ${values.deliveryAddress}`,
        deliveryMode === "own"
          ? "Delivery option: Customer's own arrangement — no delivery fee"
          : deliveryMode === "car"
            ? (() => {
                const z = DELIVERY_ZONES.find((z) => z.id === carZone);
                return `🚗 CAR DELIVERY — FEE TO BE CONFIRMED\nArea: ${z ? z.label : "not specified"}\nContact the customer to agree on the delivery fee before cooking starts.`;
              })()
            : selectedZone
              ? `Delivery zone: ${selectedZone.label}${!selectedZone.quote ? ` — Fee: ${formatNaira(selectedZone.fee ?? 0)}` : " — Fee: to be quoted via WhatsApp"}`
              : "",
        hasAltRecipient && values.recipientName
          ? `Recipient (receiving order): ${values.recipientName}${values.recipientPhone ? ` | ${values.recipientPhone}` : ""}`
          : "",
        values.notes ? `Customer notes: ${values.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n\n") +
      "\n\n---\nPAYMENT DETAILS\nAccount Name: Ahmazing Cuisine\nBank: FCMB\nAccount Number: 1009414545";

    createOrder.mutate(
      {
        data: {
          menuItemId: primary.menuItemId,
          selectedSize: primary.selectedSize,
          selectedProtein: primary.selectedProteins[0]?.name ?? null,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerEmail: values.customerEmail || undefined,
          deliveryAddress: values.deliveryAddress,
          deliveryDate: values.deliveryDate as unknown as Date,
          deliverySlot: values.deliverySlot,
          notes: notesStr,
          cartItems: cart,
          pepperLevel: PEPPER_LABELS[pepperLevel],
        },
      },
      {
        onSuccess: (order) => {
          const ref = `AHM-${order.id.toString().padStart(4, "0")}`;
          const cartSummary = cart
            .map(
              (ci, i) =>
                `${i + 1}. *${ci.menuItemName}* (${ci.selectedSize}) — ${formatNaira(ci.price)}${
                  ci.selectedProteins.length > 0
                    ? `\n   Proteins: ${ci.selectedProteins.map((p) => `${p.name} ×${p.qty}`).join(", ")}`
                    : ""
                }`,
            )
            .join("\n\n");

          const waLines = [
            `Hi AHmazing Foods! I just placed an order on your website and I'm sending my details to confirm.`,
            ``,
            `*Booking Ref:* ${ref}`,
            `*Name:* ${values.customerName}`,
            `*Phone:* ${values.customerPhone}`,
            values.customerEmail ? `*Email:* ${values.customerEmail}` : null,
            `*Delivery Address:* ${values.deliveryAddress}`,
            `*Delivery Date:* ${values.deliveryDate}`,
            `*Time Slot:* ${values.deliverySlot}`,
            deliveryMode === "own"
              ? `*Delivery Mode:* Customer's own arrangement`
              : deliveryMode === "car"
                ? `*Delivery Mode:* Car Delivery`
                : selectedZone
                  ? `*Delivery Zone:* ${selectedZone.label}`
                  : null,
            hasAltRecipient && values.recipientName
              ? `*Recipient:* ${values.recipientName} (${values.recipientPhone ?? ""})`
              : null,
            ``,
            `*ITEMS ORDERED:*`,
            cartSummary,
            ``,
            `*Pepper Preference:* ${PEPPER_LABELS[pepperLevel]}`,
            rushFee > 0
              ? `Subtotal: ${formatNaira(cartTotal)}\nRush Fee: ${formatNaira(rushFee)}\n*TOTAL:* ${formatNaira(grandTotal)}`
              : `*TOTAL:* ${formatNaira(grandTotal)}`,
            ``,
            `Payment will be transferred to:`,
            `Bank: FCMB | Account: Ahmazing Cuisine | Acc No: 1009414545`,
            `(narration: ${ref})`,
            ``,
            `Please confirm receipt so I can proceed with payment. Thank you!`,
          ].filter(Boolean);

          const waUrl = `https://wa.me/2348105506052?text=${encodeURIComponent(waLines.join("\n"))}`;

          // Clear global cart so header badge and summary update to 0
          clearCart();

          toast({
            title: "Order Created!",
            description: "Opening WhatsApp with your order receipt...",
          });

          // Open WhatsApp in new tab, or fallback to current window
          const win = window.open(waUrl, "_blank");
          if (!win || win.closed || typeof win.closed === "undefined") {
            window.location.href = waUrl;
          } else {
            setLocation(`/booking-confirmed/${order.id}`);
          }
        },
        onError: (err) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const msg =
            (err as any)?.data?.error ||
            (err as any)?.message ||
            "Failed to create booking";
          toast({
            variant: "destructive",
            title: "Booking Error",
            description: msg,
          });
        },
      },
    );
  }

  const isSubmitting = createOrder.isPending;
  const canSubmit =
    cart.length > 0 &&
    pepperTouched &&
    deliveryMode !== "" &&
    (deliveryMode !== "bike" || deliveryZone !== "") &&
    (deliveryMode !== "car" || carZone !== "") &&
    !isSubmitting &&
    !isSundayToday;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-muted/30 pb-24"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Header */}
      <div className="bg-foreground text-background pt-16 pb-20 rounded-b-[3rem] shadow-xl mb-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-4">
            Book a Slot
          </h1>
          <p className="text-xl text-background/70 max-w-xl">
            Build your full order — meals, drinks, snacks, platters. Everything
            lands in one cart with a live total.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* ── SUNDAY CLOSED BANNER ────────────────────────────────────────── */}
        {isSundayToday && (
          <div className="mb-8 rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-5 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-lg mb-1">
                We're closed for orders today — it's Sunday!
              </p>
              <p className="text-sm text-red-700 leading-relaxed">
                Sundays are our rest day. You're welcome to browse the menu, but
                bookings open again from Monday. If you need a delivery today,
                it means your order was placed yesterday — contact us on{" "}
                <a
                  href="https://wa.me/2348105506052"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  WhatsApp
                </a>
                .
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ═══ LEFT COLUMN ════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-8">
            {/* ── STEP 1: ITEM BUILDER ─────────────────────────────────── */}
            <div
              ref={step1Ref}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="flex items-start gap-3 px-6 md:px-8 py-5 border-b border-border bg-muted/40">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold font-display leading-tight">
                    Build Your Order
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pick any item — meals, drinks, snacks, platters. Set size,
                    quantity and proteins, then add to cart. Repeat as needed.
                  </p>
                </div>
                {cart.length > 0 && (
                  <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-1 self-center">
                    {cart.length} item{cart.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="p-6 md:p-8 space-y-7">
                {/* Just-added banner */}
                {justAdded && (
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    <span>
                      <strong>{justAdded}</strong> added. Choose another item
                      below to keep building your order.
                    </span>
                  </div>
                )}

                {/* Food meal dots (soups/stews/breakfast only) */}
                {distinctFoodIds.size > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      {Array.from({ length: MAX_FOOD_MEALS }).map((_, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border-2 transition-all duration-300"
                          style={{
                            background:
                              i < distinctFoodIds.size
                                ? "#0F9E0F"
                                : "transparent",
                            borderColor:
                              i < distinctFoodIds.size ? "#0F9E0F" : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                    <span>
                      {distinctFoodIds.size}/{MAX_FOOD_MEALS} distinct meals
                      (drinks & snacks are unlimited)
                    </span>
                  </div>
                )}

                {/* ── A: Select item ─────────────────────────────────── */}
                <div className="space-y-2.5">
                  <SubStepLabel letter="A" done={!!configItem}>
                    Choose an Item
                  </SubStepLabel>
                  <SearchableItemSelect
                    items={menuItems ?? []}
                    loading={loadingMenu}
                    selectedId={configItemId}
                    onSelect={selectDish}
                  />
                </div>

                {/* ── B: Size ────────────────────────────────────────── */}
                {configItem && (
                  <div
                    ref={sizeRef}
                    className="space-y-2.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
                  >
                    <SubStepLabel letter="B" done={!!configSize}>
                      Choose Size
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        — {configItem.name}
                      </span>
                    </SubStepLabel>
                    <div
                      className={`grid gap-2 ${configItem.sizes.length > 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3"}`}
                    >
                      {configItem.sizes.map((size) => {
                        const sel = configSize === size.label;
                        return (
                          <button
                            key={size.label}
                            type="button"
                            onClick={() => setConfigSize(size.label)}
                            className={`relative text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                              sel
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/50"
                            }`}
                          >
                            {sel && (
                              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </span>
                            )}
                            <div className="font-medium text-sm pr-5">
                              {size.label}
                            </div>
                            <div className="font-bold text-base mt-0.5">
                              {formatNaira(size.price)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── C: Proteins — shown before qty for food items ─── */}
                {configItem && configSize && hasProteins && (
                  <div
                    ref={proteinRef}
                    className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300"
                  >
                    <SubStepLabel
                      letter="C"
                      done={Object.keys(proteins).length > 0}
                    >
                      Add Proteins
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        — tick all you want, then set quantities
                      </span>
                    </SubStepLabel>

                    {/* Protein grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setProteins({})}
                        className={`text-center px-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                          Object.keys(proteins).length === 0
                            ? "border-border bg-muted"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                      >
                        <div className="text-[11px] font-medium text-muted-foreground">
                          No protein
                        </div>
                        <div className="text-xs font-bold mt-0.5">—</div>
                      </button>
                      {configItem.proteins.map((p) => {
                        const selected = proteins[p.name] !== undefined;
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => toggleProtein(p.name)}
                            className={`relative text-center px-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                              selected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/50"
                            }`}
                          >
                            {selected && (
                              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </span>
                            )}
                            <div className="text-[11px] font-medium leading-tight pr-2">
                              {p.name}
                            </div>
                            <div className="text-xs font-bold mt-0.5 text-primary">
                              +{formatNaira(p.extraCost)}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Per-protein quantity rows */}
                    {Object.keys(proteins).length > 0 && (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        {Object.entries(proteins).map(([name, qty]) => {
                          const p = configItem.proteins.find(
                            (p) => p.name === name,
                          );
                          return (
                            <div
                              key={name}
                              className="flex items-center gap-3 px-4 py-2.5 bg-muted/60 border border-border rounded-xl"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate">
                                  {name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatNaira(p?.extraCost ?? 0)} per piece
                                </div>
                              </div>
                              <QtyControl
                                value={qty}
                                max={MAX_PROTEIN_QTY}
                                onChange={(n) => setProteinQty(name, n)}
                                size="sm"
                              />
                              <div className="text-sm font-bold text-primary w-20 text-right tabular-nums shrink-0">
                                +{formatNaira((p?.extraCost ?? 0) * qty)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── D: Item quantity + live price + Add to Cart ──────── */}
                {configItem && configSize && (
                  <div ref={qtyRef} className="animate-in fade-in duration-200">
                    {/* Quantity of this item */}
                    <div
                      ref={!hasProteins ? addBtnRef : undefined}
                      className="flex items-center gap-4 px-4 py-3 bg-muted/40 border border-border rounded-xl mb-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">
                          {isFood
                            ? "Quantity"
                            : `How many ${configItem.name.toLowerCase().includes("drink") ? "bottles" : "packs"}?`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatNaira(configUnitPrice)} each
                        </div>
                      </div>
                      <QtyControl
                        value={itemQty}
                        max={MAX_ITEM_QTY}
                        onChange={setItemQty}
                      />
                      <div
                        className="text-base font-bold text-right tabular-nums shrink-0 w-24"
                        style={{ color: "#0F9E0F" }}
                      >
                        {formatNaira(configPrice)}
                      </div>
                    </div>

                    {/* Price breakdown line */}
                    {(itemQty > 1 || Object.keys(proteins).length > 0) && (
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mb-3 px-1">
                        <span>{configItem.name}</span>
                        <span>·</span>
                        <span>{configSize}</span>
                        {Object.entries(proteins).map(([n, q]) => (
                          <span key={n}>
                            · {n}
                            {q > 1 ? ` ×${q}` : ""}
                          </span>
                        ))}
                        {itemQty > 1 && (
                          <span>
                            · <strong>×{itemQty} items</strong>
                          </span>
                        )}
                        <span className="ml-auto font-bold text-foreground">
                          {formatNaira(configPrice)}
                        </span>
                      </div>
                    )}

                    <div ref={hasProteins ? addBtnRef : undefined}>
                      <Button
                        type="button"
                        onClick={addToCart}
                        disabled={!canAddToCart}
                        className="w-full h-12 text-base font-bold gap-2 rounded-xl"
                        style={{ background: "#0F9E0F" }}
                      >
                        <PlusCircle className="w-5 h-5" />
                        Add to Cart
                        {cart.length > 0 && ` (${cart.length + 1} items total)`}
                      </Button>
                      {isFood &&
                        !distinctFoodIds.has(configItemId) &&
                        distinctFoodIds.size >= MAX_FOOD_MEALS && (
                          <p className="text-xs text-amber-600 text-center mt-2">
                            Maximum {MAX_FOOD_MEALS} distinct meals reached.
                            Remove one to add a different meal.
                          </p>
                        )}
                    </div>
                  </div>
                )}

                {/* ── Cart preview ─────────────────────────────────────── */}
                {cart.length > 0 && (
                  <div className="rounded-xl border border-border overflow-hidden animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold text-sm">Cart</span>
                      <span
                        className="ml-auto font-bold text-sm tabular-nums"
                        style={{ color: "#0F9E0F" }}
                      >
                        {formatNaira(cartTotal)}
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {item.menuItemName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {cartLineDesc(item)}
                            </div>
                          </div>
                          <div className="font-bold text-sm tabular-nums shrink-0">
                            {formatNaira(item.price)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── STEP 2: PEPPER ─────────────────────────────────────────── */}
            <div
              ref={pepperRef}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-muted/40">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <h2 className="text-xl font-bold font-display">How Hot?</h2>
                {pepperTouched ? (
                  <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Set
                  </span>
                ) : (
                  <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Required
                  </span>
                )}
              </div>
              <div className="p-6 md:p-8">
                <p className="text-sm text-muted-foreground mb-6">
                  This applies to all the food in your cart. Drinks, snacks and
                  platters are not affected.
                </p>

                {/* 3-segment pepper picker */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      level: 0,
                      label: "Low",
                      sub: "Mild & gentle",
                      chilies: 1,
                      activeClass: "border-emerald-500 bg-emerald-50",
                      activeLabelClass: "text-emerald-700",
                      dotClass: "bg-emerald-500",
                    },
                    {
                      level: 1,
                      label: "Medium",
                      sub: "Some heat",
                      chilies: 2,
                      activeClass: "border-amber-500 bg-amber-50",
                      activeLabelClass: "text-amber-700",
                      dotClass: "bg-amber-500",
                    },
                    {
                      level: 2,
                      label: "Really Peppery",
                      sub: "Full fire",
                      chilies: 3,
                      activeClass: "border-red-500 bg-red-50",
                      activeLabelClass: "text-red-700",
                      dotClass: "bg-red-500",
                    },
                  ].map(
                    ({
                      level,
                      label,
                      sub,
                      chilies,
                      activeClass,
                      activeLabelClass,
                      dotClass,
                    }) => {
                      const isSelected = pepperLevel === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setPepperLevel(level);
                            setPepperTouched(true);
                          }}
                          className={[
                            "relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 transition-all duration-150 cursor-pointer select-none",
                            isSelected
                              ? activeClass + " shadow-md scale-[1.03]"
                              : "border-border bg-muted/30 hover:bg-muted/60 hover:border-border/80",
                          ].join(" ")}
                        >
                          {/* Selected indicator dot */}
                          {isSelected && (
                            <span
                              className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${dotClass}`}
                            />
                          )}

                          {/* Chili icons — filled up to this level */}
                          <span
                            className="text-xl leading-none tracking-tight"
                            aria-hidden
                          >
                            {"🌶️".repeat(chilies)}
                          </span>

                          {/* Label */}
                          <span
                            className={`font-bold text-sm text-center leading-tight ${isSelected ? activeLabelClass : "text-foreground"}`}
                          >
                            {label}
                          </span>
                          <span className="text-xs text-muted-foreground text-center leading-tight">
                            {sub}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>

                {/* Full-width connector bar stretching edge-to-edge aligned with the 3 cards */}
                <div className="mt-6 relative px-[16.666%]">
                  <div className="absolute top-1/2 left-[16.666%] right-[16.666%] -translate-y-1/2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width:
                          pepperLevel === 0
                            ? "0%"
                            : pepperLevel === 1
                              ? "50%"
                              : "100%",
                        backgroundColor:
                          pepperLevel === 0
                            ? "#10b981"
                            : pepperLevel === 1
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    />
                  </div>
                  <div className="relative flex justify-between items-center">
                    {[0, 1, 2].map((lvl) => {
                      const active = pepperLevel >= lvl;
                      const activeColor =
                        lvl === 0
                          ? "bg-emerald-500 border-emerald-500"
                          : lvl === 1
                            ? "bg-amber-500 border-amber-500"
                            : "bg-red-500 border-red-500";
                      return (
                        <div
                          key={lvl}
                          onClick={() => {
                            setPepperLevel(lvl);
                            setPepperTouched(true);
                          }}
                          className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-300 flex items-center justify-center ${
                            active
                              ? `${activeColor} scale-110 shadow-sm`
                              : "bg-background border-border"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-3 text-center mt-2 text-xs font-semibold text-muted-foreground">
                  <span
                    className={
                      pepperLevel === 0 ? "text-emerald-700 font-bold" : ""
                    }
                  >
                    Mild
                  </span>
                  <span
                    className={
                      pepperLevel === 1 ? "text-amber-700 font-bold" : ""
                    }
                  >
                    Medium
                  </span>
                  <span
                    className={
                      pepperLevel === 2 ? "text-red-700 font-bold" : ""
                    }
                  >
                    Hot
                  </span>
                </div>
              </div>
            </div>

            {/* ── STEP 3: DELIVERY ───────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-muted/40">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <h2 className="text-xl font-bold font-display">
                  Delivery Details
                </h2>
              </div>
              <div className="p-6 md:p-8">
                <Form {...form}>
                  <form
                    id="booking-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                className="h-11"
                                placeholder="Adaeze Okonkwo"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                className="h-11"
                                placeholder="08012345678"
                                type="tel"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Email{" "}
                            <span className="text-muted-foreground font-normal">
                              (optional — for confirmation)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="h-11"
                              placeholder="you@email.com"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Input
                              className="h-11"
                              placeholder="14 Adeola Odeku, VI, Lagos"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── Delivery Option ──────────────────────────── */}
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-sm font-semibold mb-0.5">
                          Delivery <span className="text-destructive">*</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Choose how your order reaches you.
                        </p>
                      </div>

                      <div className="space-y-2">
                        {/* Option 1: Bike Delivery — dull/disabled when cart requires car */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!cartRequiresCar) setDeliveryMode("bike");
                          }}
                          disabled={cartRequiresCar}
                          className={[
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all",
                            cartRequiresCar
                              ? "border-border bg-background opacity-40 cursor-not-allowed"
                              : deliveryMode === "bike"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40 bg-background",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                              !cartRequiresCar && deliveryMode === "bike"
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30 bg-background",
                            ].join(" ")}
                          >
                            {!cartRequiresCar && deliveryMode === "bike" && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </span>
                          <span className="text-sm leading-snug">
                            <span className="font-semibold">Bike Delivery</span>
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              — select your zone below
                            </span>
                          </span>
                        </button>
                        {/* Sub-note explaining why Bike is dull */}
                        {cartRequiresCar && (
                          <p className="text-[11px] text-amber-700 pl-2 leading-relaxed">
                            {bikeBlockReason ? (
                              <>
                                Your bike selection was cleared —{" "}
                                <strong>{bikeBlockReason}</strong> requires car
                                delivery.
                              </>
                            ) : (
                              <>
                                <strong>{carOnlyCartItem!.menuItemName}</strong>{" "}
                                in your cart requires car delivery.
                              </>
                            )}{" "}
                            Select Car Delivery or your own arrangement below.
                          </p>
                        )}

                        {/* Zone picker (shown when bike is selected) */}
                        {deliveryMode === "bike" && (
                          <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-2">
                            {DELIVERY_ZONES.map((zone) => {
                              const selected = deliveryZone === zone.id;
                              const [tierPart, areaPart] =
                                zone.label.split(" — ");
                              return (
                                <button
                                  key={zone.id}
                                  type="button"
                                  onClick={() =>
                                    setDeliveryZone(zone.id as DeliveryZoneId)
                                  }
                                  className={[
                                    "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                                    selected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/40 bg-background",
                                  ].join(" ")}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span
                                      className={[
                                        "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                        selected
                                          ? "border-primary bg-primary"
                                          : "border-muted-foreground/30 bg-background",
                                      ].join(" ")}
                                    >
                                      {selected && (
                                        <Check className="w-2.5 h-2.5 text-white" />
                                      )}
                                    </span>
                                    <span className="text-sm leading-snug min-w-0">
                                      <span className="font-semibold">
                                        {tierPart}
                                      </span>
                                      <span className="text-muted-foreground font-normal">
                                        {" "}
                                        — {areaPart}
                                      </span>
                                    </span>
                                  </div>
                                  {zone.quote ? (
                                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 shrink-0 whitespace-nowrap">
                                      Contact Us
                                    </span>
                                  ) : (
                                    <span
                                      className={[
                                        "text-sm font-bold shrink-0 tabular-nums whitespace-nowrap",
                                        selected
                                          ? "text-primary"
                                          : "text-foreground",
                                      ].join(" ")}
                                    >
                                      {formatNaira(zone.fee ?? 0)}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                            {deliveryZone === "t5" && (
                              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 leading-relaxed">
                                <strong>Quote-only zone.</strong> After
                                confirming your booking, we'll confirm the exact
                                delivery fee for your area via WhatsApp before
                                cooking starts.
                              </div>
                            )}
                          </div>
                        )}

                        {/* Option 2: Car Delivery — always visible */}
                        <button
                          type="button"
                          onClick={() => setDeliveryMode("car")}
                          className={[
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all",
                            deliveryMode === "car"
                              ? "border-amber-500 bg-amber-50"
                              : "border-border hover:border-amber-400/60 bg-background",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                              deliveryMode === "car"
                                ? "border-amber-500 bg-amber-500"
                                : "border-muted-foreground/30 bg-background",
                            ].join(" ")}
                          >
                            {deliveryMode === "car" && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </span>
                          <span className="text-sm leading-snug">
                            <span className="font-semibold">
                              🚗 Car Delivery
                            </span>
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              — contact us for a quote
                            </span>
                          </span>
                        </button>

                        {/* Car delivery expansion — zone picker then contact buttons */}
                        {deliveryMode === "car" && (
                          <div className="ml-4 pl-4 border-l-2 border-amber-300 space-y-3 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Select your area so we can look up the car
                              delivery cost before we call you.
                            </p>

                            {/* Car zone picker — same areas as bike, all "Contact Us" */}
                            <div className="space-y-1.5">
                              {DELIVERY_ZONES.map((zone) => {
                                const sel = carZone === zone.id;
                                const [tierPart, areaPart] =
                                  zone.label.split(" — ");
                                return (
                                  <button
                                    key={zone.id}
                                    type="button"
                                    onClick={() =>
                                      setCarZone(zone.id as DeliveryZoneId)
                                    }
                                    className={[
                                      "w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all",
                                      sel
                                        ? "border-amber-500 bg-amber-50"
                                        : "border-border hover:border-amber-400/50 bg-background",
                                    ].join(" ")}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span
                                        className={[
                                          "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                                          sel
                                            ? "border-amber-500 bg-amber-500"
                                            : "border-muted-foreground/30 bg-background",
                                        ].join(" ")}
                                      >
                                        {sel && (
                                          <Check className="w-2.5 h-2.5 text-white" />
                                        )}
                                      </span>
                                      <span className="text-sm leading-snug min-w-0">
                                        <span className="font-semibold">
                                          {tierPart}
                                        </span>
                                        <span className="text-muted-foreground font-normal">
                                          {" "}
                                          — {areaPart}
                                        </span>
                                      </span>
                                    </div>
                                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 shrink-0 whitespace-nowrap">
                                      Contact Us
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* WhatsApp button — active once area + date + slot are all filled */}
                            {(() => {
                              const ready = !!(
                                carZone &&
                                deliveryDate &&
                                deliverySlot
                              );
                              return (
                                <>
                                  <a
                                    href={ready ? carWaUrl : undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={[
                                      "flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-sm font-bold text-white transition-opacity",
                                      !ready
                                        ? "opacity-40 pointer-events-none"
                                        : "hover:opacity-90",
                                    ].join(" ")}
                                    style={{ background: "#25D366" }}
                                  >
                                    <MessageCircle className="w-4 h-4 shrink-0" />
                                    WhatsApp — Request Quote
                                  </a>
                                  {!ready && (
                                    <p className="text-[11px] text-amber-700">
                                      {!carZone
                                        ? "↑ Pick your area above first."
                                        : "Also fill in your delivery date and window below — then this button activates."}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                            <p className="text-[11px] text-muted-foreground">
                              Submit your booking below too — we'll confirm the
                              car delivery fee before cooking starts.
                            </p>
                          </div>
                        )}

                        {/* Option 3: Own Arrangement */}
                        <button
                          type="button"
                          onClick={() => setDeliveryMode("own")}
                          className={[
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all",
                            deliveryMode === "own"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 bg-background",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                              deliveryMode === "own"
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30 bg-background",
                            ].join(" ")}
                          >
                            {deliveryMode === "own" && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </span>
                          <span className="text-sm leading-snug">
                            <span className="font-semibold">
                              My Own Arrangement
                            </span>
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              — I'll collect or arrange my own delivery. No fee.
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Date</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Pick a date" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-64 overflow-y-auto">
                                {availableDates.map((d) => {
                                  const isToday = d === todayStr;
                                  return (
                                    <SelectItem key={d} value={d}>
                                      {format(
                                        new Date(d + "T12:00:00"),
                                        "EEE, MMM d",
                                      )}
                                      {isToday
                                        ? " — Today (same-day rush fee)"
                                        : ""}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliverySlot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Window</FormLabel>
                            {isRushDay ? (
                              // Same-day orders: 2 fixed windows only
                              <FormControl>
                                <div className="flex gap-3">
                                  {SAME_DAY_SLOTS.map((s) => (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => field.onChange(s)}
                                      className="flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-colors"
                                      style={{
                                        borderColor:
                                          field.value === s
                                            ? "#0F9E0F"
                                            : "#e5e7eb",
                                        background:
                                          field.value === s
                                            ? "#EFF7EC"
                                            : "#fff",
                                        color:
                                          field.value === s
                                            ? "#0F9E0F"
                                            : "#221F1F",
                                      }}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </FormControl>
                            ) : (
                              // Normal future-date slot picker
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Pick a time" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {DELIVERY_SLOTS.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Additional notes{" "}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Allergen info, gate code, special requests…"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ── Secondary recipient ─────────────────────────── */}
                    <div className="border border-border rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setHasAltRecipient((p) => !p)}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>Someone else is receiving this order</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </span>
                        {hasAltRecipient ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </button>

                      {hasAltRecipient && (
                        <div className="px-4 pb-4 pt-4 border-t border-border bg-muted/20 space-y-4">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Gifting this order, or sending it to someone who
                            will collect on your behalf? Add their name and
                            phone number so our rider can reach them directly on
                            arrival.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="recipientName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Recipient's Full Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="h-11"
                                      placeholder="Ngozi Okonkwo"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="recipientPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Recipient's Phone Number
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      className="h-11"
                                      placeholder="08012345678"
                                      type="tel"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT: ORDER SUMMARY ════════════════════════════════════ */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-muted/40 flex items-center justify-between">
                <h2 className="font-bold font-display text-lg">
                  Order Summary
                </h2>
                {cart.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {cart.length} line{cart.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>
                    Your cart is empty.
                    <br />
                    Choose any item above to start.
                  </p>
                </div>
              ) : (
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start gap-2 text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium leading-tight truncate">
                            {item.menuItemName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {cartLineDesc(item)}
                          </div>
                        </div>
                        <span className="font-bold shrink-0 tabular-nums">
                          {formatNaira(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {rushFee > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">
                      <div className="flex justify-between items-center font-bold text-amber-800 mb-1">
                        <span>Same-day rush fee</span>
                        <span>{formatNaira(rushFee)}</span>
                      </div>
                      <p className="text-xs text-amber-700">
                        {distinctFoodIds.size} meal
                        {distinctFoodIds.size !== 1 ? "s" : ""} ×{" "}
                        {formatNaira(
                          RUSH_FEE_RATES[Math.min(distinctFoodIds.size, 5)] ??
                            10000,
                        )}{" "}
                        each. Booking for tomorrow? Switch the date to remove
                        this fee.
                      </p>
                    </div>
                  )}

                  {deliveryMode === "own" && (
                    <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-3">
                      <span className="text-muted-foreground">
                        Delivery fee
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        No fee — own arrangement
                      </span>
                    </div>
                  )}
                  {deliveryMode === "car" && (
                    <div className="border-t border-dashed border-border pt-3 space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          🚗 Car delivery
                        </span>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          Quote pending
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        We'll agree on the car delivery fee with you before
                        cooking starts.
                      </p>
                    </div>
                  )}
                  {deliveryMode === "bike" && deliveryFee > 0 && (
                    <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-3">
                      <span className="text-muted-foreground">
                        Bike delivery fee
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatNaira(deliveryFee)}
                      </span>
                    </div>
                  )}
                  {deliveryMode === "bike" && deliveryZone === "t5" && (
                    <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-3">
                      <span className="text-muted-foreground">
                        Delivery fee
                      </span>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        Quoted via WhatsApp
                      </span>
                    </div>
                  )}
                  {!deliveryMode && (
                    <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-3">
                      <span className="text-muted-foreground">
                        Delivery fee
                      </span>
                      <span className="text-xs text-muted-foreground italic">
                        Select option →
                      </span>
                    </div>
                  )}
                  {deliveryMode === "bike" && !deliveryZone && (
                    <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-3">
                      <span className="text-muted-foreground">
                        Delivery fee
                      </span>
                      <span className="text-xs text-muted-foreground italic">
                        Select zone →
                      </span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="tabular-nums" style={{ color: "#0F9E0F" }}>
                      {formatNaira(grandTotal)}
                    </span>
                  </div>

                  {pepperTouched && (
                    <div className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
                      Pepper level:{" "}
                      <span
                        className={`font-bold ${PEPPER_COLORS[pepperLevel]}`}
                      >
                        {PEPPER_LABELS[pepperLevel]}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              form="booking-form"
              disabled={!canSubmit}
              className="w-full h-14 text-lg font-bold gap-2 rounded-xl"
              style={{ background: canSubmit ? "#0F9E0F" : undefined }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Booking…
                </>
              ) : (
                <>
                  Confirm Booking <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>

            {!canSubmit && !isSubmitting && (
              <div className="space-y-1.5">
                {isSundayToday && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Orders are
                    closed on Sundays
                  </p>
                )}
                {!isSundayToday && cart.length === 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />{" "}
                    Add at least one item
                  </p>
                )}
                {!isSundayToday && !pepperTouched && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />{" "}
                    Set pepper level (Step 2)
                  </p>
                )}
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-1">
                Payment required before cooking
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-600 leading-relaxed">
                After confirming, we'll send bank details via WhatsApp and
                email. Cooking starts once payment is received.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-dashed border-border p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Coming soon
              </p>
              <div className="text-sm text-muted-foreground/50 flex items-center gap-2">
                💳 Pay with Paystack
              </div>
              <div className="text-sm text-muted-foreground/50 flex items-center gap-2">
                📅 Add to Google Calendar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
