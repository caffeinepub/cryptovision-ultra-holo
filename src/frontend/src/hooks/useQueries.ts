import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MarketMode } from "../backend.d";
import type { EducationArticle, UserDataView } from "../backend.d";
import { useActor } from "./useActor";

export function useUserData() {
  const { actor, isFetching } = useActor();
  return useQuery<UserDataView>({
    queryKey: ["userData"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getOrCreateUserData();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useAcademyContent() {
  const { actor, isFetching } = useActor();
  return useQuery<EducationArticle[]>({
    queryKey: ["academyContent"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAcademyContent();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, UserDataView]>>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useMarketMode() {
  const { actor, isFetching } = useActor();
  return useQuery<MarketMode>({
    queryKey: ["marketMode"],
    queryFn: async () => {
      if (!actor) return MarketMode.normal;
      return actor.getMarketMode();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useBuy() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      coin,
      usdAmount,
    }: { coin: string; usdAmount: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.buy(coin, usdAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
  });
}

export function useSell() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      coin,
      quantity,
    }: { coin: string; quantity: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.sell(coin, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
  });
}

export function useSetMarketMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mode: MarketMode) => {
      if (!actor) throw new Error("No actor");
      return actor.setMarketMode(mode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketMode"] });
    },
  });
}
