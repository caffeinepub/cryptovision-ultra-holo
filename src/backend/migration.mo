import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Time "mo:core/Time";

module {
  type UserData = {
    portfolio : Map.Map<Text, Float>;
    balance : Float;
    tradeHistory : List.List<Trade>;
    xp : Nat;
    badges : List.List<Badge>;
  };

  type Trade = {
    timestamp : Time.Time;
    coin : Text;
    side : TradeSide;
    quantity : Float;
    price : Float;
    totalValue : Float;
  };

  type Badge = {
    name : Text;
    description : Text;
  };

  type TradeSide = {
    #buy;
    #sell;
  };

  type MarketMode = {
    #bull;
    #bear;
    #normal;
  };

  type Coin = {
    symbol : Text;
    name : Text;
    currentPrice : Float;
  };

  type EducationArticle = {
    title : Text;
    summary : Text;
    content : Text;
  };

  type TutorLesson = {
    id : Text;
    category : Text;
    question : Text;
    answer : Text;
    tips : [Text];
  };

  type OldActor = {
    users : Map.Map<Principal, UserData>;
    marketMode : MarketMode;
    coins : [Coin];
    academyContent : [EducationArticle];
  };

  type NewActor = {
    users : Map.Map<Principal, UserData>;
    marketMode : MarketMode;
    coins : [Coin];
    academyContent : [EducationArticle];
    tutorLessons : [TutorLesson];
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      tutorLessons = []
    };
  };
};
