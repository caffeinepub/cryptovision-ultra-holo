import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Float "mo:core/Float";
import Migration "migration";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

(with migration = Migration.run)
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
    portfolio : [{ coin : Text; quantity : Float }];
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

  type TutorLesson = {
    id : Text;
    category : Text;
    question : Text;
    answer : Text;
    tips : [Text];
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

  let tutorLessons : [TutorLesson] = [
    {
      id = "lesson1";
      category = "Crypto Basics";
      question = "What is a cryptocurrency?";
      answer = "A cryptocurrency is a digital or virtual currency that uses cryptography for security.";
      tips = [
        "Bitcoin was the first cryptocurrency",
        "Crypto is decentralized and not controlled by any government",
      ];
    },
    {
      id = "lesson2";
      category = "Trading";
      question = "How does trading work in this simulator?";
      answer = "You buy and sell virtual coins using simulated USD balance based on real-world prices.";
      tips = [
        "Prices are updated daily",
        "You start with $10,000 virtual balance",
      ];
    },
    {
      id = "lesson3";
      category = "P&L";
      question = "What does P&L mean?";
      answer = "P&L stands for Profit and Loss. It reflects your trading performance over time.";
      tips = [
        "Positive P&L means you made a profit",
        "Negative P&L means you lost money",
      ];
    },
    {
      id = "lesson4";
      category = "Risk Management";
      question = "Why is risk management important?";
      answer = "Risk management helps protect your portfolio from big losses due to market volatility.";
      tips = [
        "Never invest more than you can afford to lose",
        "Diversify your holdings across multiple coins",
      ];
    },
    {
      id = "lesson5";
      category = "Charts";
      question = "How do I read candlestick charts and RSI?";
      answer = "Candlesticks show price movement. RSI helps identify overbought or oversold conditions.";
      tips = [
        "Long candles mean bigger price swings",
        "RSI above 70 = overbought, below 30 = oversold",
      ];
    },
    {
      id = "lesson6";
      category = "Market Trends";
      question = "What are bull and bear markets?";
      answer = "Bull market = rising prices. Bear market = falling prices.";
      tips = [
        "Bull markets offer more trading opportunities",
        "Bear markets require careful risk management",
      ];
    },
    {
      id = "lesson7";
      category = "Diversification";
      question = "Why should I diversify my portfolio?";
      answer = "Diversification reduces risk by spreading your investments across multiple assets.";
      tips = [
        "Avoid putting all your funds into one coin",
        "Stablecoins can provide stability",
      ];
    },
    {
      id = "lesson8";
      category = "Market Cap";
      question = "What is market capitalization?";
      answer = "Market cap is the total value of all coins in circulation for a given cryptocurrency.";
      tips = [
        "Large-cap coins are generally more stable",
        "Small-cap coins are riskier but can offer higher returns",
      ];
    },
    {
      id = "lesson9";
      category = "Blockchain";
      question = "How does blockchain technology work?";
      answer = "Blockchain is a decentralized, distributed ledger that records transactions securely.";
      tips = [
        "Bitcoin uses blockchain for transaction history",
        "Ethereum uses blockchain for smart contracts",
      ];
    },
    {
      id = "lesson10";
      category = "DeFi";
      question = "What is Decentralized Finance (DeFi)?";
      answer = "DeFi apps provide financial services using blockchain technology without intermediaries.";
      tips = [
        "Decentralized exchanges allow peer-to-peer trading",
        "Defi aims to make finance accessible to everyone",
      ];
    },
    {
      id = "lesson11";
      category = "Scams";
      question = "How can I avoid crypto scams?";
      answer = "Be wary of promises of guaranteed returns and never share your wallet files or keys.";
      tips = [
        "Avoid suspicious links and phishing attempts",
        "Use reputable exchanges and wallets",
      ];
    },
    {
      id = "lesson12";
      category = "Long vs Short Term";
      question = "Should I focus on long-term or short-term strategies?";
      answer = "Long-term strategies are more stable, while short-term trading can be riskier but potentially more profitable.";
      tips = [
        "Consider your risk tolerance and goals",
        "Diversify between long- and short-term positions",
      ];
    },
    {
      id = "lesson13";
      category = "XP and Badges";
      question = "How do XP and badges work in this app?";
      answer = "XP reflects your activity and achievements. Badges reward you for completing milestones.";
      tips = [
        "Complete tutorials to earn XP and badges",
        "XP helps track your progress over time",
      ];
    },
    {
      id = "lesson14";
      category = "Price Alerts";
      question = "How do price alerts work?";
      answer = "Price alerts notify you when a coin reaches your target price.";
      tips = [
        "Set alerts for both buy and sell opportunities",
        "Use alerts to stay informed about market movements",
      ];
    },
    {
      id = "lesson15";
      category = "Trading Psychology";
      question = "Why is trading psychology important?";
      answer = "Trading discipline and emotional control are key to long-term success.";
      tips = [
        "Avoid making impulsive trades",
        "Maintain a long-term perspective",
      ];
    },
  ];

  func toUserDataView(userData : UserData) : UserDataView {
    let portfolioEntries = userData.portfolio.toArray();
    let portfolioArray = portfolioEntries.map(
      func((coin, quantity)) {
        { coin; quantity };
      }
    );

    let tradeHistoryArray = userData.tradeHistory.toArray();
    let badgesArray = userData.badges.toArray();

    {
      portfolio = portfolioArray;
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

  public query ({ caller }) func getTutorLessons() : async [TutorLesson] {
    tutorLessons;
  };
};
