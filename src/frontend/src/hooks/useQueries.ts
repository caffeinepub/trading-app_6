import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderSide, OrderType } from "../backend";
import type { Asset, Order, Portfolio } from "../backend";
import { useActor } from "./useActor";

export function usePortfolio() {
  const { actor, isFetching } = useActor();
  return useQuery<Portfolio>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getPortfolio();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useWatchlist() {
  const { actor, isFetching } = useActor();
  return useQuery<Asset[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatchlist();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePriceHistory(assetId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<number[]>({
    queryKey: ["priceHistory", assetId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSamplePriceHistory(assetId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
  });
}

export function useSearchAssets(query: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Asset[]>({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchAssets(query);
    },
    enabled: !!actor && !isFetching && query.length > 0,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      assetId: bigint;
      symbol: string;
      name: string;
      side: OrderSide;
      orderType: OrderType;
      quantity: number;
      price: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.placeOrder(
        params.assetId,
        params.symbol,
        params.name,
        params.side,
        params.orderType,
        params.quantity,
        params.price,
      );
    },
    onSuccess: () => {
      toast.success("Order placed successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to place order");
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to cancel order");
    },
  });
}

export { OrderSide, OrderType };
