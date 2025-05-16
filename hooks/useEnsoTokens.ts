"use client";

import { useQuery } from "@tanstack/react-query";
import { getTokenData } from "../actions/enso";
import type { TokenData, TokenParams } from "@ensofinance/sdk";

interface UseEnsoTokensOptions extends Partial<TokenParams> {
  enabled?: boolean;
}

interface UseEnsoTokensReturn {
  tokens: TokenData[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isError: boolean;
}

/**
 * Custom hook to fetch token data from Enso API.
 *
 * This hook encapsulates the React Query logic for fetching token data via a server action.
 */
export function useEnsoTokens({
  enabled = true,
  ...params
}: UseEnsoTokensOptions = {}): UseEnsoTokensReturn {
  const queryParams = { ...params };

  const { data, isLoading, isFetching, error, isError } = useQuery<
    { data: TokenData[] } | { error: string },
    Error,
    TokenData[]
  >({
    queryKey: ["ensoTokens", queryParams],

    queryFn: async () => {
      return getTokenData(queryParams);
    },

    enabled,

    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes

    select: (fetchedData) => {
      if ("error" in fetchedData && fetchedData.error) {
        throw new Error(fetchedData.error);
      }
      return "data" in fetchedData ? fetchedData.data : [];
    },
  });

  return {
    tokens: data,
    isLoading,
    isFetching,
    error,
    isError,
  };
}
