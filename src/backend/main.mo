import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  // Types
  type Asset = {
    id : Nat;
    symbol : Text;
    name : Text;
    currentPrice : Float;
    change24h : Float;
    changePercent24h : Float;
  };

  type Holding = {
    assetId : Nat;
    symbol : Text;
    name : Text;
    quantity : Float;
    averageCost : Float;
    currentPrice : Float;
  };

  type OrderSide = {
    #buy;
    #sell;
  };

  type OrderType = {
    #market;
    #limit;
  };

  type OrderStatus = {
    #pending;
    #filled;
    #cancelled;
  };

  type Order = {
    id : Nat;
    assetId : Nat;
    symbol : Text;
    side : OrderSide;
    orderType : OrderType;
    quantity : Float;
    price : Float;
    status : OrderStatus;
    timestamp : Int;
  };

  type Portfolio = {
    totalValue : Float;
    dailyPnL : Float;
    dailyPnLPercent : Float;
    holdings : [Holding];
  };

  module Portfolio {
    public func compare(p1 : Portfolio, p2 : Portfolio) : Order.Order {
      Float.compare(p1.totalValue, p2.totalValue);
    };
  };

  // State
  var nextOrderId = 1;
  let assets = Map.empty<Nat, Asset>();
  let holdings = Map.empty<Nat, Holding>();
  let orders = Map.empty<Nat, Order>();

  // Sample data
  func initializeAssets() {
    assets.add(1, {
      id = 1;
      symbol = "BTC";
      name = "Bitcoin";
      currentPrice = 60000.0;
      change24h = 500.0;
      changePercent24h = 0.8;
    });
    assets.add(2, {
      id = 2;
      symbol = "ETH";
      name = "Ethereum";
      currentPrice = 3500.0;
      change24h = 50.0;
      changePercent24h = 1.4;
    });
    assets.add(3, {
      id = 3;
      symbol = "SOL";
      name = "Solana";
      currentPrice = 150.0;
      change24h = -2.0;
      changePercent24h = -1.3;
    });
    assets.add(4, {
      id = 4;
      symbol = "AAPL";
      name = "Apple Inc.";
      currentPrice = 170.0;
      change24h = 2.0;
      changePercent24h = 1.2;
    });
    assets.add(5, {
      id = 5;
      symbol = "TSLA";
      name = "Tesla Inc.";
      currentPrice = 800.0;
      change24h = -10.0;
      changePercent24h = -1.2;
    });
  };

  func initializeHoldings() {
    holdings.add(1, {
      assetId = 1;
      symbol = "BTC";
      name = "Bitcoin";
      quantity = 0.5;
      averageCost = 30000.0;
      currentPrice = 60000.0;
    });
    holdings.add(2, {
      assetId = 2;
      symbol = "ETH";
      name = "Ethereum";
      quantity = 10.0;
      averageCost = 2500.0;
      currentPrice = 3500.0;
    });
  };

  // Initialize sample data on first run
  initializeAssets();
  initializeHoldings();

  // Queries
  public query ({ caller }) func getPortfolio() : async Portfolio {
    let holdingsArray = holdings.values().toArray();
    var totalValue : Float = 0;
    var dailyPnL : Float = 0;
    for (holding in holdingsArray.values()) {
      totalValue += holding.quantity * holding.currentPrice;
      dailyPnL += holding.quantity * holding.currentPrice * 0.05;
    };
    {
      totalValue;
      dailyPnL;
      dailyPnLPercent = if (totalValue > 0) {
        dailyPnL / totalValue * 100.0;
      } else { 0.0 };
      holdings = holdingsArray;
    };
  };

  public query ({ caller }) func getWatchlist() : async [Asset] {
    assets.values().toArray();
  };

  public query ({ caller }) func getOrders() : async [Order] {
    let ordersArray = orders.values().toArray();
    ordersArray.sort(
      func(a, b) {
        Int.compare(b.timestamp, a.timestamp);
      }
    );
  };

  // Updates
  public shared ({ caller }) func placeOrder(assetId : Nat, symbol : Text, name : Text, side : OrderSide, orderType : OrderType, quantity : Float, price : Float) : async Nat {
    let asset = switch (assets.get(assetId)) {
      case (?a) { a };
      case (null) { Runtime.trap("Invalid assetId") };
    };

    let order : Order = {
      id = nextOrderId;
      assetId;
      symbol;
      side;
      orderType;
      quantity;
      price;
      status = #filled;
      timestamp = Time.now();
    };

    orders.add(nextOrderId, order);
    updateHoldings(asset, quantity, side, price);
    nextOrderId += 1;
    order.id;
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async Bool {
    let order = switch (orders.get(orderId)) {
      case (?o) { o };
      case (null) { return false };
    };

    if (order.status != #pending) { return false };
    let updatedOrder = { order with status = #cancelled };
    orders.add(orderId, updatedOrder);
    true;
  };

  func updateHoldings(asset : Asset, quantity : Float, side : OrderSide, price : Float) {
    let currentHolding = holdings.get(asset.id);
    switch (side) {
      case (#buy) {
        switch (currentHolding) {
          case (?h) {
            let totalCost = h.averageCost * h.quantity + price * quantity;
            let newQuantity = h.quantity + quantity;
            holdings.add(
              asset.id,
              {
                h with
                quantity = newQuantity;
                averageCost = totalCost / newQuantity;
              },
            );
          };
          case (null) {
            holdings.add(
              asset.id,
              {
                assetId = asset.id;
                symbol = asset.symbol;
                name = asset.name;
                quantity;
                averageCost = price;
                currentPrice = asset.currentPrice;
              },
            );
          };
        };
      };
      case (#sell) {
        switch (currentHolding) {
          case (?h) {
            let newQuantity = h.quantity - quantity;
            if (newQuantity > 0) {
              holdings.add(
                asset.id,
                { h with quantity = newQuantity },
              );
            } else {
              holdings.remove(asset.id);
            };
          };
          case (null) { () };
        };
      };
    };
  };

  // Search and Price History
  public query ({ caller }) func searchAssets(filterText : Text) : async [Asset] {
    let lowerFilterText = filterText.toLower();
    assets.values().toArray().filter(
      func(asset) {
        asset.symbol.toLower().contains(#text lowerFilterText) or asset.name.toLower().contains(#text lowerFilterText);
      }
    );
  };

  public query ({ caller }) func getSamplePriceHistory(assetId : Nat) : async [Float] {
    let basePrice = switch (assets.get(assetId)) {
      case (?a) { a.currentPrice };
      case (null) { Runtime.trap("Invalid assetId") };
    };

    Array.tabulate<Float>(
      30,
      func(i) {
        basePrice + 10.0 * Float.sin(i.toFloat() + assetId.toFloat());
      },
    );
  };
};
