import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { formatNaira, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Copy, ChefHat, Calendar, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
              
              <div>
                <h3 className="text-xl font-bold font-display">{order.menuItemName}</h3>
                <p className="text-muted-foreground">
                  {order.selectedSize} 
                  {order.selectedProtein ? ` • With ${order.selectedProtein}` : ''}
                </p>
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

        {/* Next Steps Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-primary/10 text-primary-foreground p-6 rounded-2xl border border-primary/20 text-center">
              <h4 className="font-bold text-primary font-display mb-1">Status</h4>
              <p className="text-primary capitalize font-medium">{order.status}</p>
           </div>
           <div className="bg-card p-6 rounded-2xl border border-border text-center flex flex-col justify-center">
              <p className="text-sm text-muted-foreground">Expect payment instructions via SMS shortly.</p>
           </div>
        </div>

      </div>
    </div>
  );
}