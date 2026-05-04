import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType } from "./custom-fetch";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
  category: string;
}

export interface CandidateUpdate {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
  updateType: "joins" | "leaves" | "expelled" | "general";
  party?: string;
}

export interface NewsResponse {
  news: NewsItem[];
  lastFetchedAt: string | null;
  total: number;
}

export interface CandidateUpdatesResponse {
  updates: CandidateUpdate[];
  lastFetchedAt: string | null;
  total: number;
}

export interface SyncStatusResponse {
  message: string;
  updated: number;
  toLive: number;
  toCompleted: number;
}

export const getElectionNews = async (): Promise<NewsResponse> =>
  customFetch<NewsResponse>(`/api/news`, { method: "GET" });

export const getElectionNewsQueryKey = () => [`/api/news`] as const;

export const useGetElectionNews = <TData = NewsResponse, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<NewsResponse, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  return useQuery<NewsResponse, TError, TData>({
    queryKey: getElectionNewsQueryKey(),
    queryFn: getElectionNews,
    refetchInterval: 2 * 60 * 1000, // auto-refresh every 2 minutes
    staleTime: 60 * 1000,
    ...queryOptions,
  });
};

export const getCandidateUpdates = async (): Promise<CandidateUpdatesResponse> =>
  customFetch<CandidateUpdatesResponse>(`/api/news/candidate-updates`, { method: "GET" });

export const getCandidateUpdatesQueryKey = () => [`/api/news/candidate-updates`] as const;

export const useGetCandidateUpdates = <TData = CandidateUpdatesResponse, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<CandidateUpdatesResponse, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  return useQuery<CandidateUpdatesResponse, TError, TData>({
    queryKey: getCandidateUpdatesQueryKey(),
    queryFn: getCandidateUpdates,
    refetchInterval: 2 * 60 * 1000,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
};

export const refreshNews = async (): Promise<{ message: string; total: number; lastFetchedAt: string }> =>
  customFetch(`/api/news/refresh`, { method: "POST" });

export const useRefreshNews = (options?: { mutation?: UseMutationOptions<any, ErrorType<unknown>, void> }) => {
  return useMutation({ mutationFn: refreshNews, ...options?.mutation });
};

export const syncElectionStatuses = async (): Promise<SyncStatusResponse> =>
  customFetch<SyncStatusResponse>(`/api/sync-statuses`, { method: "POST" });

export const useSyncElectionStatuses = (options?: { mutation?: UseMutationOptions<SyncStatusResponse, ErrorType<unknown>, void> }) => {
  return useMutation({ mutationFn: syncElectionStatuses, ...options?.mutation });
};
