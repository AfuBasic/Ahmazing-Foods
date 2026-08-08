import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatNaira, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./dashboard";
import { ChevronRight, Search, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrdersList() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "fulfilled">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["orders", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all" ? "/api/orders" : `/api/orders?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
    refetchInterval: 10_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast({
        title: vars.status === "fulfilled" ? "Order Fulfilled! 🎉" : "Order Reset to Pending",
        description: `Order #AHM-${vars.id.toString().padStart(4, "0")} marked as ${vars.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderSummary"] });
    },
  });

  const filteredOrders = (orders ?? []).filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.id?.toString().includes(term) ||
      o.customerName?.toLowerCase().includes(term) ||
      o.customerPhone?.includes(term) ||
      o.menuItemName?.toLowerCase().includes(term)
    );
  });

  const pendingCount = (orders ?? []).filter((o) => o.status === "pending").length;
  const fulfilledCount = (orders ?? []).filter((o) => o.status === "fulfilled" || o.status === "delivered").length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Orders are saved to database/orders.json and synchronized in real-time.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Filter Bar & Search */}
        <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Status Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                statusFilter === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Orders ({orders?.length ?? 0})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-background border border-border text-amber-700 dark:text-amber-400 hover:bg-amber-50"
              }`}
            >
              ⏳ Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("fulfilled")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                statusFilter === "fulfilled"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-background border border-border text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
              }`}
            >
              ✅ Fulfilled ({fulfilledCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Delivery Date</th>
                <th className="px-6 py-4 font-medium">Customer Info</th>
                <th className="px-6 py-4 font-medium">Ordered Item</th>
                <th className="px-6 py-4 font-medium">Total Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Quick Action</th>
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
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center text-muted-foreground">
                    No orders found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPending = order.status === "pending";
                  const isFulfilled = order.status === "fulfilled" || order.status === "delivered";

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-foreground">
                        #AHM-{order.id.toString().padStart(4, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{formatDate(order.deliveryDate)}</p>
                        <p className="text-xs text-muted-foreground">{order.deliverySlot}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        {order.deliveryAddress && (
                          <p className="text-xs text-muted-foreground/75 truncate max-w-[180px]" title={order.deliveryAddress}>
                            📍 {order.deliveryAddress}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[220px]">
                        <p className="font-medium text-foreground truncate">{order.menuItemName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.selectedSize} {order.selectedProtein ? `+ ${order.selectedProtein}` : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground tabular-nums">
                        {formatNaira(order.total)}
                        {order.rushFee > 0 && <span className="text-[10px] block text-amber-600 font-bold">RUSH</span>}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <Button
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: "fulfilled" })}
                              disabled={updateStatusMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 text-xs h-8 px-3 rounded-lg shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Fulfilled
                            </Button>
                          )}

                          {isFulfilled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: order.id, status: "pending" })}
                              disabled={updateStatusMutation.isPending}
                              className="text-xs h-8 px-2.5 rounded-lg text-muted-foreground hover:text-foreground gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Revert to Pending
                            </Button>
                          )}

                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/admin/orders/${order.id}`}>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}