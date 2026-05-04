import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType } from "./custom-fetch";

export interface PartyResult {
  party: string;
  shortName: string;
  alliance: "NDA" | "INDIA" | "OTHER";
  seats: number;
  color: string;
}

export interface AllianceSummary {
  name: string;
  seats: number;
  color: string;
  description: string;
}

export interface ECIResultsResponse {
  electionTitle: string;
  results: PartyResult[];
  allianceSummary: AllianceSummary[] | null;
  totalSeats: number;
  majorityMark: number;
  type: "general" | "state";
}

export const getECIResultsQueryKey = (id: number) => [`/api/elections/${id}/eci-results`] as const;

export const useGetECIResults = <TData = ECIResultsResponse, TError = ErrorType<unknown>>(
  id: number,
  options?: { query?: UseQueryOptions<ECIResultsResponse, TError, TData> }
) => {
  return useQuery<ECIResultsResponse, TError, TData>({
    queryKey: getECIResultsQueryKey(id),
    queryFn: () => customFetch<ECIResultsResponse>(`/api/elections/${id}/eci-results`, { method: "GET" }),
    retry: false,
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options?.query,
  });
};
