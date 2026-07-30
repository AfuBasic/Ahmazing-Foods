import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { formatNaira, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Copy, ChefHat, Calendar, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Format protein description for a cart item
function proteinDesc(proteins: { name: string; qty: number }[]): string {
  if (!proteins || proteins.length === 0) return "";
  return proteins.map((p) => (p.qty > 1 ? `${p.name} ×${p.qty}` : p.name)).join(", ");
}

export default function BookingConfirmedPage() {
  const { id } = useParams();
  const orderId = id ? parseInt(id) : 0;
  const { toast } = useToast();

  const { data: order, isLoading, error } = useGetOrder(orderId, {
    query: {
      enabled: !!orderId,
      queryKey: ["order", orderId]
    }
  });

  const copyToClipboard = () => {
    if (order) {
      navigator.clipboard.writeText(`AHM-${order.id.toString().padStart(4, '0')}`);
      toast({
        title: "Copied!",
        description: "Order reference copied to clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-24 flex justify-center">
        <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-sm border border-border">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-10" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-muted/30 py-24 flex justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the booking details.</p>
          <Button asChild><Link href="/">Return Home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-lg">
        
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground pl-0">
             <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Link>
          </Button>
        </div>

        <div className="bg-card rounded-[2rem] shadow-xl overflow-hidden border border-border">
          
          {/* Header */}
          <div className="bg-secondary text-secondary-foreground p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 opacity-10">
              <ChefHat className="w-48 h-48" />
            </div>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-display font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-secondary-foreground/80">Thank you, {order.customerName.split(' ')[0]}. Your pot is locked in.</p>
          </div>

          {/* Ticket Body */}
          <div className="p-8">
            
            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-xl border border-border/50 mb-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Booking Ref</p>
                <p className="font-mono font-bold text-lg">AHM-{order.id.toString().padStart(4, '0')}</p>
              </div>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">

              {/* Order items list */}
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {order.cartItems && order.cartItems.length > 1 ? `Your Order (${order.cartItems.length} items)` : "Your Order"}
                </p>

                {order.cartItems && order.cartItems.length > 0 ? (
                  <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                    {order.cartItems.map((item, i) => {
                      const prots = proteinDesc(item.selectedProteins ?? []);
                      return (
                        <div key={i} className="flex justify-between items-start gap-3 px-4 py-3 bg-muted/30">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-snug">
                              {item.menuItemName}
                              {(item.itemQty ?? 1) > 1 && (
                                <span className="ml-1 text-muted-foreground font-normal">×{item.itemQty}</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.selectedSize}
                              {prots ? ` · ${prots}` : ""}
                            </p>
                          </div>
                          <span className="text-sm font-semibold tabular-nums shrink-0">{formatNaira(item.price)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Fallback for legacy single-item orders */
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex justify-between items-start gap-3 px-4 py-3 bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{order.menuItemName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.selectedSize}
                          {order.selectedProtein ? ` · With ${order.selectedProtein}` : ""}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums shrink-0">{formatNaira(order.itemPrice)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center text-xs text-muted-foreground"><Calendar className="w-3 h-3 mr-1" /> Delivery Date</span>
                  <span className="font-medium">{formatDate(order.deliveryDate)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center text-xs text-muted-foreground"><Clock className="w-3 h-3 mr-1" /> Time Slot</span>
                  <span className="font-medium">{order.deliverySlot}</span>
                </div>
              </div>

              <div className="space-y-2 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Item total</span>
                  <span>{formatNaira(order.itemPrice)}</span>
                </div>
                {order.rushFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rush fee</span>
                    <span>{formatNaira(order.rushFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total Due</span>
                  <span className="text-primary">{formatNaira(order.total)}</span>
                </div>
              </div>

              <div className="pt-2">
                 <p className="text-sm text-center text-muted-foreground">
                   We will call you on <span className="font-medium text-foreground">{order.customerPhone}</span> before dispatch.
                 </p>
              </div>
            </div>

          </div>
        </div>

        {/* Payment Instructions */}
        <div className="mt-8 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
          <h4 className="font-bold font-display text-lg mb-3 text-foreground">Payment Details</h4>
          <p className="text-sm text-muted-foreground mb-4">Transfer your total of <span className="font-bold text-foreground">{formatNaira(order.total)}</span> to complete your booking:</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground">Bank</span>
              <span className="font-semibold">FCMB</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground">Account Name</span>
              <span className="font-semibold">Ahmazing Cuisine</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Account Number</span>
              <span className="font-bold text-lg tracking-widest">1009414545</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Use your booking ref <span className="font-mono font-bold">AHM-{order.id.toString().padStart(4, '0')}</span> as payment narration. We'll confirm your order once payment is received.</p>
        </div>

        {/* Status */}
        <div className="mt-4 bg-card p-5 rounded-2xl border border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Order Status</span>
          <span className="font-bold capitalize text-primary">{order.status}</span>
        </div>

      </div>
    </div>
  );
}