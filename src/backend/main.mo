import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  module Coin {
    public func compare(a : Coin, b : Coin) : Order.Order {
      Text.compare(a.symbol, b.symbol);
    };
  };

  type Coin = {
    symbol : Text;
    name : Text;
    currentPrice : Float;
  };

  type Portfolios = Map.Map<Text, Float>;

  type Trade = {
    timestamp : Time.Time;
    coin : Text;
    side : TradeSide;
    quantity : Float;
    price : Float;
    totalValue : Float;
  };

  type TradeHistory = List.List<Trade>;

  type PriceAlert = {
    user : Principal;
    coin : Text;
    targetPrice : Float;
    direction : PriceDirection;
    isTriggered : Bool;
  };

  type Alerts = List.List<PriceAlert>;

  type Badge = {
    name : Text;
    description : Text;
  };

  type Badges = List.List<Badge>;

  type UserData = {
    portfolio : Portfolios;
    balance : Float;
    tradeHistory : TradeHistory;
    xp : Nat;
    badges : Badges;
  };

  type UserDataView = {
    portfolio : { coin : Text; quantity : Float };
    balance : Float;
    tradeHistory : [Trade];
    xp : Nat;
    badges : [Badge];
  };

  type EducationArticle = {
    title : Text;
    summary : Text;
    content : Text;
  };

  type MarketMode = {
    #bull;
    #bear;
    #normal;
  };

  type TradeSide = {
    #buy;
    #sell;
  };

  type PriceDirection = {
    #above;
    #below;
  };

  module Badge {
    public func compare(badge1 : Badge, badge2 : Badge) : Order.Order {
      Text.compare(badge1.name, badge2.name);
    };
  };

  let users = Map.empty<Principal, UserData>();
  var marketMode : MarketMode = #normal;

  let coins : [Coin] = [
    { symbol = "BTC"; name = "Bitcoin"; currentPrice = 50000.0 },
    { symbol = "ETH"; name = "Ethereum"; currentPrice = 4000.0 },
    { symbol = "SOL"; name = "Solana"; currentPrice = 150.0 },
    { symbol = "BNB"; name = "Binance Coin"; currentPrice = 600.0 },
    { symbol = "ADA"; name = "Cardano"; currentPrice = 2.5 },
    { symbol = "DOGE"; name = "Dogecoin"; currentPrice = 0.25 },
    { symbol = "XRP"; name = "Ripple"; currentPrice = 1.0 },
    { symbol = "MATIC"; name = "Polygon"; currentPrice = 2.0 },
  ];

  let academyContent : [EducationArticle] = [
    {
      title = "Crypto 101";
      summary = "Introduction to cryptocurrencies";
      content = "Full article content here...";
    },
    {
      title = "What is Blockchain?";
      summary = "Overview of the technology behind crypto";
      content = "Full article content here...";
    },
    {
      title = "How to Store Crypto Safely";
      summary = "Guide to wallets and security";
      content = "Full article content here...";
    },
    {
      title = "Understanding Bitcoin";
      summary = "Deep dive into BTC";
      content = "Full article content here...";
    },
    {
      title = "Ethereum and Smart Contracts";
      summary = "Explaining ETH and its use cases";
      content = "Full article content here...";
    },
    {
      title = "Crypto Trading Strategies";
      summary = "Tips for successful virtual trading";
      content = "Full article content here...";
    },
    {
      title = "Avoiding Scams and Fraud";
      summary = "How to protect yourself in crypto";
      content = "Full article content here...";
    },
    {
      title = "The Future of Crypto";
      summary = "Predictions and trends to watch";
      content = "Full article content here...";
    },
  ];

  func toUserDataView(userData : UserData) : UserDataView {
    let portfolioArray = userData.portfolio.toArray();
    let tradeHistoryArray = userData.tradeHistory.toArray();
    let badgesArray = userData.badges.toArray();
    {
      portfolio = if (portfolioArray.size() > 0) {
        let firstEntry = portfolioArray[0];
        { coin = firstEntry.0; quantity = firstEntry.1 };
      } else {
        { coin = ""; quantity = 0.0 };
      };
      balance = userData.balance;
      tradeHistory = tradeHistoryArray;
      xp = userData.xp;
      badges = badgesArray;
    };
  };

  public shared ({ caller }) func getOrCreateUserData() : async UserDataView {
    switch (users.get(caller)) {
      case (?userData) { toUserDataView(userData) };
      case (null) {
        let newUser : UserData = {
          portfolio = Map.empty<Text, Float>();
          balance = 10000.0;
          tradeHistory = List.empty<Trade>();
          xp = 0;
          badges = List.empty<Badge>();
        };
        users.add(caller, newUser);
        toUserDataView(newUser);
      };
    };
  };

  public shared ({ caller }) func buy(coin : Text, usdAmount : Float) : async () {
    if (usdAmount <= 0.0) { Runtime.trap("Amount must be greater than 0") };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?userData) {
        if (usdAmount > userData.balance) {
          Runtime.trap("Insufficient balance. Current balance: " # userData.balance.toText());
        };

        let coinData = coins.find(func(c) { c.symbol == coin });
        switch (coinData) {
          case (null) { Runtime.trap("Coin not supported") };
          case (?c) {
            let quantity = usdAmount / c.currentPrice;
            if (quantity <= 0.0) { Runtime.trap("Invalid quantity") };

            let currentHoldings = switch (userData.portfolio.get(coin)) {
              case (null) { 0.0 };
              case (?holdings) { holdings };
            };
            let newQuantity = currentHoldings + quantity;
            userData.portfolio.add(coin, newQuantity);
            let updatedTradeHistory = userData.tradeHistory.clone();

            let trade = {
              timestamp = Time.now();
              coin;
              side = #buy;
              quantity;
              price = c.currentPrice;
              totalValue = usdAmount;
            };
            updatedTradeHistory.add(trade);

            let updatedBadges = updateBadges(userData, true);

            let updatedUserData : UserData = {
              portfolio = userData.portfolio;
              balance = userData.balance - usdAmount;
              tradeHistory = updatedTradeHistory;
              xp = userData.xp + 10;
              badges = updatedBadges;
            };
            users.add(caller, updatedUserData);
          };
        };
      };
    };
  };

  public shared ({ caller }) func sell(coin : Text, quantity : Float) : async () {
    if (quantity <= 0.0) { Runtime.trap("Quantity must be greater than 0") };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?userData) {
        let currentHoldings = switch (userData.portfolio.get(coin)) {
          case (null) { 0.0 };
          case (?holdings) { holdings };
        };
        if (quantity > currentHoldings) {
          Runtime.trap("Not enough holdings to sell. Current: " # currentHoldings.toText());
        };

        let coinData = coins.find(func(c) { c.symbol == coin });
        switch (coinData) {
          case (null) { Runtime.trap("Coin not supported") };
          case (?c) {
            let usdAmount = quantity * c.currentPrice;

            let newQty = currentHoldings - quantity;
            if (newQty == 0.0) {
              userData.portfolio.remove(coin);
            } else {
              userData.portfolio.add(coin, newQty);
            };

            let updatedTradeHistory = userData.tradeHistory.clone();
            let trade = {
              timestamp = Time.now();
              coin;
              side = #sell;
              quantity;
              price = c.currentPrice;
              totalValue = usdAmount;
            };
            updatedTradeHistory.add(trade);

            let updatedBadges = updateBadges(userData, false);

            let updatedUserData : UserData = {
              portfolio = userData.portfolio;
              balance = userData.balance + usdAmount;
              tradeHistory = updatedTradeHistory;
              xp = userData.xp + 10;
              badges = updatedBadges;
            };
            users.add(caller, updatedUserData);
          };
        };
      };
    };
  };

  func updateBadges(userData : UserData, isBuy : Bool) : Badges {
    let firstTradeBadge : Badge = {
      name = "First Trade";
      description = "Completed your first trade";
    };
    let hasFirstTrade = userData.badges.any(func(b) { b.name == firstTradeBadge.name });
    if (not hasFirstTrade) {
      let updatedBadges = userData.badges.clone();
      updatedBadges.add(firstTradeBadge);
      return updatedBadges;
    };
    userData.badges.clone();
  };

  public query ({ caller }) func getLeaderboard() : async [(Principal, UserDataView)] {
    users.entries().toArray().map(func((principal, userData)) { (principal, toUserDataView(userData)) });
  };

  public query ({ caller }) func getAcademyContent() : async [EducationArticle] {
    academyContent;
  };

  public shared ({ caller }) func setMarketMode(mode : MarketMode) : async () {
    marketMode := mode;
  };

  public query ({ caller }) func getMarketMode() : async MarketMode {
    marketMode;
  };
};
