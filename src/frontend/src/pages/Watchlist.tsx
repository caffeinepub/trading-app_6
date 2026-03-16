import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { OrderSide } from "../backend";
import type { Asset } from "../backend";
import { OrderModal } from "../components/OrderModal";
import { Sparkline } from "../components/Sparkline";
import { generateSparklineData, sampleWatchlist } from "../data/sampleData";
import { useWatchlist } from "../hooks/useQueries";

interface TickerAsset extends Asset {
  sparkData: number[];
}

interface WatchlistProps {
  searchQuery?: string;
}

const SKELETON_ROWS = ["s1", "s2", "s3", "s4", "s5", "s6"];

export function Watchlist({ searchQuery = "" }: WatchlistProps) {
  const { data: watchlistData, isLoading } = useWatchlist();
  const baseAssets = watchlistData ?? sampleWatchlist;

  const [assets, setAssets] = useState<TickerAsset[]>([]);
  const [flashMap, setFlashMap] = useState<
    Record<string, "gain" | "loss" | null>
  >({});
  const [orderModal, setOrderModal] = useState<{
    asset: Asset;
    side: OrderSide;
  } | null>(null);
  const prevPricesRef = useRef<Record<string, number>>({});

  // Initialize ticker data
  useEffect(() => {
    const initialized = baseAssets.map((a) => ({
      ...a,
      sparkData: generateSparklineData(a.currentPrice),
    }));
    setAssets(initialized);
    const priceMap: Record<string, number> = {};
    for (const a of baseAssets) {
      priceMap[a.id.toString()] = a.currentPrice;
    }
    prevPricesRef.current = priceMap;
  }, [baseAssets]);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newFlash: Record<string, "gain" | "loss"> = {};

      setAssets((prev) => {
        const updated = prev.map((asset) => {
          const change = asset.currentPrice * (Math.random() * 0.01 - 0.005);
          const newPrice = Math.max(0.01, asset.currentPrice + change);
          const id = asset.id.toString();
          const prevPrice = prevPricesRef.current[id];
          if (prevPrice !== undefined) {
            newFlash[id] = newPrice >= prevPrice ? "gain" : "loss";
          }
          prevPricesRef.current[id] = newPrice;
          return {
            ...asset,
            currentPrice: newPrice,
            sparkData: [...asset.sparkData.slice(1), newPrice],
          };
        });
        return updated;
      });

      setFlashMap(newFlash);
      setTimeout(() => setFlashMap({}), 900);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filtered = assets.filter(
    (a) =>
      !searchQuery ||
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayItems = filtered.slice(0, 8);

  return (
    <div className="p-5 lg:p-7 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-2xl font-bold">Market Watchlist</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live-simulated prices · Updates every 2s
        </p>
      </motion.div>

      <Card className="bg-card border-border" data-ocid="watchlist.table">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-border">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Asset
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider text-right w-24">
            Price
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider text-right w-20">
            24h %
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider text-right w-20 hidden md:block">
            Chart
          </span>
          <span className="w-16" />
          <span className="w-16" />
        </div>

        {/* Rows */}
        {isLoading
          ? SKELETON_ROWS.map((key) => (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-border last:border-0"
              >
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-20 hidden md:block" />
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-8 w-14" />
              </div>
            ))
          : displayItems.map((asset, i) => {
              const idx = i + 1;
              const isPos = asset.changePercent24h >= 0;
              const flash = flashMap[asset.id.toString()];

              return (
                <div
                  key={asset.id.toString()}
                  data-ocid={`watchlist.item.${idx}`}
                  className={`
                  grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-4
                  border-b border-border last:border-0 transition-colors
                  ${flash === "gain" ? "flash-gain" : flash === "loss" ? "flash-loss" : ""}
                  hover:bg-muted/20
                `}
                >
                  {/* Asset info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-muted/80 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        {asset.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {asset.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {asset.name}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="w-24 text-right">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      $
                      {asset.currentPrice < 100
                        ? asset.currentPrice.toFixed(4)
                        : asset.currentPrice.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </span>
                  </div>

                  {/* 24h change */}
                  <div className="w-20 text-right">
                    <span
                      className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded ${
                        isPos
                          ? "text-gain bg-gain-subtle"
                          : "text-loss bg-loss-subtle"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {asset.changePercent24h.toFixed(2)}%
                    </span>
                  </div>

                  {/* Sparkline */}
                  <div className="w-20 hidden md:flex justify-end">
                    <Sparkline
                      data={asset.sparkData}
                      width={72}
                      height={28}
                      positive={isPos}
                    />
                  </div>

                  {/* Buy button */}
                  <div className="w-16">
                    <Button
                      size="sm"
                      data-ocid={`watchlist.buy.button.${idx}`}
                      onClick={() =>
                        setOrderModal({ asset, side: OrderSide.buy })
                      }
                      className="w-full h-7 text-xs font-semibold bg-gain/10 text-gain hover:bg-gain/20 border border-gain/20"
                      variant="outline"
                    >
                      BUY
                    </Button>
                  </div>

                  {/* Sell button */}
                  <div className="w-16">
                    <Button
                      size="sm"
                      data-ocid={`watchlist.sell.button.${idx}`}
                      onClick={() =>
                        setOrderModal({ asset, side: OrderSide.sell })
                      }
                      className="w-full h-7 text-xs font-semibold bg-loss/10 text-loss hover:bg-loss/20 border border-loss/20"
                      variant="outline"
                    >
                      SELL
                    </Button>
                  </div>
                </div>
              );
            })}

        {!isLoading && displayItems.length === 0 && (
          <div data-ocid="watchlist.empty_state" className="py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No assets match your search
            </p>
          </div>
        )}
      </Card>

      <OrderModal
        asset={orderModal?.asset ?? null}
        defaultSide={orderModal?.side}
        open={!!orderModal}
        onClose={() => setOrderModal(null)}
      />
    </div>
  );
}
