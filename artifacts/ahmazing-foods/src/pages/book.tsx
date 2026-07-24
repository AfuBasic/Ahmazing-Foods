import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";

import { useListMenuItems, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import { Loader2, Trash2, PlusCircle, AlertCircle, ShoppingCart, ChevronRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_DISTINCT_MEALS = 5;
const DELIVERY_SLOTS = ["8–10am", "10am–12pm", "12–2pm", "2–4pm", "4–6pm"];
const PEPPER_LABELS = ["Low 🌶️", "Medium 🌶️🌶️", "Really Peppery 🌶️🌶️🌶️"] as const;
const PEPPER_COLORS = ["text-emerald-600", "text-amber-600", "text-red-600"] as const;

const RUSH_FEE_RATES: Record<number, number> = {
  1: 20000,
  2: 15000,
  3: 13000,
  4: 12000,
  5: 10000,
};

function calcRushFee(isRush: boolean, distinctCount: number): number {
  if (!isRush) return 0;
  const count = Math.min(Math.max(distinctCount, 1), 5);
  return (RUSH_FEE_RATES[count] ?? 10000) * count;
}

// ── TYPES ────────────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  menuItemId: number;
  menuItemName: string;
  category: string;
  selectedSize: string;
  selectedProtein: string | null;
  price: number;
}

// ── CUSTOMER FORM SCHEMA ─────────────────────────────────────────────────────
const customerSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  deliveryAddress: z.string().min(5, "Please enter your delivery address"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliverySlot: z.string().min(1, "Delivery slot is required"),
  notes: z.string().optional(),
});

// ── SMOOTH SCROLL HELPER ─────────────────────────────────────────────────────
function smoothScrollTo(el: HTMLElement | null, delay = 120) {
  if (!el) return;
  const t = setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, delay);
  return () => clearTimeout(t);
}

export default function BookPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // ── MENU DATA ──────────────────────────────────────────────────────────────
  const { data: menuItems, isLoading: loadingMenu } = useListMenuItems(
    {},
    { query: { queryKey: ["menuItems"] } }
  );
  const createOrder = useCreateOrder();

  // ── CART STATE ─────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pepperLevel, setPepperLevel] = useState<number>(1);
  const [pepperTouched, setPepperTouched] = useState(false);

  // Item configuration (for adding to cart)
  const [configItemId, setConfigItemId] = useState<number>(0);
  const [configSize, setConfigSize] = useState<string>("");
  const [configProtein, setConfigProtein] = useState<string>("");

  // ── SCROLL REFS ────────────────────────────────────────────────────────────
  const sizeRef    = useRef<HTMLDivElement>(null);
  const proteinRef = useRef<HTMLDivElement>(null);
  const addBtnRef  = useRef<HTMLDivElement>(null);
  const pepperRef  = useRef<HTMLDivElement>(null);
  const step1Ref   = useRef<HTMLDivElement>(null);

  // ── CUSTOMER FORM ──────────────────────────────────────────────────────────
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

  // ── DERIVED VALUES ─────────────────────────────────────────────────────────
  const configItem = useMemo(
    () => menuItems?.find((m) => m.id === configItemId),
    [menuItems, configItemId]
  );

  const distinctMealIds = useMemo(
    () => new Set(cart.map((i) => i.menuItemId)),
    [cart]
  );

  const isRushDay = useMemo(() => {
    if (!deliveryDate) return false;
    return deliveryDate === format(new Date(), "yyyy-MM-dd");
  }, [deliveryDate]);

  const rushFee = useMemo(
    () => calcRushFee(isRushDay, distinctMealIds.size),
    [isRushDay, distinctMealIds.size]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price, 0),
    [cart]
  );

  const grandTotal = cartTotal + rushFee;

  const configPrice = useMemo(() => {
    if (!configItem || !configSize) return 0;
    const sizeOpt = configItem.sizes.find((s) => s.label === configSize);
    const base = sizeOpt?.price ?? 0;
    const proteinOpt = configProtein && configProtein !== "none"
      ? configItem.proteins.find((p) => p.name === configProtein)
      : null;
    return base + (proteinOpt?.extraCost ?? 0);
  }, [configItem, configSize, configProtein]);

  const canAddToCart = useMemo(() => {
    if (!configItem || !configSize) return false;
    if (!distinctMealIds.has(configItemId) && distinctMealIds.size >= MAX_DISTINCT_MEALS) return false;
    return true;
  }, [configItem, configSize, configItemId, distinctMealIds]);

  const availableDates = useMemo(() =>
    Array.from({ length: 14 }).map((_, i) => format(addDays(new Date(), i), "yyyy-MM-dd")),
    []
  );

  // ── AUTO-SCROLL: dish selected → scroll to size ────────────────────────────
  useEffect(() => {
    if (!configItem) return;
    return smoothScrollTo(sizeRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configItem?.id]);

  // ── AUTO-SCROLL: size selected → scroll to protein or add button ───────────
  useEffect(() => {
    if (!configSize || !configItem) return;
    if (configItem.proteins.length > 0) {
      return smoothScrollTo(proteinRef.current);
    } else {
      return smoothScrollTo(addBtnRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configSize]);

  // ── AUTO-SCROLL: protein chosen → scroll to add button ────────────────────
  useEffect(() => {
    if (!configProtein) return;
    return smoothScrollTo(addBtnRef.current);
  }, [configProtein]);

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  function addToCart() {
    if (!configItem || !configSize) return;
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      menuItemId: configItem.id,
      menuItemName: configItem.name,
      category: configItem.category,
      selectedSize: configSize,
      selectedProtein: configProtein && configProtein !== "none" ? configProtein : null,
      price: configPrice,
    };
    setCart((prev) => [...prev, newItem]);
    setConfigItemId(0);
    setConfigSize("");
    setConfigProtein("");
    toast({ title: "Added to cart", description: `${configItem.name} — ${configSize}` });
    // Scroll back to dish selector for next item
    smoothScrollTo(step1Ref.current, 200);
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function onSubmit(values: z.infer<typeof customerSchema>) {
    if (cart.length === 0) {
      toast({ variant: "destructive", title: "Cart is empty", description: "Add at least one meal before booking." });
      return;
    }
    if (!pepperTouched) {
      toast({ variant: "destructive", title: "Pepper level required", description: "Please set your pepper preference before confirming." });
      smoothScrollTo(pepperRef.current, 0);
      return;
    }

    const primaryItem = cart[0];

    const cartSummary = cart
      .map((ci, idx) => `${idx + 1}. ${ci.menuItemName} — ${ci.selectedSize}${ci.selectedProtein ? ` + ${ci.selectedProtein}` : ""} (${formatNaira(ci.price)})`)
      .join("\n");
    const notesStr = [
      `CART (${cart.length} item${cart.length === 1 ? "" : "s"}):\n${cartSummary}`,
      `Pepper: ${PEPPER_LABELS[pepperLevel]}`,
      values.notes ? `Notes: ${values.notes}` : "",
    ].filter(Boolean).join("\n\n");

    createOrder.mutate(
      {
        data: {
          menuItemId: primaryItem.menuItemId,
          selectedSize: primaryItem.selectedSize,
          selectedProtein: primaryItem.selectedProtein,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerEmail: values.customerEmail || undefined,
          deliveryAddress: values.deliveryAddress,
          deliveryDate: values.deliveryDate as unknown as Date,
          deliverySlot: values.deliverySlot,
          notes: notesStr,
          // @ts-expect-error extended fields not in generated type
          cartItems: cart,
          // @ts-expect-error extended fields not in generated type
          pepperLevel: PEPPER_LABELS[pepperLevel],
        },
      },
      {
        onSuccess: (order) => {
          setLocation(`/booking-confirmed/${order.id}`);
        },
        onError: (err) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errorMsg = (err as any)?.data?.error || (err as any)?.message || "Failed to create booking";
          toast({ variant: "destructive", title: "Booking Error", description: errorMsg });
        },
      }
    );
  }

  const isSubmitting = createOrder.isPending;
  const canSubmit = cart.length > 0 && pepperTouched && !isSubmitting;

  return (
    <div className="min-h-screen bg-muted/30 pb-24" style={{ scrollBehavior: "smooth" }}>
      {/* Page header */}
      <div className="bg-foreground text-background pt-16 pb-20 rounded-b-[3rem] shadow-xl mb-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-4">Book a Slot</h1>
          <p className="text-xl text-background/70 max-w-xl">
            Add your meals, set your pepper level, fill in delivery details and we start cooking.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* STEP 1: Build Your Order */}
            <div ref={step1Ref} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-muted/40">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <h2 className="text-xl font-bold font-display">Build Your Order</h2>
                {cart.length > 0 && (
                  <span className="ml-auto text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-1">
                    {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                  </span>
                )}
              </div>

              <div className="p-6 md:p-8 space-y-6">

                {/* Distinct meal count */}
                {distinctMealIds.size > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex gap-1">
                      {Array.from({ length: MAX_DISTINCT_MEALS }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border-2 transition-colors duration-300"
                          style={{
                            background: i < distinctMealIds.size ? "#0F9E0F" : "transparent",
                            borderColor: i < distinctMealIds.size ? "#0F9E0F" : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">
                      {distinctMealIds.size} of {MAX_DISTINCT_MEALS} distinct meals
                    </span>
                  </div>
                )}

                {/* ── A: Dish selector ──────────────────────────────────── */}
                <div className="space-y-2">
                  <SubStepLabel letter="A" done={!!configItem}>Select a Dish</SubStepLabel>
                  <Select
                    disabled={loadingMenu || distinctMealIds.size >= MAX_DISTINCT_MEALS}
                    onValueChange={(val) => {
                      setConfigItemId(parseInt(val));
                      setConfigSize("");
                      setConfigProtein("");
                    }}
                    value={configItemId ? configItemId.toString() : ""}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={
                        loadingMenu ? "Loading menu…"
                        : distinctMealIds.size >= MAX_DISTINCT_MEALS ? `Maximum ${MAX_DISTINCT_MEALS} distinct meals reached`
                        : "Choose a dish"
                      } />
                    </SelectTrigger>
                    {/* max-h keeps the dropdown from filling the whole screen */}
                    <SelectContent className="max-h-72 overflow-y-auto">
                      {["soups", "stews", "breakfast"].map((cat) => {
                        const catItems = menuItems?.filter((i) => i.available && i.category === cat) ?? [];
                        if (catItems.length === 0) return null;
                        return (
                          <div key={cat}>
                            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 sticky top-0 bg-popover z-10">
                              {cat === "breakfast" ? "Breakfast" : cat.charAt(0).toUpperCase() + cat.slice(1)}
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

                {/* ── B: Size selector (revealed after dish pick) ───────── */}
                {configItem && (
                  <div
                    ref={sizeRef}
                    className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300"
                  >
                    <SubStepLabel letter="B" done={!!configSize}>
                      Choose Size
                      <span className="ml-2 text-xs font-normal text-muted-foreground">— {configItem.name}</span>
                    </SubStepLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {configItem.sizes.map((size) => (
                        <button
                          key={size.label}
                          type="button"
                          onClick={() => setConfigSize(size.label)}
                          className={`relative text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                            configSize === size.label
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          {configSize === size.label && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                          <div className="font-medium text-sm pr-5">{size.label}</div>
                          <div className="font-bold text-base mt-0.5">{formatNaira(size.price)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── C: Protein selector (revealed after size pick) ────── */}
                {configItem && configItem.proteins.length > 0 && configSize && (
                  <div
                    ref={proteinRef}
                    className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300"
                  >
                    <SubStepLabel
                      letter="C"
                      done={!!(configProtein && configProtein !== "")}
                    >
                      Add Protein
                      <span className="ml-2 text-xs font-normal text-muted-foreground">— optional</span>
                    </SubStepLabel>

                    {/* Scrollable protein row on small screens; wrapping grid on larger */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {/* No protein option */}
                      <button
                        type="button"
                        onClick={() => setConfigProtein("none")}
                        className={`text-center px-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                          configProtein === "none" || configProtein === ""
                            ? "border-border bg-muted"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <div className="text-[11px] font-medium text-muted-foreground leading-tight">None</div>
                        <div className="text-xs font-bold mt-0.5">—</div>
                      </button>

                      {configItem.proteins.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setConfigProtein(p.name)}
                          className={`relative text-center px-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                            configProtein === p.name
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          {configProtein === p.name && (
                            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </span>
                          )}
                          <div className="text-[11px] font-medium leading-tight pr-2">{p.name}</div>
                          <div className="text-xs font-bold mt-0.5 text-primary">+{formatNaira(p.extraCost)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Add to Cart ──────────────────────────────────────── */}
                {configItem && configSize && (
                  <div
                    ref={addBtnRef}
                    className="flex items-center gap-4 pt-1 animate-in fade-in duration-200"
                  >
                    <div className="text-sm text-muted-foreground">
                      Subtotal: <span className="font-bold text-foreground text-base">{formatNaira(configPrice)}</span>
                    </div>
                    <Button
                      type="button"
                      onClick={addToCart}
                      disabled={!canAddToCart}
                      className="ml-auto gap-2 h-11 px-6 rounded-xl font-bold"
                      style={{ background: "#0F9E0F" }}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>
                )}

                {/* ── Cart items list ──────────────────────────────────── */}
                {cart.length > 0 && (
                  <div className="rounded-xl border border-border overflow-hidden mt-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold text-sm">Your Cart</span>
                    </div>
                    <div className="divide-y divide-border">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{item.menuItemName}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.selectedSize}{item.selectedProtein ? ` + ${item.selectedProtein}` : ""}
                            </div>
                          </div>
                          <div className="font-bold text-sm">{formatNaira(item.price)}</div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
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

            {/* STEP 2: Pepper Level */}
            <div ref={pepperRef} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 md:px-8 py-5 border-b border-border bg-muted/40">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <h2 className="text-xl font-bold font-display">How Hot?</h2>
                {!pepperTouched && (
                  <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Required
                  </span>
                )}
                {pepperTouched && (
                  <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Set
                  </span>
                )}
              </div>
              <div className="p-6 md:p-8">
                <p className="text-sm text-muted-foreground mb-6">
                  This applies to everything in your cart. Move the slider to set your preference — this is required before you can confirm.
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    {PEPPER_LABELS.map((label, i) => (
                      <span key={i} className={i === pepperLevel ? PEPPER_COLORS[i] + " font-bold" : ""}>{label}</span>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={pepperLevel}
                    onChange={(e) => {
                      setPepperLevel(parseInt(e.target.value));
                      setPepperTouched(true);
                    }}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: pepperLevel === 0 ? "#059669" : pepperLevel === 1 ? "#d97706" : "#dc2626" }}
                  />
                  <div className={`text-center font-bold text-lg ${PEPPER_COLORS[pepperLevel]}`}>
                    {PEPPER_LABELS[pepperLevel]}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Delivery Details */}
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
                        <FormLabel>Email <span className="text-muted-foreground font-normal">(optional, for booking confirmation)</span></FormLabel>
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
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Pick a date" />
                              </SelectTrigger>
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
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Pick a time" />
                              </SelectTrigger>
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
                          <Textarea
                            placeholder="Allergen info, gate code, special requests…"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </form>
                </Form>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: ORDER SUMMARY ──────────────────────────────── */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border bg-muted/40">
                <h2 className="font-bold font-display text-lg">Order Summary</h2>
              </div>

              {cart.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p>Your cart is empty.<br />Add a dish above to get started.</p>
                </div>
              ) : (
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium leading-tight truncate">{item.menuItemName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.selectedSize}{item.selectedProtein ? ` + ${item.selectedProtein}` : ""}
                          </div>
                        </div>
                        <span className="font-bold shrink-0">{formatNaira(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  {rushFee > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">
                      <div className="flex justify-between items-center font-bold text-amber-800 mb-1">
                        <span>Rush fee (same-day)</span>
                        <span>{formatNaira(rushFee)}</span>
                      </div>
                      <p className="text-xs text-amber-700">
                        {distinctMealIds.size} dish{distinctMealIds.size !== 1 ? "es" : ""} × {formatNaira(RUSH_FEE_RATES[Math.min(distinctMealIds.size, 5)] ?? 10000)} each
                      </p>
                    </div>
                  )}

                  <div className="border-t border-dashed border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span style={{ color: "#0F9E0F" }}>{formatNaira(grandTotal)}</span>
                  </div>

                  {pepperTouched && (
                    <div className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
                      Pepper level: <span className={`font-bold ${PEPPER_COLORS[pepperLevel]}`}>{PEPPER_LABELS[pepperLevel]}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              form="booking-form"
              disabled={!canSubmit}
              className="w-full h-14 text-lg font-bold gap-2 rounded-xl"
              style={{ background: canSubmit ? "#0F9E0F" : undefined }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Booking…
                </>
              ) : (
                <>
                  Confirm Booking <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>

            {/* Validation hints */}
            {!canSubmit && !isSubmitting && (
              <div className="space-y-1.5">
                {cart.length === 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Add at least one meal
                  </p>
                )}
                {!pepperTouched && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Set your pepper level (Step 2)
                  </p>
                )}
              </div>
            )}

            {/* Payment note */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-1">Payment required before cooking</p>
              <p className="text-xs text-amber-700 dark:text-amber-600 leading-relaxed">
                After you confirm your slot, we'll send our bank details via WhatsApp and email. We only start cooking once payment is received.
              </p>
            </div>

            {/* Coming soon integrations */}
            <div className="bg-card rounded-2xl border border-dashed border-border p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Coming soon</p>
              <div className="text-sm text-muted-foreground/50 flex items-center gap-2">
                <span>💳</span> Pay with Paystack
              </div>
              <div className="text-sm text-muted-foreground/50 flex items-center gap-2">
                <span>📅</span> Add to Google Calendar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SUB-STEP LABEL ────────────────────────────────────────────────────────────
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
