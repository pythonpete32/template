"use client";

import { useQuery } from "@tanstack/react-query";
import { getApprovalData } from "../actions/enso";
import type { ApproveData } from "@ensofinance/sdk";
import type { Address } from "viem";

interface UseEnsoApprovalOptions {
  fromAddress: Address;
  tokenAddress: Address;
  amount: string;
  enabled?: boolean;
}

interface UseEnsoApprovalReturn {
  approvalData: ApproveData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isError: boolean;
}

/**
 * Custom hook to fetch Enso approval data for a token.
 *
 * This hook encapsulates the React Query logic for fetching approval data from the Enso SDK
 * via a server action.
 */
export function useEnsoApproval({
  fromAddress,
  tokenAddress,
  amount,
  enabled = true,
}: UseEnsoApprovalOptions): UseEnsoApprovalReturn {
  const { data, isLoading, isFetching, error, isError } = useQuery<
    ApproveData | { error: string },
    Error,
    ApproveData
  >({
    queryKey: ["ensoApproval", fromAddress, tokenAddress, amount],

    queryFn: async () => {
      if (!fromAddress || !tokenAddress) {
        throw new Error("From address and token address are required.");
      }
      return getApprovalData(fromAddress, tokenAddress, amount);
    },

    enabled: enabled && !!fromAddress && !!tokenAddress,

    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes

    select: (fetchedData: ApproveData | { error: string }) => {
      if (
        typeof fetchedData === "object" &&
        "error" in fetchedData &&
        fetchedData.error
      ) {
        throw new Error(fetchedData.error);
      }
      return fetchedData as ApproveData;
    },
  });

  return {
    approvalData: data,
    isLoading,
    isFetching,
    error,
    isError,
  };
}
