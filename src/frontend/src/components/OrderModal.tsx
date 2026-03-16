import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { OrderSide, OrderType } from "../backend";
import type { Asset } from "../backend";
import { usePlaceOrder } from "../hooks/useQueries";

interface OrderModalProps {
  asset: Asset | null;
  defaultSide?: OrderSide;
  open: boolean;
  onClose: () => void;
}

export function OrderModal({
  asset,
  defaultSide = OrderSide.buy,
  open,
  onClose,
}: OrderModalProps) {
  const [side, setSide] = useState<OrderSide>(defaultSide);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.market);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const placeOrder = usePlaceOrder();

  const isBuy = side === OrderSide.buy;
  const isLimit = orderType === OrderType.limit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    const qty = Number.parseFloat(quantity);
    const prc = isLimit ? Number.parseFloat(price) : asset.currentPrice;
    if (Number.isNaN(qty) || qty <= 0) return;
    if (isLimit && (Number.isNaN(prc) || prc <= 0)) return;

    await placeOrder.mutateAsync({
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      side,
      orderType,
      quantity: qty,
      price: prc,
    });
    setQuantity("");
    setPrice("");
    onClose();
  };

  const estimatedValue =
    quantity && asset
      ? (
          Number.parseFloat(quantity) *
          (isLimit && price ? Number.parseFloat(price) : asset.currentPrice)
        ).toLocaleString("en-US", { style: "currency", currency: "USD" })
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="order.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {asset ? (
              <span className="flex items-center gap-3">
                <span className="font-mono text-lg text-muted-foreground">
                  {asset.symbol}
                </span>
                <span>{asset.name}</span>
              </span>
            ) : (
              "Place Order"
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Side toggle */}
          <div
            data-ocid="order.side.toggle"
            className="flex rounded-md overflow-hidden border border-border"
          >
            <button
              type="button"
              onClick={() => setSide(OrderSide.buy)}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                isBuy
                  ? "bg-gain-subtle text-gain border-r border-border"
                  : "bg-transparent text-muted-foreground border-r border-border hover:text-foreground"
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setSide(OrderSide.sell)}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                !isBuy
                  ? "bg-loss-subtle text-loss"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              SELL
            </button>
          </div>

          {/* Order type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-widest">
              Order Type
            </Label>
            <Select
              value={orderType}
              onValueChange={(v) => setOrderType(v as OrderType)}
            >
              <SelectTrigger
                data-ocid="order.type.select"
                className="bg-muted border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value={OrderType.market}>Market</SelectItem>
                <SelectItem value={OrderType.limit}>Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-widest">
              Quantity
            </Label>
            <Input
              data-ocid="order.quantity.input"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-muted border-border font-mono"
              required
            />
          </div>

          {/* Price (limit only) */}
          {isLimit && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest">
                Limit Price
              </Label>
              <Input
                data-ocid="order.price.input"
                type="number"
                step="any"
                min="0"
                placeholder={asset?.currentPrice.toFixed(2) ?? "0.00"}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-muted border-border font-mono"
                required
              />
            </div>
          )}

          {/* Market price display */}
          {!isLimit && asset && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Market Price</span>
              <span className="font-mono text-foreground">
                $
                {asset.currentPrice.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          {/* Estimated value */}
          {estimatedValue && (
            <div className="flex items-center justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">
                Estimated {isBuy ? "Cost" : "Proceeds"}
              </span>
              <span
                className={`font-mono font-semibold ${isBuy ? "text-gain" : "text-loss"}`}
              >
                {estimatedValue}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border"
              onClick={onClose}
              data-ocid="order.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={placeOrder.isPending}
              data-ocid="order.submit_button"
              className={`flex-1 font-semibold ${
                isBuy
                  ? "bg-gain text-primary-foreground hover:opacity-90"
                  : "bg-loss text-destructive-foreground hover:opacity-90"
              }`}
            >
              {placeOrder.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isBuy ? "Buy" : "Sell"} {asset?.symbol}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
