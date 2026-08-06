import { useGetOrderSummary } from "@workspace/api-client-react";
import { formatNaira, formatDate } from "@/lib/format";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CircleDollarSign, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: summary, isLoading } = useGetOrderSummary({
    query: { queryKey: ["orderSummary"] }
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/admin/orders">View All Orders</Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>

      {isLoading || !summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl mt-8" />
        </>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Today's Revenue" 
              value={formatNaira(summary.todayRevenue)}
              subtitle={`${summary.todayOrders} orders today`}
              icon={<CircleDollarSign className="w-5 h-5 text-primary" />}
              trend="up"
            />
            <StatCard 
              title="Pending Bookings" 
              value={summary.pendingOrders.toString()}
              subtitle="Requires confirmation"
              icon={<Clock className="w-5 h-5 text-amber-500" />}
              highlight
            />
            <StatCard 
              title="Currently Cooking" 
              value={summary.cookingOrders.toString()}
              subtitle="In the kitchen right now"
              icon={<Activity className="w-5 h-5 text-blue-500" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Recent Orders List */}
            <div className="lg:col-span-3 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-bold font-display">Recent Orders</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/orders">See all</Link>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-medium">Order ID</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Item</th>
                      <th className="px-6 py-4 font-medium">Delivery</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {summary.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          No recent orders found.
                        </td>
                      </tr>
                    ) : summary.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium">
                          <Link href={`/admin/orders/${order.id}`} className="hover:text-primary">
                            AHM-{order.id.toString().padStart(4, '0')}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground truncate max-w-[150px]">{order.menuItemName}</p>
                          <p className="text-xs text-muted-foreground">{order.selectedSize}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{formatDate(order.deliveryDate)}</p>
                          <p className="text-xs text-muted-foreground">{order.deliverySlot}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {formatNaira(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total System Stats */}
            <div className="bg-foreground text-background p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold font-display border-b border-background/20 pb-4 mb-6 text-background/90">All-Time Stats</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-background/60 mb-1">Total Revenue</p>
                    <p className="text-3xl font-display font-bold text-primary">{formatNaira(summary.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-background/60 mb-1">Total Orders</p>
                    <p className="text-2xl font-display font-bold">{summary.totalOrders}</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-background/20">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <p className="text-background/60 mb-1">Delivered</p>
                     <p className="font-bold text-lg">{summary.deliveredOrders}</p>
                   </div>
                   <div>
                     <p className="text-background/60 mb-1">Cancelled</p>
                     <p className="font-bold text-lg text-destructive">{summary.cancelledOrders}</p>
                   </div>
                 </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, highlight = false, trend }: { title: string, value: string, subtitle: string, icon: React.ReactNode, highlight?: boolean, trend?: "up" | "down" }) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border shadow-sm flex flex-col",
      highlight ? "bg-primary/5 border-primary/20" : "bg-card border-border"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
          {icon}
        </div>
        {trend === "up" && <TrendingUp className="w-4 h-4 text-secondary" />}
      </div>
      <h3 className="text-3xl font-bold font-display text-foreground mb-1">{value}</h3>
      <p className="font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:            { label: "Pending",             cls: "bg-amber-100 text-amber-800 border-amber-200" },
  payment_confirmed:  { label: "Payment Confirmed",   cls: "bg-blue-100 text-blue-800 border-blue-200" },
  cooking_in_progress:{ label: "Cooking in Progress", cls: "bg-orange-100 text-orange-800 border-orange-200" },
  rider_on_the_way:   { label: "Rider on the Way",    cls: "bg-purple-100 text-purple-800 border-purple-200" },
  rider_waiting:      { label: "Rider Waiting",       cls: "bg-pink-100 text-pink-800 border-pink-200" },
  rider_heading_back: { label: "Rider Heading Back",  cls: "bg-red-100 text-red-800 border-red-200" },
  delivered:          { label: "Delivered",           cls: "bg-secondary/20 text-secondary border-secondary/30" },
  cancelled:          { label: "Cancelled",           cls: "bg-destructive/10 text-destructive border-destructive/20" },
  // legacy — kept for backward-compat display
  confirmed:          { label: "Payment Confirmed",   cls: "bg-blue-100 text-blue-800 border-blue-200" },
  cooking:            { label: "Cooking in Progress", cls: "bg-orange-100 text-orange-800 border-orange-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn(
      "px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border whitespace-nowrap",
      cfg?.cls ?? "bg-muted text-muted-foreground border-border"
    )}>
      {cfg?.label ?? status}
    </span>
  );
}