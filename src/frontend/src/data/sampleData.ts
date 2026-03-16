import { OrderSide, OrderStatus, OrderType } from "../backend";
import type { Asset, Order, Portfolio } from "../backend";

export const samplePortfolio: Portfolio = {
  totalValue: 142856.34,
  dailyPnL: 3241.18,
  dailyPnLPercent: 2.32,
  holdings: [
    {
      assetId: BigInt(1),
      symbol: "BTC",
      name: "Bitcoin",
      quantity: 1.42,
      averageCost: 41200.0,
      currentPrice: 43850.25,
    },
    {
      assetId: BigInt(2),
      symbol: "ETH",
      name: "Ethereum",
      quantity: 12.5,
      averageCost: 2180.0,
      currentPrice: 2340.8,
    },
    {
      assetId: BigInt(3),
      symbol: "SOL",
      name: "Solana",
      quantity: 85.0,
      averageCost: 95.4,
      currentPrice: 102.65,
    },
    {
      assetId: BigInt(4),
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 20.0,
      averageCost: 178.5,
      currentPrice: 183.4,
    },
    {
      assetId: BigInt(5),
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      quantity: 8.0,
      averageCost: 620.0,
      currentPrice: 598.3,
    },
  ],
};

export const sampleWatchlist: Asset[] = [
  {
    id: BigInt(1),
    symbol: "BTC",
    name: "Bitcoin",
    currentPrice: 43850.25,
    change24h: 1204.5,
    changePercent24h: 2.82,
  },
  {
    id: BigInt(2),
    symbol: "ETH",
    name: "Ethereum",
    currentPrice: 2340.8,
    change24h: 56.2,
    changePercent24h: 2.46,
  },
  {
    id: BigInt(3),
    symbol: "SOL",
    name: "Solana",
    currentPrice: 102.65,
    change24h: -3.15,
    changePercent24h: -2.98,
  },
  {
    id: BigInt(4),
    symbol: "AAPL",
    name: "Apple Inc.",
    currentPrice: 183.4,
    change24h: 2.1,
    changePercent24h: 1.16,
  },
  {
    id: BigInt(5),
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    currentPrice: 598.3,
    change24h: -14.2,
    changePercent24h: -2.32,
  },
  {
    id: BigInt(6),
    symbol: "TSLA",
    name: "Tesla Inc.",
    currentPrice: 248.9,
    change24h: 8.75,
    changePercent24h: 3.64,
  },
  {
    id: BigInt(7),
    symbol: "MSFT",
    name: "Microsoft Corp.",
    currentPrice: 412.55,
    change24h: 5.4,
    changePercent24h: 1.33,
  },
  {
    id: BigInt(8),
    symbol: "ICP",
    name: "Internet Computer",
    currentPrice: 12.48,
    change24h: -0.38,
    changePercent24h: -2.96,
  },
];

export const sampleOrders: Order[] = [
  {
    id: BigInt(1),
    assetId: BigInt(1),
    symbol: "BTC",
    side: OrderSide.buy,
    orderType: OrderType.market,
    quantity: 0.5,
    price: 43200.0,
    status: OrderStatus.filled,
    timestamp: BigInt(Date.now() - 1000 * 60 * 30) * BigInt(1000000),
  },
  {
    id: BigInt(2),
    assetId: BigInt(2),
    symbol: "ETH",
    side: OrderSide.buy,
    orderType: OrderType.limit,
    quantity: 5.0,
    price: 2300.0,
    status: OrderStatus.filled,
    timestamp: BigInt(Date.now() - 1000 * 60 * 90) * BigInt(1000000),
  },
  {
    id: BigInt(3),
    assetId: BigInt(3),
    symbol: "SOL",
    side: OrderSide.sell,
    orderType: OrderType.market,
    quantity: 20.0,
    price: 105.8,
    status: OrderStatus.filled,
    timestamp: BigInt(Date.now() - 1000 * 60 * 180) * BigInt(1000000),
  },
  {
    id: BigInt(4),
    assetId: BigInt(4),
    symbol: "AAPL",
    side: OrderSide.buy,
    orderType: OrderType.limit,
    quantity: 10.0,
    price: 180.0,
    status: OrderStatus.pending,
    timestamp: BigInt(Date.now() - 1000 * 60 * 240) * BigInt(1000000),
  },
  {
    id: BigInt(5),
    assetId: BigInt(5),
    symbol: "NVDA",
    side: OrderSide.sell,
    orderType: OrderType.limit,
    quantity: 2.0,
    price: 620.0,
    status: OrderStatus.cancelled,
    timestamp: BigInt(Date.now() - 1000 * 60 * 360) * BigInt(1000000),
  },
];

export function generateSparklineData(
  basePrice: number,
  points = 30,
): number[] {
  const data: number[] = [basePrice];
  for (let i = 1; i < points; i++) {
    const prev = data[i - 1];
    const change = prev * (Math.random() * 0.04 - 0.02);
    data.push(prev + change);
  }
  return data;
}
