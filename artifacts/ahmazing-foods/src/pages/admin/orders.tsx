import { useState } from "react";
import { Link } from "wouter";
import { useListOrders, ListOrdersStatus } from "@workspace/api-client-react";
import { formatNaira, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "./dashboard";
import { ChevronRight, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminOrdersList() {
  const [statusFilter, setStatusFilter] = useState<ListOrdersStatus | "all">("all");
  
  const { data: orders, isLoading } = useListOrders(
    statusFilter === "all" ? {} : { status: statusFilter },
    { query: { queryKey: ["orders", statusFilter] } }
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">All Orders</h1>
          <p className="text-muted-foreground">Manage and update customer bookings.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Filters bar */}
        <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by ID or name... (UI only)" 
              className="pl-9 h-10 bg-background"
              disabled
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Select 
              value={statusFilter} 
              onValueChange={(v) => setStatusFilter(v as ListOrdersStatus | "all")}
            >
              <SelectTrigger className="h-10 bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cooking">Cooking</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Order Details</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border relative">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading orders...</p>
                  </td>
                </tr>
              ) : orders?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center text-muted-foreground">
                    No orders found matching this filter.
                  </td>
                </tr>
              ) : orders?.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-mono font-medium">
                    AHM-{order.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{formatDate(order.deliveryDate)}</p>
                    <p className="text-xs text-muted-foreground">{order.deliverySlot}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <p className="font-medium text-foreground truncate">{order.menuItemName}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.selectedSize} {order.selectedProtein ? `+ ${order.selectedProtein}` : ''}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {formatNaira(order.total)}
                    {order.rushFee > 0 && <span className="text-[10px] block text-accent font-bold">RUSH</span>}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button asChild variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/orders/${order.id}`}>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}