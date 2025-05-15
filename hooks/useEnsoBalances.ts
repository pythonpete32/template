"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getEOABalances } from "../actions/enso";
import { formatUnits } from "viem";
import type { BalanceData } from "@ensofinance/sdk";

interface UseEnsoBalancesOptions {
	excludeTokensWithoutValue?: boolean;
}

interface UseEnsoBalancesReturn {
	balances: Array<BalanceData> | undefined;
	isLoading: boolean;
	isFetching: boolean;
	error: Error | null;
	isError: boolean;
}

/**
 * Custom hook to fetch Enso token balances for the connected EOA address.
 *
 * This hook encapsulates the React Query logic for fetching balances from the Enso SDK
 * via a server action.
 * @param {UseEnsoBalancesOptions} options - Optional configuration for the hook.
 */
export function useEnsoBalances(
	options?: UseEnsoBalancesOptions,
): UseEnsoBalancesReturn {
	const { address: eoaAddress, isConnected } = useAccount();
	const { excludeTokensWithoutValue = true } = options || {};

	const { data, isLoading, isFetching, error, isError } = useQuery<
		Array<BalanceData> | { error: string },
		Error,
		Array<BalanceData>
	>({
		queryKey: ["ensoBalances", eoaAddress, excludeTokensWithoutValue],

		queryFn: async () => {
			if (!eoaAddress) {
				throw new Error("EOA address not available for querying balances.");
			}
			return getEOABalances(eoaAddress);
		},

		enabled: !!eoaAddress && isConnected,

		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes

		select: (fetchedData: Array<BalanceData> | { error: string }) => {
			if (
				typeof fetchedData === "object" &&
				"error" in fetchedData &&
				fetchedData.error
			) {
				throw new Error(fetchedData.error);
			}
			const rawBalances = fetchedData as Array<BalanceData>;

			if (excludeTokensWithoutValue) {
				return rawBalances.filter((balance) => {
					if (balance.price == null || Number(balance.price) === 0) {
						return false; // Filter out if price is null, undefined, or zero
					}
					try {
						// Calculate total value
						// Ensure amount and decimals are valid before calculation
						if (balance.amount == null || balance.decimals == null)
							return false;

						const amountBigInt = BigInt(balance.amount);
						if (amountBigInt === 0n) return false; // Filter out if amount is zero

						const formattedAmount = Number.parseFloat(
							formatUnits(amountBigInt, balance.decimals),
						);
						const totalValue = formattedAmount * Number(balance.price);
						return totalValue > 0;
					} catch (e) {
						// console.error(`Error calculating value for token ${balance.token || 'unknown'}:`, e);
						return false; // If any error in calculation, filter it out
					}
				});
			}
			return rawBalances;
		},
	});

	return {
		balances: data,
		isLoading,
		isFetching,
		error,
		isError,
	};
}
