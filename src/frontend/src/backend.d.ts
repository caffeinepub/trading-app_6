import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Holding {
    currentPrice: number;
    assetId: bigint;
    name: string;
    averageCost: number;
    quantity: number;
    symbol: string;
}
export interface Asset {
    id: bigint;
    currentPrice: number;
    change24h: number;
    name: string;
    changePercent24h: number;
    symbol: string;
}
export interface Portfolio {
    dailyPnLPercent: number;
    totalValue: number;
    holdings: Array<Holding>;
    dailyPnL: number;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    assetId: bigint;
    side: OrderSide;
    orderType: OrderType;
    timestamp: bigint;
    quantity: number;
    price: number;
    symbol: string;
}
export enum OrderSide {
    buy = "buy",
    sell = "sell"
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    filled = "filled"
}
export enum OrderType {
    limit = "limit",
    market = "market"
}
export interface backendInterface {
    cancelOrder(orderId: bigint): Promise<boolean>;
    getOrders(): Promise<Array<Order>>;
    getPortfolio(): Promise<Portfolio>;
    getSamplePriceHistory(assetId: bigint): Promise<Array<number>>;
    getWatchlist(): Promise<Array<Asset>>;
    placeOrder(assetId: bigint, symbol: string, name: string, side: OrderSide, orderType: OrderType, quantity: number, price: number): Promise<bigint>;
    searchAssets(filterText: string): Promise<Array<Asset>>;
}
