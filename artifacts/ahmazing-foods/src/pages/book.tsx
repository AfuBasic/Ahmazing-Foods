import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, isBefore } from "date-fns";

import { useListMenuItems, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RUSH_FEE = 2000;
const DELIVERY_SLOTS = ["8–10am", "10am–12pm", "12–2pm", "2–4pm", "4–6pm"];

const formSchema = z.object({
  menuItemId: z.coerce.number().min(1, "Please select an item"),
  selectedSize: z.string().min(1, "Please select a size"),
  selectedProtein: z.string().optional().nullable(),
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliverySlot: z.string().min(1, "Delivery slot is required"),
  notes: z.string().optional(),
});

export default function BookPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get initial item from URL if present
  const searchParams = new URLSearchParams(window.location.search);
  const initialItemId = searchParams.get("item");

  const { data: menuItems, isLoading: loadingMenu } = useListMenuItems({}, { query: { queryKey: ["menuItems"] } });
  
  const createOrder = useCreateOrder();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      menuItemId: initialItemId ? parseInt(initialItemId) : 0,
      selectedSize: "",
      selectedProtein: "",
      customerName: "",
      customerPhone: "",
      deliveryDate: "",
      deliverySlot: "",
      notes: "",
    },
  });

  const selectedItemId = form.watch("menuItemId");
  const selectedSizeLabel = form.watch("selectedSize");
  const selectedProteinName = form.watch("selectedProtein");
  const deliveryDate = form.watch("deliveryDate");

  // Reset dependent fields when item changes
  useEffect(() => {
    if (selectedItemId) {
      form.setValue("selectedSize", "");
      form.setValue("selectedProtein", "");
    }
  }, [selectedItemId, form]);

  const selectedItem = useMemo(() => {
    return menuItems?.find((item) => item.id === selectedItemId);
  }, [menuItems, selectedItemId]);

  const pricing = useMemo(() => {
    if (!selectedItem) return { itemPrice: 0, rushFee: 0, total: 0 };
    
    let basePrice = 0;
    if (selectedSizeLabel) {
      const size = selectedItem.sizes.find(s => s.label === selectedSizeLabel);
      if (size) basePrice += size.price;
    }

    if (selectedProteinName && selectedProteinName !== "none") {
      const protein = selectedItem.proteins.find(p => p.name === selectedProteinName);
      if (protein) basePrice += protein.extraCost;
    }

    let rushFee = 0;
    if (deliveryDate) {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      if (deliveryDate === todayStr) {
        rushFee = RUSH_FEE;
      }
    }

    return {
      itemPrice: basePrice,
      rushFee,
      total: basePrice + rushFee
    };
  }, [selectedItem, selectedSizeLabel, selectedProteinName, deliveryDate]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    createOrder.mutate(
      { 
        data: {
          ...values,
          selectedProtein: values.selectedProtein === "none" ? null : values.selectedProtein,
        }
      },
      {
        onSuccess: (order) => {
          setLocation(`/booking-confirmed/${order.id}`);
        },
        onError: (err) => {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           const errorMsg = (err as any)?.error || "Failed to create booking";
           toast({
             variant: "destructive",
             title: "Booking Error",
             description: errorMsg,
           });
        }
      }
    );
  }

  // Generate next 14 days for date picker
  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return format(d, "yyyy-MM-dd");
  });

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-display text-foreground">Book a Slot</h1>
          <p className="text-muted-foreground text-lg mt-2">Fill the form to secure your pot. Freshly made to order.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Step 1: The Meal */}
                <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</div>
                    <h2 className="text-xl font-bold font-display">The Meal</h2>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="menuItemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select a Meal</FormLabel>
                          <Select 
                            disabled={loadingMenu}
                            onValueChange={(val) => field.onChange(parseInt(val))} 
                            value={field.value ? field.value.toString() : ""}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder={loadingMenu ? "Loading menu..." : "Choose what you're craving"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {menuItems?.filter(i => i.available).map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                  {item.name} <span className="text-muted-foreground ml-2 text-xs uppercase tracking-wider">{item.category}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedItem && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="selectedSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Size</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {selectedItem.sizes.map((size) => (
                                    <SelectItem key={size.label} value={size.label}>
                                      {size.label} — {formatNaira(size.price)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {selectedItem.proteins && selectedItem.proteins.length > 0 && (
                          <FormField
                            control={form.control}
                            name="selectedProtein"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Protein Add-on (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger className="h-12">
                                      <SelectValue placeholder="Select protein" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">No extra protein</SelectItem>
                                    {selectedItem.proteins.map((p) => (
                                      <SelectItem key={p.name} value={p.name}>
                                        {p.name} — +{formatNaira(p.extraCost)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Delivery Details */}
                <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold">2</div>
                    <h2 className="text-xl font-bold font-display">Delivery Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. Chinedu Okafor" className="h-12" {...field} />
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
                            <Input placeholder="E.g. 08012345678" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Date</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select date" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableDates.map((date, i) => (
                                <SelectItem key={date} value={date}>
                                  {format(new Date(date), "EEEE, MMM d")}
                                  {i === 0 && " (Today - Rush Fee)"}
                                </SelectItem>
                              ))}
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
                          <FormLabel>Time Slot</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select window" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DELIVERY_SLOTS.map((slot) => (
                                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any allergies or specific directions for the delivery driver?" 
                              className="resize-none min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Mobile Submit (Hidden on lg, sticky on small) */}
                <div className="lg:hidden sticky bottom-4 z-10">
                   <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-bold rounded-full shadow-2xl bg-primary text-primary-foreground"
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                      Confirm Booking • {formatNaira(pricing.total)}
                    </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="bg-foreground text-background p-6 rounded-2xl sticky top-28 shadow-xl">
              <h3 className="font-display text-2xl font-bold mb-6 border-b border-background/20 pb-4">Order Summary</h3>
              
              {!selectedItem ? (
                <div className="text-center py-8 text-background/60">
                  <p>Select a meal to see your summary.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-lg">{selectedItem.name}</h4>
                    <p className="text-sm text-background/70 uppercase tracking-wider">{selectedItem.category}</p>
                  </div>
                  
                  <div className="space-y-3 text-sm border-b border-background/20 pb-6">
                    <div className="flex justify-between items-start">
                      <span className="text-background/80">
                        Base Size <br/>
                        <span className="font-bold text-background">{selectedSizeLabel || "Not selected"}</span>
                      </span>
                      <span>
                        {selectedSizeLabel 
                          ? formatNaira(selectedItem.sizes.find(s=>s.label === selectedSizeLabel)?.price || 0)
                          : "—"}
                      </span>
                    </div>

                    {selectedProteinName && selectedProteinName !== "none" && (
                      <div className="flex justify-between items-start pt-2">
                        <span className="text-background/80">
                          Extra Protein <br/>
                          <span className="font-bold text-background">{selectedProteinName}</span>
                        </span>
                        <span>
                          +{formatNaira(selectedItem.proteins.find(p=>p.name === selectedProteinName)?.extraCost || 0)}
                        </span>
                      </div>
                    )}

                    {pricing.rushFee > 0 && (
                      <div className="flex justify-between items-start pt-2 text-accent">
                        <span>
                          Rush Fee <br/>
                          <span className="text-xs opacity-80">&lt; 24h delivery notice</span>
                        </span>
                        <span>+{formatNaira(pricing.rushFee)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-end pt-2">
                    <span className="text-lg text-background/80">Total</span>
                    <span className="text-3xl font-display font-bold text-primary">{formatNaira(pricing.total)}</span>
                  </div>

                  <Button 
                    className="w-full h-14 mt-4 text-lg font-bold rounded-xl hidden lg:flex" 
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    Confirm Booking
                  </Button>

                  <div className="flex items-start gap-2 mt-4 text-xs text-background/60 bg-background/5 p-3 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-secondary" />
                    <p>Pay on delivery or via bank transfer after confirmation.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}