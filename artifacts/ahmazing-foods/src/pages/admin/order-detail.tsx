import { useParams, Link } from "wouter";
import { 
  useGetOrder, 
  useUpdateOrderStatus, 
  getGetOrderQueryKey,
  OrderStatusUpdateStatus 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatNaira, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./dashboard";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  CreditCard, 
  MessageSquare,
  MessageCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

function toWaNumber(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) return "234" + d.slice(1);
  if (!d.startsWith("234")) return "234" + d;
  return d;
}

function buildWaMessage(order: { customerName: string; menuItemName: string; selectedSize: string; deliveryDate: string; deliverySlot: string; total: number }, orderId: number, status: string): string {
  const id = orderId.toString().padStart(4, "0");
  const total = `₦${order.total.toLocaleString("en-NG")}`;
  if (status === "confirmed") {
    return encodeURIComponent(
      `Hi ${order.customerName}! 👋\n\nYour AHmazing Foods booking is confirmed (Order #${id}).\n\n📋 ${order.menuItemName} — ${order.selectedSize}\n📅 Delivery: ${order.deliveryDate}, ${order.deliverySlot}\n💰 Total: ${total}\n\nPlease make payment to lock in your slot — we only start cooking once payment clears. We'll send our account details shortly.\n\nThank you! — AHmazing Foods`
    );
  }
  return encodeURIComponent(
    `Hi ${order.customerName}! 🔥\n\nGreat news — we've started cooking your order right now!\n\n📋 ${order.menuItemName} — ${order.selectedSize} (Order #${id})\n📅 Delivery: ${order.deliveryDate}, ${order.deliverySlot}\n\nYour meal will be fresh and ready on time. Thank you for choosing AHmazing Foods! 🍲`
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const orderId = id ? parseInt(id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useGetOrder(orderId, {
    query: {
      enabled: !!orderId,
      queryKey: getGetOrderQueryKey(orderId)
    }
  });

  const updateStatus = useUpdateOrderStatus();
  const [localStatus, setLocalStatus] = useState<OrderStatusUpdateStatus | "">("");

  useEffect(() => {
    if (order && !localStatus) {
      setLocalStatus(order.status as OrderStatusUpdateStatus);
    }
  }, [order, localStatus]);

  const handleStatusChange = (newStatus: OrderStatusUpdateStatus) => {
    setLocalStatus(newStatus);
    updateStatus.mutate(
      { id: orderId, data: { status: newStatus } },
      {
        onSuccess: (updatedOrder) => {
          queryClient.setQueryData(getGetOrderQueryKey(orderId), updatedOrder);
          toast({
             title: "Status Updated",
             description: `Order is now ${newStatus}.`,
          });
        },
        onError: () => {
          setLocalStatus(order?.status as OrderStatusUpdateStatus);
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not change order status.",
          });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="p-10"><Skeleton className="h-[600px] w-full rounded-2xl max-w-4xl mx-auto" /></div>;
  }

  if (error || !order) {
    return (
      <div className="p-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Button asChild><Link href="/admin/orders">Back to Orders</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <Button asChild variant="link" className="text-muted-foreground hover:text-foreground pl-0 mb-4">
        <Link href="/admin/orders"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders</Link>
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight flex items-center gap-4">
            Order <span className="font-mono text-primary">#{order.id.toString().padStart(4, '0')}</span>
          </h1>
          <p className="text-muted-foreground mt-2">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Update Status</label>
          <Select 
             value={localStatus} 
             onValueChange={(val) => handleStatusChange(val as OrderStatusUpdateStatus)}
             disabled={updateStatus.isPending}
          >
            <SelectTrigger className="w-full md:w-[200px] h-12 text-base font-bold capitalize">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cooking">Cooking</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled" className="text-destructive">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Customer & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Info */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold font-display">The Meal</h2>
            </div>
            <div className="p-6">
               <h3 className="text-2xl font-bold mb-1">{order.menuItemName}</h3>
               <p className="text-sm uppercase tracking-wider text-muted-foreground mb-6 font-bold">{order.category}</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="bg-background border border-border p-4 rounded-xl">
                   <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Size Selected</p>
                   <p className="font-bold text-lg">{order.selectedSize}</p>
                 </div>
                 {order.selectedProtein && (
                   <div className="bg-background border border-border p-4 rounded-xl">
                     <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Extra Protein</p>
                     <p className="font-bold text-lg">{order.selectedProtein}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border bg-muted/30">
                <h2 className="text-lg font-bold font-display">Delivery Schedule</h2>
              </div>
              <div className="p-5 space-y-4">
                 <div className="flex items-start gap-3">
                   <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                   <div>
                     <p className="text-sm font-medium">Date</p>
                     <p className="text-foreground">{formatDate(order.deliveryDate)}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                   <div>
                     <p className="text-sm font-medium">Time Window</p>
                     <p className="text-foreground">{order.deliverySlot}</p>
                   </div>
                 </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border bg-muted/30">
                <h2 className="text-lg font-bold font-display">Customer Details</h2>
              </div>
              <div className="p-5 space-y-4">
                 <div className="flex items-start gap-3">
                   <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                   <div>
                     <p className="text-sm font-medium">Name</p>
                     <p className="text-foreground">{order.customerName}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                   <div>
                     <p className="text-sm font-medium">Phone</p>
                     <p className="text-foreground">{order.customerPhone}</p>
                   </div>
                 </div>
              </div>
            </div>

          </div>

          {order.notes && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 shadow-sm flex items-start gap-4">
               <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
               <div>
                 <h3 className="font-bold text-amber-900 dark:text-amber-500 mb-1">Customer Notes</h3>
                 <p className="text-amber-800 dark:text-amber-600/80 whitespace-pre-wrap">{order.notes}</p>
               </div>
            </div>
          )}

        </div>

        {/* Right Column: Financials */}
        <div className="lg:col-span-1">
           <div className="bg-foreground text-background rounded-2xl p-6 shadow-xl sticky top-24">
             <h3 className="text-xl font-bold font-display mb-6 border-b border-background/20 pb-4 flex items-center gap-2">
               <CreditCard className="w-5 h-5" /> Financials
             </h3>
             
             <div className="space-y-4 mb-6 text-sm">
               <div className="flex justify-between">
                 <span className="text-background/70">Item Total (incl. proteins)</span>
                 <span>{formatNaira(order.itemPrice)}</span>
               </div>
               
               {order.rushFee > 0 && (
                 <div className="flex justify-between text-accent">
                   <span>Rush Fee</span>
                   <span>{formatNaira(order.rushFee)}</span>
                 </div>
               )}
             </div>

             <div className="border-t border-background/20 pt-4 flex justify-between items-end">
               <span className="text-background/80 text-lg">Total</span>
               <span className="text-3xl font-bold font-display text-primary">{formatNaira(order.total)}</span>
             </div>

             <div className="mt-8 bg-background/5 p-4 rounded-xl border border-background/10">
                <p className="text-xs text-background/60 uppercase tracking-wider mb-2 font-bold">Current Status</p>
                <div className="inline-flex">
                  <StatusBadge status={order.status} />
                </div>
                
                {order.paystackRef && (
                  <div className="mt-4 pt-4 border-t border-background/10">
                    <p className="text-xs text-background/60 uppercase tracking-wider mb-1 font-bold">Payment Ref</p>
                    <p className="font-mono text-xs truncate text-background/80">{order.paystackRef}</p>
                  </div>
                )}
             </div>

             {/* WhatsApp Notification */}
             {(localStatus === "confirmed" || localStatus === "cooking") && (
               <div className="mt-6 pt-6 border-t border-background/20">
                 <p className="text-xs text-background/60 uppercase tracking-wider mb-3 font-bold">Notify Customer</p>
                 <a
                   href={`https://wa.me/${toWaNumber(order.customerPhone)}?text=${buildWaMessage(order, orderId, localStatus)}`}
                   target="_blank"
                   rel="noreferrer"
                   className="flex items-center justify-center gap-2 w-full font-bold text-sm px-4 py-3 rounded-xl transition-colors"
                   style={{ background: "#25D366", color: "#fff" }}
                 >
                   <MessageCircle className="w-4 h-4" />
                   {localStatus === "confirmed" ? "Send Payment Request" : "Notify: Cooking Started"}
                 </a>
                 <p className="mt-2 text-center text-xs text-background/50">Opens WhatsApp with message pre-filled</p>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}