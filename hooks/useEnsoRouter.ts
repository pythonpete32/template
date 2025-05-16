"use client";

import { useQuery } from "@tanstack/react-query";
import { getRouterData } from "../actions/enso";
import type { RouteData } from "@ensofinance/sdk";
import type { Address } from "viem";

interface UseEnsoRouterOptions {
  fromAddress: Address;
  receiver: Address;
  amountIn: string;
  tokenIn: Address;
  tokenOut: Address;
  slippage?: number;
  enabled?: boolean;
}

interface UseEnsoRouterReturn {
  routeData: RouteData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isError: boolean;
}

/**
 * Custom hook to fetch Enso routing data for token swaps.
 *
 * This hook encapsulates the React Query logic for fetching routing data from the Enso SDK
 * via a server action.
 */
export function useEnsoRouter({
  fromAddress,
  receiver,
  amountIn,
  tokenIn,
  tokenOut,
  slippage = 50, // Default to 0.5%
  enabled = true,
}: UseEnsoRouterOptions): UseEnsoRouterReturn {
  const { data, isLoading, isFetching, error, isError } = useQuery<
    RouteData | { error: string },
    Error,
    RouteData
  >({
    queryKey: [
      "ensoRouter",
      fromAddress,
      receiver,
      amountIn,
      tokenIn,
      tokenOut,
      slippage,
    ],

    queryFn: async () => {
      if (!fromAddress || !receiver || !tokenIn || !tokenOut) {
        throw new Error("All addresses and tokens are required.");
      }

      if (!amountIn || amountIn === "0") {
        throw new Error("Amount must be greater than 0.");
      }

      return getRouterData(
        fromAddress,
        receiver,
        amountIn,
        tokenIn,
        tokenOut,
        slippage
      );
    },

    enabled:
      enabled &&
      !!fromAddress &&
      !!receiver &&
      !!tokenIn &&
      !!tokenOut &&
      !!amountIn &&
      amountIn !== "0",

    staleTime: 1000 * 60 * 1, // 1 minute (shorter than approval as prices change frequently)
    gcTime: 1000 * 60 * 5, // 5 minutes

    select: (fetchedData: RouteData | { error: string }) => {
      if (
        typeof fetchedData === "object" &&
        "error" in fetchedData &&
        fetchedData.error
      ) {
        throw new Error(fetchedData.error);
      }
      return fetchedData as RouteData;
    },
  });

  return {
    routeData: data,
    isLoading,
    isFetching,
    error,
    isError,
  };
}
