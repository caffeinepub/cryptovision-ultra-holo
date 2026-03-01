import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TutorLesson {
    id: string;
    question: string;
    tips: Array<string>;
    answer: string;
    category: string;
}
export interface EducationArticle {
    title: string;
    content: string;
    summary: string;
}
export type Time = bigint;
export interface Trade {
    totalValue: number;
    coin: string;
    side: TradeSide;
    timestamp: Time;
    quantity: number;
    price: number;
}
export interface UserDataView {
    xp: bigint;
    portfolio: Array<{
        coin: string;
        quantity: number;
    }>;
    balance: number;
    tradeHistory: Array<Trade>;
    badges: Array<Badge>;
}
export interface Badge {
    name: string;
    description: string;
}
export enum MarketMode {
    normal = "normal",
    bear = "bear",
    bull = "bull"
}
export enum TradeSide {
    buy = "buy",
    sell = "sell"
}
export interface backendInterface {
    buy(coin: string, usdAmount: number): Promise<void>;
    getAcademyContent(): Promise<Array<EducationArticle>>;
    getLeaderboard(): Promise<Array<[Principal, UserDataView]>>;
    getMarketMode(): Promise<MarketMode>;
    getOrCreateUserData(): Promise<UserDataView>;
    getTutorLessons(): Promise<Array<TutorLesson>>;
    resetAccount(): Promise<UserDataView>;
    sell(coin: string, quantity: number): Promise<void>;
    setMarketMode(mode: MarketMode): Promise<void>;
}
