import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { OrderSide, OrderStatus, OrderType } from "../backend";
import type { Order } from "../backend";
import { sampleOrders } from "../data/sampleData";
import { useCancelOrder, useOrders } from "../hooks/useQueries";

function StatusBadge({ status }: { status: OrderStatus }) {
  const variants: Record<OrderStatus, string> = {
    [OrderStatus.filled]: "bg-gain/15 text-gain border-gain/20",
    [OrderStatus.pending]: "bg-chart-4/15 text-chart-4 border-chart-4/20",
    [OrderStatus.cancelled]: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${variants[status]}`}
    >
      {status}
    </span>
  );
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const FILTERS = ["All", "Filled", "Pending", "Cancelled"] as const;
type Filter = (typeof FILTERS)[number];

const SKELETON_ROWS = ["s1", "s2", "s3", "s4", "s5"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

export function Orders() {
  const { data: ordersData, isLoading } = useOrders();
  const cancelOrder = useCancelOrder();
  const [filter, setFilter] = useState<Filter>("All");

  const orders: Order[] = ordersData ?? sampleOrders;

  const filtered = orders.filter((o) => {
    if (filter === "All") return true;
    return o.status.toLowerCase() === filter.toLowerCase();
  });

  const displayItems = filtered.slice(0, 20);

  return (
    <div className="p-5 lg:p-7 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-2xl font-bold">Order History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {orders.length} total orders
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            data-ocid="orders.filter.tab"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              filter === f
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card className="bg-card border-border">
        <div className="overflow-x-auto">
          <Table data-ocid="orders.table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider pl-5">
                  Time
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                  Asset
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                  Side
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                  Qty
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                  Price
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                  Total
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-center">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase tracking-wider pr-5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? SKELETON_ROWS.map((rowKey) => (
                    <TableRow
                      key={rowKey}
                      className="border-border"
                      data-ocid="orders.loading_state"
                    >
                      {SKELETON_COLS.map((colKey) => (
                        <TableCell key={colKey}>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : displayItems.map((order, i) => {
                    const idx = i + 1;
                    const isBuy = order.side === OrderSide.buy;
                    const total = order.quantity * order.price;
                    const isPending = order.status === OrderStatus.pending;

                    return (
                      <TableRow
                        key={order.id.toString()}
                        data-ocid={`orders.item.${idx}`}
                        className="border-border hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="pl-5 text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {formatTimestamp(order.timestamp)}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold">
                            {order.symbol}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                              isBuy
                                ? "text-gain bg-gain-subtle"
                                : "text-loss bg-loss-subtle"
                            }`}
                          >
                            {order.side}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground uppercase">
                            {order.orderType === OrderType.market
                              ? "MKT"
                              : "LMT"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {order.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          $
                          {order.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium">
                          $
                          {total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="pr-5">
                          {isPending && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-6 h-6 hover:bg-loss/10 hover:text-loss"
                              onClick={() => cancelOrder.mutate(order.id)}
                              disabled={cancelOrder.isPending}
                            >
                              {cancelOrder.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>

        {!isLoading && displayItems.length === 0 && (
          <div data-ocid="orders.empty_state" className="py-16 text-center">
            <p className="text-muted-foreground text-sm">No orders found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
