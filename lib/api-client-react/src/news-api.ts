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

export interface NewsResponse {
  news: NewsItem[];
  lastFetchedAt: string | null;
  total: number;
}

export interface SyncStatusResponse {
  message: string;
  updated: number;
  toLive: number;
  toCompleted: number;
}

export const getElectionNewsUrl = () => `/api/news`;

export const getElectionNews = async (): Promise<NewsResponse> =>
  customFetch<NewsResponse>(getElectionNewsUrl(), { method: "GET" });

export const getElectionNewsQueryKey = () => [`/api/news`] as const;

export const useGetElectionNews = <TData = NewsResponse, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<NewsResponse, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  return useQuery<NewsResponse, TError, TData>({
    queryKey: getElectionNewsQueryKey(),
    queryFn: getElectionNews,
    staleTime: 1000 * 60 * 15,
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
