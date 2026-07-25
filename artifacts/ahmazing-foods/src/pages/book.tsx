import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";

import { useListMenuItems, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import {
  Loader2, Trash2, PlusCircle, AlertCircle, ShoppingCart,
  ChevronRight, Check, Minus, Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_FOOD_MEALS  = 5;          // soups / stews / breakfast limit
const MAX_PROTEIN_QTY = 10;
const MAX_ITEM_QTY    = 20;

const DELIVERY_SLOTS = ["8–10am", "10am–12pm", "12–2pm", "2–4pm", "4–6pm"];
const PEPPER_LABELS  = ["Low 🌶️", "Medium 🌶️🌶️", "Really Peppery 🌶️🌶️🌶️"] as const;
const PEPPER_COLORS  = ["text-emerald-600", "text-amber-600", "text-red-600"] as const;

const FOOD_CATS = new Set(["soups", "stews", "breakfast"]);
const isFoodCat = (cat: string) => FOOD_CATS.has(cat);

// Category display order and labels in the dropdown
const CAT_ORDER  = ["soups", "stews", "breakfast", "drinks", "snacks", "seeds", "platters"] as const;
const CAT_LABELS: Record<string, string> = {
  soups:     "Soups",
  stews:     "Stews",
  breakfast: "Breakfast",
  drinks:    "Drinks & Wellness",
  snacks:    "Snacks",
  seeds:     "Seeds & Spices",
  platters:  "Platters & Trays",
};

const RUSH_FEE_RATES: Record<number, number> = {
  1: 20000, 2: 15000, 3: 13000, 4: 12000, 5: 10000,
};
function calcRushFee(isRush: boolean, n: number) {
  if (!isRush) return 0;
  const c = Math.min(Math.max(n, 1), 5);
  return (RUSH_FEE_RATES[c] ?? 10000) * c;
}

// ── TYPES ────────────────────────────────────────────────────────────────────
interface SelProtein { name: string; qty: number; extraCost: number; }

interface CartItem {
  id: string;
  menuItemId: number;
  menuItemName: string;
  category: string;
  selectedSize: string;
  itemQty: number;                  // how many of this item
  selectedProteins: SelProtein[];   // multiple proteins each with qty
  price: number;                    // itemQty × (basePrice + sum(protein.extraCost × protein.qty))
}

// ── FORM SCHEMA ───────────────────────────────────────────────────────────────
const customerSchema = z.object({
  customerName:    z.string().min(2, "Name is required"),
  customerPhone:   z.string().min(10, "Valid phone number required"),
  customerEmail:   z.string().email("Enter a valid email").optional().or(z.literal("")),
  deliveryAddress: z.string().min(5, "Please enter your delivery address"),
  deliveryDate:    z.string().min(1, "Delivery date is required"),
  deliverySlot:    z.string().min(1, "Delivery slot is required"),
  notes:           z.string().optional(),
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────────────────────
function scrollTo(el: HTMLElement | null, delay = 140) {
  if (!el) return;
  const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), delay);
  return () => clearTimeout(t);
}

// ── QUANTITY CONTROL ──────────────────────────────────────────────────────────
function QtyControl({
  value, min = 1, max = MAX_ITEM_QTY,
  onChange, size = "md",
}: {
  value: number; min?: number; max?: number;
  onChange: (n: number) => void; size?: "sm" | "md";
}) {
  const btn  = size === "sm" ? "w-7 h-7 text-xs"  : "w-8 h-8";
  const num  = size === "sm" ? "w-8 text-sm"        : "w-10 text-base";
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        className={`${btn} rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-30`}>
        <Minus className="w-3 h-3" />
      </button>
      <span className={`${num} text-center font-bold tabular-nums`}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
        className={`${btn} rounded-full border-2 border-border flex items-center justify-center hover:border-primary transition-colors disabled:opacity-30`}>
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── SUB-STEP LABEL ─────────────────────────────────────────────────────────────
function SubStepLabel({ letter, done, children }: {
  letter: string; done: boolean; children: React.ReactNode;
}) {
  return (
    <label className="text-sm font-semibold flex items-center gap-2">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors duration-300 ${
        done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"
      }`}>
        {done ? <Check className="w-2.5 h-2.5" /> : letter}
      </span>
      {children}
    </label>
  );
}

// ── CART LINE DESCRIPTION ─────────────────────────────────────────────────────
function cartLineDesc(item: CartItem): string {
  const qty   = item.itemQty > 1 ? ` ×${item.itemQty}` : "";
  const prots = item.selectedProteins
    .map((p) => `${p.name}${p.qty > 1 ? ` ×${p.qty}` : ""}`)
    .join(", ");
  return `${item.selectedSize}${qty}${prots ? ` + ${prots}` : ""}`;
}

// ═════════════════════════════════════════════════════════════════════════════
export default function BookPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: menuItems, isLoading: loadingMenu } = useListMenuItems(
    {}, { query: { queryKey: ["menuItems"] } }
  );
  const createOrder = useCreateOrder();

  // ── CART ────────────────────────────────────────────────────────────────────
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [pepperLevel, setPepperLevel]     = useState<number>(1);
  const [pepperTouched, setPepperTouched] = useState(false);
  const [justAdded, setJustAdded]         = useState<string | null>(null);

  // ── CONFIGURATOR STATE ────────────────────────────────────────────────────
  const [configItemId,  setConfigItemId]  = useState<number>(0);
  const [configSize,    setConfigSize]    = useState<string>("");
  const [itemQty,       setItemQty]       = useState<number>(1);
  // proteins: Record<proteinName, qty>
  const [proteins, setProteins] = useState<Record<string, number>>({});

  // ── SCROLL REFS ────────────────────────────────────────────────────────────
  const sizeRef    = useRef<HTMLDivElement>(null);
  const qtyRef     = useRef<HTMLDivElement>(null);
  const proteinRef = useRef<HTMLDivElement>(null);
  const addBtnRef  = useRef<HTMLDivElement>(null);
  const pepperRef  = useRef<HTMLDivElement>(null);
  const step1Ref   = useRef<HTMLDivElement>(null);

  // ── DEEP-LINK: pre-fill cart from URL params ──────────────────────────────
  const deepLinkDone   = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deepLinkParams = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return { cat: p.get("cat") ?? "", item: p.get("item") ?? "", size: p.get("size") ?? "" };
  }, []);

  // ── FORM ───────────────────────────────────────────────────────────────────
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: "", customerPhone: "", customerEmail: "",
      deliveryAddress: "", deliveryDate: "", deliverySlot: "", notes: "",
    },
  });
  const deliveryDate = form.watch("deliveryDate");

  // ── DERIVED ────────────────────────────────────────────────────────────────
  const configItem = useMemo(
    () => menuItems?.find((m) => m.id === configItemId),
    [menuItems, configItemId]
  );
  const hasProteins      = !!(configItem && configItem.proteins.length > 0);
  const isFood           = !!(configItem && isFoodCat(configItem.category));
  const distinctFoodIds  = useMemo(
    () => new Set(cart.filter((i) => isFoodCat(i.category)).map((i) => i.menuItemId)),
    [cart]
  );
  const isRushDay = useMemo(
    () => !!deliveryDate && deliveryDate === format(new Date(), "yyyy-MM-dd"),
    [deliveryDate]
  );
  const rushFee    = useMemo(() => calcRushFee(isRushDay, distinctFoodIds.size), [isRushDay, distinctFoodIds.size]);
  const cartTotal  = useMemo(() => cart.reduce((s, i) => s + i.price, 0), [cart]);
  const grandTotal = cartTotal + rushFee;

  // Live price for the item being configured
  const proteinSubtotal = useMemo(
    () => Object.entries(proteins).reduce((sum, [name, qty]) => {
      const p = configItem?.proteins.find((p) => p.name === name);
      return sum + (p?.extraCost ?? 0) * qty;
    }, 0),
    [proteins, configItem]
  );
  const configUnitPrice = useMemo(() => {
    if (!configItem || !configSize) return 0;
    const base = configItem.sizes.find((s) => s.label === configSize)?.price ?? 0;
    return base + proteinSubtotal;
  }, [configItem, configSize, proteinSubtotal]);
  const configPrice = configUnitPrice * itemQty;

  const canAddToCart = useMemo(() => {
    if (!configItem || !configSize) return false;
    if (isFood && !distinctFoodIds.has(configItemId) && distinctFoodIds.size >= MAX_FOOD_MEALS) return false;
    return true;
  }, [configItem, configSize, configItemId, isFood, distinctFoodIds]);

  const availableDates = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => format(addDays(new Date(), i), "yyyy-MM-dd")),
    []
  );

  // ── RESET configurator when dish changes ─────────────────────────────────
  useEffect(() => {
    setConfigSize("");
    setItemQty(1);
    setProteins({});
  }, [configItemId]);

  // ── RESET itemQty when size changes ───────────────────────────────────────
  useEffect(() => { setItemQty(1); }, [configSize]);

  // ── AUTO-SCROLL: dish selected → size ────────────────────────────────────
  useEffect(() => {
    if (configItem) return scrollTo(sizeRef.current);
  }, [configItem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AUTO-SCROLL: size selected → qty/protein/addBtn ──────────────────────
  useEffect(() => {
    if (!configSize || !configItem) return;
    // scroll to protein if food with proteins, otherwise to quantity/add area
    return hasProteins ? scrollTo(proteinRef.current) : scrollTo(qtyRef.current);
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
    if (!menuItems?.length) return;
    if (!deepLinkParams.cat || !deepLinkParams.item) return;
    const found = menuItems.find(
      (m) =>
        m.category === deepLinkParams.cat &&
        m.name.toLowerCase() === deepLinkParams.item.toLowerCase()
    );
    if (!found) return;
    const sizeObj = deepLinkParams.size
      ? (found.sizes.find((s) => s.label === deepLinkParams.size) ?? found.sizes[0])
      : found.sizes[0];
    if (!sizeObj) return;
    deepLinkDone.current = true;
    setCart((prev) => {
      if (prev.some((i) => i.menuItemId === found.id && i.selectedSize === sizeObj.label)) return prev;
      return [{
        id:               `dl-${found.id}-${Date.now()}`,
        menuItemId:       found.id,
        menuItemName:     found.name,
        category:         found.category,
        selectedSize:     sizeObj.label,
        itemQty:          1,
        selectedProteins: [],
        price:            sizeObj.price,
      }];
    });
    setJustAdded(found.name);
    setTimeout(() => setJustAdded(null), 6000);
  }, [menuItems, deepLinkParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  function selectDish(val: string) { setConfigItemId(parseInt(val)); }

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
    setProteins((prev) => ({ ...prev, [name]: Math.max(1, Math.min(MAX_PROTEIN_QTY, qty)) }));
  }

  function addToCart() {
    if (!configItem || !configSize) return;
    const selProteins: SelProtein[] = Object.entries(proteins).map(([name, qty]) => {
      const p = configItem.proteins.find((p) => p.name === name);
      return { name, qty, extraCost: p?.extraCost ?? 0 };
    });
    const name = configItem.name;
    setCart((prev) => [...prev, {
      id: crypto.randomUUID(),
      menuItemId:      configItem.id,
      menuItemName:    name,
      category:        configItem.category,
      selectedSize:    configSize,
      itemQty,
      selectedProteins: selProteins,
      price:           configPrice,
    }]);
    setConfigItemId(0);
    setJustAdded(name);
    setTimeout(() => setJustAdded(null), 4000);
    toast({ title: "Added to cart", description: `${name} — ${configSize}${itemQty > 1 ? ` ×${itemQty}` : ""}` });
    scrollTo(step1Ref.current, 240);
  }

  function removeFromCart(id: string) { setCart((prev) => prev.filter((i) => i.id !== id)); }

  function onSubmit(values: z.infer<typeof customerSchema>) {
    if (cart.length === 0) {
      toast({ variant: "destructive", title: "Cart is empty", description: "Add at least one item before booking." });
      return;
    }
    if (!pepperTouched) {
      toast({ variant: "destructive", title: "Pepper level required", description: "Please set your pepper preference before confirming." });
      scrollTo(pepperRef.current, 0);
      return;
    }
    const primary    = cart[0];
    const cartSummary = cart.map((ci, i) => `${i + 1}. ${ci.menuItemName} — ${cartLineDesc(ci)} (${formatNaira(ci.price)})`).join("\n");
    const notesStr   = [
      `CART (${cart.length} item${cart.length === 1 ? "" : "s"}):\n${cartSummary}`,
      `Pepper: ${PEPPER_LABELS[pepperLevel]}`,
      `Delivery: ${values.deliveryDate} · ${values.deliverySlot}`,
      rushFee > 0
        ? `Subtotal: ${formatNaira(cartTotal)} + Rush fee: ${formatNaira(rushFee)} = Total: ${formatNaira(grandTotal)}`
        : `Total: ${formatNaira(grandTotal)}`,
      `Customer: ${values.customerName} | ${values.customerPhone}${values.customerEmail ? ` | ${values.customerEmail}` : ""}`,
      `Delivery address: ${values.deliveryAddress}`,
      values.notes ? `Customer notes: ${values.notes}` : "",
    ].filter(Boolean).join("\n\n") + "\n\n---\nPAYMENT DETAILS\nAccount Name: Ahmazing Cuisine\nBank: FCMB\nAccount Number: 1009414545";

    createOrder.mutate(
      {
        data: {
          menuItemId:      primary.menuItemId,
          selectedSize:    primary.selectedSize,
          selectedProtein: primary.selectedProteins[0]?.name ?? null,
          customerName:    values.customerName,
          customerPhone:   values.customerPhone,
          customerEmail:   values.customerEmail || undefined,
          deliveryAddress: values.deliveryAddress,
          deliveryDate:    values.deliveryDate as unknown as Date,
          deliverySlot:    values.deliverySlot,
          notes:           notesStr,
          // @ts-expect-error extended fields
          cartItems:   cart,
          // @ts-expect-error extended fields
          pepperLevel: PEPPER_LABELS[pepperLevel],
        },
      },
      {
        onSuccess: (order) => setLocation(`/booking-confirmed/${order.id}`),
        onError:   (err)   => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const msg = (err as any)?.data?.error || (err as any)?.message || "Failed to create booking";
          toast({ variant: "destructive", title: "Booking Error", description: msg });
        },
      }
    );
  }

  const isSubmitting = createOrder.isPending;
  const canSubmit    = cart.length > 0 && pepperTouched && !isSubmitting;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30 pb-24" style={{ scrollBehavior: "smooth" }}>

      {/* Header */}
      <div className="bg-foreground text-background pt-16 pb-20 rounded-b-[3rem] shadow-xl mb-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-4">Book a Slot</h1>
          <p className="text-xl text-background/70 max-w-xl">
            Build your full order — meals, drinks, snacks, platters. Everything lands in one cart with a live total.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ═══ LEFT COLUMN ════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── STEP 1: ITEM BUILDER ─────────────────────────────────── */}
            <div ref={step1Ref} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

              <div className="flex items-start gap-3 px-6 md:px-8 py-5 border-b border-border bg-muted/40">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">1</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold font-display leading-tight">Build Your Order</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pick any item — meals, drinks, snacks, platters. Set size, quantity and proteins, then add to cart. Repeat as needed.
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
                    <span><strong>{justAdded}</strong> added. Choose another item below to keep building your order.</span>
                  </div>
                )}

                {/* Food meal dots (soups/stews/breakfast only) */}
                {distinctFoodIds.size > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      {Array.from({ length: MAX_FOOD_MEALS }).map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 transition-all duration-300"
                          style={{
                            background:  i < distinctFoodIds.size ? "#0F9E0F" : "transparent",
                            borderColor: i < distinctFoodIds.size ? "#0F9E0F" : "#e5e7eb",
                          }} />
                      ))}
                    </div>
                    <span>{distinctFoodIds.size}/{MAX_FOOD_MEALS} distinct meals (drinks & snacks are unlimited)</span>
                  </div>
                )}

                {/* ── A: Select item ─────────────────────────────────── */}
                <div className="space-y-2.5">
                  <SubStepLabel letter="A" done={!!configItem}>Choose an Item</SubStepLabel>
                  <Select
                    disabled={loadingMenu}
                    onValueChange={selectDish}
                    value={configItemId ? configItemId.toString() : ""}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={loadingMenu ? "Loading…" : "Choose a dish, drink, snack or platter"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto">
                      {CAT_ORDER.map((cat) => {
                        const catItems = menuItems?.filter((i) => i.available && i.category === cat) ?? [];
                        if (!catItems.length) return null;
                        return (
                          <div key={cat}>
                            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 sticky top-0 bg-popover z-10">
                              {CAT_LABELS[cat]}
                              {cat === "soups" || cat === "stews" || cat === "breakfast"
                                ? <span className="ml-1 font-normal normal-case text-muted-foreground/60">(max {MAX_FOOD_MEALS} meals)</span>
                                : null}
                            </div>
                            {catItems.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* ── B: Size ────────────────────────────────────────── */}
                {configItem && (
                  <div ref={sizeRef} className="space-y-2.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <SubStepLabel letter="B" done={!!configSize}>
                      Choose Size
                      <span className="ml-2 text-xs font-normal text-muted-foreground">— {configItem.name}</span>
                    </SubStepLabel>
                    <div className={`grid gap-2 ${configItem.sizes.length > 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3"}`}>
                      {configItem.sizes.map((size) => {
                        const sel = configSize === size.label;
                        return (
                          <button key={size.label} type="button" onClick={() => setConfigSize(size.label)}
                            className={`relative text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                              sel ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/50"
                            }`}>
                            {sel && (
                              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </span>
                            )}
                            <div className="font-medium text-sm pr-5">{size.label}</div>
                            <div className="font-bold text-base mt-0.5">{formatNaira(size.price)}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── C: Proteins — shown before qty for food items ─── */}
                {configItem && configSize && hasProteins && (
                  <div ref={proteinRef} className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <SubStepLabel letter="C" done={Object.keys(proteins).length > 0}>
                      Add Proteins
                      <span className="ml-2 text-xs font-normal text-muted-foreground">— tick all you want, then set quantities</span>
                    </SubStepLabel>

                    {/* Protein grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      <button type="button" onClick={() => setProteins({})}
                        className={`text-center px-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                          Object.keys(proteins).length === 0 ? "border-border bg-muted" : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}>
                        <div className="text-[11px] font-medium text-muted-foreground">No protein</div>
                        <div className="text-xs font-bold mt-0.5">—</div>
                      </button>
                      {configItem.proteins.map((p) => {
                        const selected = proteins[p.name] !== undefined;
                        return (
                          <button key={p.name} type="button" onClick={() => toggleProtein(p.name)}
                            className={`relative text-center px-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                              selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/50"
                            }`}>
                            {selected && (
                              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </span>
                            )}
                            <div className="text-[11px] font-medium leading-tight pr-2">{p.name}</div>
                            <div className="text-xs font-bold mt-0.5 text-primary">+{formatNaira(p.extraCost)}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Per-protein quantity rows */}
                    {Object.keys(proteins).length > 0 && (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        {Object.entries(proteins).map(([name, qty]) => {
                          const p = configItem.proteins.find((p) => p.name === name);
                          return (
                            <div key={name} className="flex items-center gap-3 px-4 py-2.5 bg-muted/60 border border-border rounded-xl">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold truncate">{name}</div>
                                <div className="text-xs text-muted-foreground">{formatNaira(p?.extraCost ?? 0)} per piece</div>
                              </div>
                              <QtyControl value={qty} max={MAX_PROTEIN_QTY} onChange={(n) => setProteinQty(name, n)} size="sm" />
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
                    <div ref={!hasProteins ? addBtnRef : undefined}
                      className="flex items-center gap-4 px-4 py-3 bg-muted/40 border border-border rounded-xl mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">
                          {isFood ? "Quantity" : `How many ${configItem.name.toLowerCase().includes("drink") ? "bottles" : "packs"}?`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatNaira(configUnitPrice)} each
                        </div>
                      </div>
                      <QtyControl value={itemQty} max={MAX_ITEM_QTY} onChange={setItemQty} />
                      <div className="text-base font-bold text-right tabular-nums shrink-0 w-24" style={{ color: "#0F9E0F" }}>
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
                          <span key={n}>· {n}{q > 1 ? ` ×${q}` : ""}</span>
                        ))}
                        {itemQty > 1 && <span>· <strong>×{itemQty} items</strong></span>}
                        <span className="ml-auto font-bold text-foreground">{formatNaira(configPrice)}</span>
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
                      {isFood && !distinctFoodIds.has(configItemId) && distinctFoodIds.size >= MAX_FOOD_MEALS && (
                        <p className="text-xs text-amber-600 text-center mt-2">
                          Maximum {MAX_FOOD_MEALS} distinct meals reached. Remove one to add a different meal.
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
                      <span className="ml-auto font-bold text-sm tabular-nums" style={{ color: "#0F9E0F" }}>
                        {formatNaira(cartTotal)}
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{item.menuItemName}</div>
                            <div className="text-xs text-muted-foreground">{cartLineDesc(item)}</div>
                          </div>
                          <div className="font-bold text-sm tabular-nums shrink-0">{formatNaira(item.price)}</div>
                          <button type="button" onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 shrink-0">
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
            <div ref={pepperRef} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-muted/40">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">2</div>
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
                  This applies to all the food in your cart. Drinks, snacks and platters are not affected.
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
                  ].map(({ level, label, sub, chilies, activeClass, activeLabelClass, dotClass }) => {
                    const isSelected = pepperLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => { setPepperLevel(level); setPepperTouched(true); }}
                        className={[
                          "relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 transition-all duration-150 cursor-pointer select-none",
                          isSelected
                            ? activeClass + " shadow-md scale-[1.03]"
                            : "border-border bg-muted/30 hover:bg-muted/60 hover:border-border/80",
                        ].join(" ")}
                      >
                        {/* Selected indicator dot */}
                        {isSelected && (
                          <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${dotClass}`} />
                        )}

                        {/* Chili icons — filled up to this level */}
                        <span className="text-xl leading-none tracking-tight" aria-hidden>
                          {"🌶️".repeat(chilies)}
                        </span>

                        {/* Label */}
                        <span className={`font-bold text-sm text-center leading-tight ${isSelected ? activeLabelClass : "text-foreground"}`}>
                          {label}
                        </span>
                        <span className="text-xs text-muted-foreground text-center leading-tight">{sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Connector line showing which position is active */}
                <div className="mt-5 flex items-center gap-0">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex-1 flex items-center">
                      <div className={[
                        "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors duration-150",
                        pepperTouched && pepperLevel >= i
                          ? i === 0 ? "bg-emerald-500 border-emerald-500"
                          : i === 1 ? "bg-amber-500 border-amber-500"
                          : "bg-red-500 border-red-500"
                          : "bg-background border-border",
                      ].join(" ")} />
                      {i < 2 && (
                        <div className={[
                          "flex-1 h-1 transition-colors duration-150",
                          pepperTouched && pepperLevel > i
                            ? i === 0 ? "bg-amber-400" : "bg-red-400"
                            : "bg-border",
                        ].join(" ")} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-medium text-muted-foreground px-0.5">
                  <span>Mild</span>
                  <span>Medium</span>
                  <span>Hot</span>
                </div>
              </div>
            </div>

            {/* ── STEP 3: DELIVERY ───────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-muted/40">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <h2 className="text-xl font-bold font-display">Delivery Details</h2>
              </div>
              <div className="p-6 md:p-8">
                <Form {...form}>
                  <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="customerName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input className="h-11" placeholder="Adaeze Okonkwo" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="customerPhone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl><Input className="h-11" placeholder="08012345678" type="tel" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="customerEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-muted-foreground font-normal">(optional — for confirmation)</span></FormLabel>
                        <FormControl><Input className="h-11" placeholder="you@email.com" type="email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl><Input className="h-11" placeholder="14 Adeola Odeku, VI, Lagos" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Date</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11"><SelectValue placeholder="Pick a date" /></SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-64 overflow-y-auto">
                              {availableDates.map((d) => {
                                const isToday = d === format(new Date(), "yyyy-MM-dd");
                                return (
                                  <SelectItem key={d} value={d}>
                                    {format(new Date(d + "T12:00:00"), "EEE, MMM d")}
                                    {isToday ? " — Today (rush fee applies)" : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="deliverySlot" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Window</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11"><SelectValue placeholder="Pick a time" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DELIVERY_SLOTS.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder="Allergen info, gate code, special requests…" className="resize-none" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </form>
                </Form>
              </div>
            </div>

          </div>

          {/* ═══ RIGHT: ORDER SUMMARY ════════════════════════════════════ */}
          <div className="lg:sticky lg:top-24 space-y-4">

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-muted/40 flex items-center justify-between">
                <h2 className="font-bold font-display text-lg">Order Summary</h2>
                {cart.length > 0 && <span className="text-xs text-muted-foreground">{cart.length} line{cart.length !== 1 ? "s" : ""}</span>}
              </div>

              {cart.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>Your cart is empty.<br />Choose any item above to start.</p>
                </div>
              ) : (
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium leading-tight truncate">{item.menuItemName}</div>
                          <div className="text-xs text-muted-foreground">{cartLineDesc(item)}</div>
                        </div>
                        <span className="font-bold shrink-0 tabular-nums">{formatNaira(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  {rushFee > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">
                      <div className="flex justify-between items-center font-bold text-amber-800 mb-1">
                        <span>Rush fee (same-day meals)</span>
                        <span>{formatNaira(rushFee)}</span>
                      </div>
                      <p className="text-xs text-amber-700">
                        {distinctFoodIds.size} meal{distinctFoodIds.size !== 1 ? "s" : ""} × {formatNaira(RUSH_FEE_RATES[Math.min(distinctFoodIds.size, 5)] ?? 10000)} each
                      </p>
                    </div>
                  )}

                  <div className="border-t border-dashed border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="tabular-nums" style={{ color: "#0F9E0F" }}>{formatNaira(grandTotal)}</span>
                  </div>

                  {pepperTouched && (
                    <div className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
                      Pepper level: <span className={`font-bold ${PEPPER_COLORS[pepperLevel]}`}>{PEPPER_LABELS[pepperLevel]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" form="booking-form" disabled={!canSubmit}
              className="w-full h-14 text-lg font-bold gap-2 rounded-xl"
              style={{ background: canSubmit ? "#0F9E0F" : undefined }}>
              {isSubmitting
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking…</>
                : <>Confirm Booking <ChevronRight className="w-5 h-5" /></>
              }
            </Button>

            {!canSubmit && !isSubmitting && (
              <div className="space-y-1.5">
                {cart.length === 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Add at least one item
                  </p>
                )}
                {!pepperTouched && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Set pepper level (Step 2)
                  </p>
                )}
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-1">Payment required before cooking</p>
              <p className="text-xs text-amber-700 dark:text-amber-600 leading-relaxed">
                After confirming, we'll send bank details via WhatsApp and email. Cooking starts once payment is received.
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-dashed border-border p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Coming soon</p>
              <div className="text-sm text-muted-foreground/50 flex items-center gap-2">💳 Pay with Paystack</div>
              <div className="text-sm text-muted-foreground/50 flex items-center gap-2">📅 Add to Google Calendar</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
