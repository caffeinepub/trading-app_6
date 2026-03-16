import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { samplePortfolio } from "../data/sampleData";
import { usePortfolio } from "../hooks/useQueries";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

const SKELETON_ROWS = ["s1", "s2", "s3", "s4", "s5"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6"];

export function Dashboard() {
  const { data: portfolio, isLoading } = usePortfolio();
  const data = portfolio ?? samplePortfolio;

  const holdings = useMemo(() => {
    return data.holdings.map((h) => {
      const value = h.quantity * h.currentPrice;
      const pnl = (h.currentPrice - h.averageCost) * h.quantity;
      const pnlPct = ((h.currentPrice - h.averageCost) / h.averageCost) * 100;
      return { ...h, value, pnl, pnlPct };
    });
  }, [data.holdings]);

  const isPositive = data.dailyPnL >= 0;

  return (
    <div className="p-5 lg:p-7 space-y-7">
      {/* Page header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Portfolio Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Value */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          <Card
            data-ocid="portfolio.total_value.card"
            className="bg-card border-border relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Total Value
                  </p>
                  {isLoading ? (
                    <Skeleton className="w-32 h-8 mt-1" />
                  ) : (
                    <p className="font-mono text-2xl font-bold text-foreground mt-1">
                      $
                      {data.totalValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>
                <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center mt-0.5">
                  <Wallet className="w-4.5 h-4.5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily P&L */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          <Card
            data-ocid="portfolio.pnl.card"
            className="bg-card border-border relative overflow-hidden"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 ${isPositive ? "bg-gain/5" : "bg-loss/5"}`}
            />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Daily P&amp;L
                  </p>
                  {isLoading ? (
                    <Skeleton className="w-32 h-8 mt-1" />
                  ) : (
                    <>
                      <p
                        className={`font-mono text-2xl font-bold mt-1 ${isPositive ? "text-gain" : "text-loss"}`}
                      >
                        {isPositive ? "+" : ""}$
                        {data.dailyPnL.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p
                        className={`text-xs font-mono mt-0.5 ${isPositive ? "text-gain" : "text-loss"}`}
                      >
                        {isPositive ? "+" : ""}
                        {data.dailyPnLPercent.toFixed(2)}%
                      </p>
                    </>
                  )}
                </div>
                <div
                  className={`w-9 h-9 rounded flex items-center justify-center mt-0.5 ${isPositive ? "bg-gain/10" : "bg-loss/10"}`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4.5 h-4.5 text-gain" />
                  ) : (
                    <TrendingDown className="w-4.5 h-4.5 text-loss" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Holdings count */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          <Card className="bg-card border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-chart-3/5 rounded-full -translate-y-8 translate-x-8" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Holdings
                  </p>
                  {isLoading ? (
                    <Skeleton className="w-16 h-8 mt-1" />
                  ) : (
                    <p className="font-mono text-2xl font-bold text-foreground mt-1">
                      {data.holdings.length}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Active positions
                  </p>
                </div>
                <div className="w-9 h-9 rounded bg-chart-3/10 flex items-center justify-center mt-0.5">
                  <BarChart2 className="w-4.5 h-4.5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Holdings table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={4}
      >
        <Card className="bg-card border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-base">Holdings</h2>
            <span className="text-xs text-muted-foreground">
              {holdings.length} positions
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table data-ocid="portfolio.holdings.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider pl-5">
                    Asset
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                    Qty
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                    Avg Cost
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                    Curr Price
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right">
                    Value
                  </TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider text-right pr-5">
                    P&amp;L
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? SKELETON_ROWS.map((rowKey) => (
                      <TableRow key={rowKey} className="border-border">
                        {SKELETON_COLS.map((colKey) => (
                          <TableCell key={colKey}>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : holdings.map((h) => (
                      <TableRow
                        key={h.assetId.toString()}
                        className="border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded bg-muted flex items-center justify-center">
                              <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                {h.symbol.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {h.symbol}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {h.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {h.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          $
                          {h.averageCost.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          $
                          {h.currentPrice.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium">
                          $
                          {h.value.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono text-sm font-semibold pr-5 ${h.pnl >= 0 ? "text-gain" : "text-loss"}`}
                        >
                          <div>
                            <span>
                              {h.pnl >= 0 ? "+" : ""}$
                              {Math.abs(h.pnl).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <span className="block text-[11px] opacity-80">
                              {h.pnlPct >= 0 ? "+" : ""}
                              {h.pnlPct.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
