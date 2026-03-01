import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MarketMode } from "../backend.d";
import type { EducationArticle, TutorLesson, UserDataView } from "../backend.d";
import { useActor } from "./useActor";
import { useOfflineCache } from "./useOfflineCache";

export function useUserData() {
  const { actor, isFetching } = useActor();
  const { cachedData, saveToCache } = useOfflineCache();

  return useQuery<UserDataView>({
    queryKey: ["userData"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      const data = await actor.getOrCreateUserData();
      saveToCache(data);
      return data;
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
    initialData: cachedData(),
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

export function useTutorLessons() {
  const { actor, isFetching } = useActor();
  return useQuery<TutorLesson[]>({
    queryKey: ["tutorLessons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTutorLessons();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
  });
}

export function useBuy() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { saveToCache } = useOfflineCache();
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
      // Save updated data to cache after invalidation settles
      setTimeout(() => {
        const data = queryClient.getQueryData<UserDataView>(["userData"]);
        if (data) saveToCache(data);
      }, 500);
    },
  });
}

export function useSell() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { saveToCache } = useOfflineCache();
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
      setTimeout(() => {
        const data = queryClient.getQueryData<UserDataView>(["userData"]);
        if (data) saveToCache(data);
      }, 500);
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

export function useResetAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { saveToCache } = useOfflineCache();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.resetAccount();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userData"], data);
      saveToCache(data);
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
  });
}
