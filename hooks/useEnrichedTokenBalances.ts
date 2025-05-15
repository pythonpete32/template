"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useEnsoBalances } from "./useEnsoBalances";
import {
	getTokenInfoFromCoinGecko,
	type CoinGeckoTokenInfo,
} from "../actions/coin-gecko";
import { formatUnits } from "viem"; // Import formatUnits
import type { BalanceData } from "@ensofinance/sdk";

// --- Constants for Base Native Token ---
const BASE_NATIVE_TOKEN_ADDRESS_LOWERCASE = "base";
const BASE_NATIVE_TOKEN_NAME = "Base Native Token";
const BASE_NATIVE_TOKEN_SYMBOL = "ETH";
// Define a placeholder or actual path if you have a local logo for native ETH
const BASE_NATIVE_TOKEN_LOGO_URI =
	"https://assets.coingecko.com/coins/images/279/small/ethereum.png"; // Or e.g., '/logos/eth.svg';

/**
 * Represents an Enso balance enriched with CoinGecko metadata and calculated values.
 */
export interface EnrichedTokenBalance extends BalanceData {
	id: string; // Unique identifier (contract address or 'native')
	name: string; // From CoinGecko or fallback
	symbol: string; // From CoinGecko or fallback
	logoURI?: string; // From CoinGecko or fallback (e.g., for native)
	formattedAmount: string; // Balance formatted with decimals
	usdValue: number | null; // Total USD value of the token holding (amount * price)
	// rawAmount, decimals, price, etc., are inherited from EnsoTokenBalance
	// isNative is implicitly handled by checking id === BASE_NATIVE_TOKEN_ADDRESS_LOWERCASE
}

interface UseEnrichedTokenBalancesReturn {
	enrichedBalances: EnrichedTokenBalance[] | undefined;
	isLoading: boolean;
	isFetching: boolean;
	error: Error | null;
	isError: boolean;
}

const COINGECKO_PLATFORM_ID = "base";

export function useEnrichedTokenBalances(): UseEnrichedTokenBalancesReturn {
	const {
		balances: ensoBalances,
		isLoading: isLoadingEnsoBalances,
		isFetching: isFetchingEnsoBalances,
		error: errorEnsoBalances,
		isError: isErrorEnsoBalances,
	} = useEnsoBalances();

	const tokensToFetchFromCoinGecko = useMemo(() => {
		if (!ensoBalances) return [];
		return ensoBalances.filter(
			(balance) =>
				balance.token.toLowerCase() !== BASE_NATIVE_TOKEN_ADDRESS_LOWERCASE,
		);
	}, [ensoBalances]);

	const coingeckoQueryOptions = useMemo(() => {
		return tokensToFetchFromCoinGecko.map((balance) => ({
			queryKey: [
				"coinGeckoTokenInfo",
				COINGECKO_PLATFORM_ID,
				balance.token.toLowerCase(),
			],
			queryFn: () =>
				getTokenInfoFromCoinGecko(
					COINGECKO_PLATFORM_ID,
					balance.token.toLowerCase(),
				),
			staleTime: 1000 * 60 * 60 * 24, // 24 hours
			gcTime: 1000 * 60 * 60 * 25, // 25 hours
			retry: 1,
		}));
	}, [tokensToFetchFromCoinGecko]);

	const coingeckoQueryResults = useQueries({
		queries: coingeckoQueryOptions,
	});

	const isLoading = useMemo(() => {
		return (
			isLoadingEnsoBalances ||
			(!!ensoBalances &&
				coingeckoQueryResults.some((result) => result.isLoading))
		);
	}, [isLoadingEnsoBalances, ensoBalances, coingeckoQueryResults]);

	const isFetching = useMemo(() => {
		return (
			isFetchingEnsoBalances ||
			(!!ensoBalances &&
				coingeckoQueryResults.some((result) => result.isFetching))
		);
	}, [isFetchingEnsoBalances, ensoBalances, coingeckoQueryResults]);

	const { firstError, isOverallError } = useMemo(() => {
		if (isErrorEnsoBalances && errorEnsoBalances) {
			return { firstError: errorEnsoBalances, isOverallError: true };
		}
		const coingeckoErrorResult = coingeckoQueryResults.find(
			(result) => result.isError && result.error,
		);
		if (coingeckoErrorResult) {
			return {
				firstError: coingeckoErrorResult.error as Error,
				isOverallError: true,
			};
		}
		return { firstError: null, isOverallError: false };
	}, [isErrorEnsoBalances, errorEnsoBalances, coingeckoQueryResults]);

	const enrichedBalances = useMemo(() => {
		if (!ensoBalances) return undefined;
		// If Enso balances are loading, or if they errored, don't attempt to enrich yet or return undefined
		if (isLoadingEnsoBalances) return undefined;
		if (isErrorEnsoBalances) return undefined;

		return ensoBalances.map((balance) => {
			const isNative =
				balance.token.toLowerCase() === BASE_NATIVE_TOKEN_ADDRESS_LOWERCASE;
			let tokenInfo: CoinGeckoTokenInfo | undefined | null = null;

			if (!isNative) {
				// Find the corresponding CoinGecko query result for non-native tokens
				// The order of `tokensToFetchFromCoinGecko` matches `coingeckoQueryResults`
				const tokenIndex = tokensToFetchFromCoinGecko.findIndex(
					(tb) => tb.token.toLowerCase() === balance.token.toLowerCase(),
				);
				const coingeckoResult =
					tokenIndex !== -1 ? coingeckoQueryResults[tokenIndex] : undefined;

				if (coingeckoResult?.data && !("error" in coingeckoResult.data)) {
					const cgData = coingeckoResult.data as CoinGeckoTokenInfo;
					tokenInfo = cgData;
				}
			}

			const id = isNative ? BASE_NATIVE_TOKEN_ADDRESS_LOWERCASE : balance.token;
			let formattedAmountStr = "0";
			try {
				if (
					balance.amount &&
					balance.decimals !== undefined &&
					balance.decimals !== null
				) {
					formattedAmountStr = formatUnits(
						BigInt(balance.amount),
						balance.decimals,
					);
				}
			} catch (e) {
				console.error(`Error formatting amount for ${balance.token}:`, e);
				formattedAmountStr = "Error"; // Or handle as per display requirements
			}

			let calculatedUsdValue: number | null = null;
			if (
				balance.price !== null &&
				balance.price !== undefined &&
				formattedAmountStr !== "Error"
			) {
				try {
					calculatedUsdValue =
						Number.parseFloat(formattedAmountStr) *
						Number.parseFloat(balance.price);
				} catch (e) {
					console.error(`Error calculating USD value for ${balance.token}:`, e);
				}
			}

			if (isNative) {
				return {
					...balance,
					id,
					name: BASE_NATIVE_TOKEN_NAME,
					symbol: BASE_NATIVE_TOKEN_SYMBOL,
					logoURI: BASE_NATIVE_TOKEN_LOGO_URI,
					formattedAmount: formattedAmountStr,
					usdValue: calculatedUsdValue,
				} as EnrichedTokenBalance; // Ensure type assertion if necessary
			}

			return {
				...balance,
				id,
				name: tokenInfo?.name || "Unknown Token",
				symbol: tokenInfo?.symbol || "N/A",
				logoURI: tokenInfo?.logoURI || undefined,
				formattedAmount: formattedAmountStr,
				usdValue: calculatedUsdValue,
			} as EnrichedTokenBalance; // Ensure type assertion
		});
	}, [
		ensoBalances,
		tokensToFetchFromCoinGecko,
		coingeckoQueryResults,
		isLoadingEnsoBalances,
		isErrorEnsoBalances,
	]);

	return {
		enrichedBalances,
		isLoading,
		isFetching,
		error: firstError,
		isError: isOverallError, // Corrected: use isOverallError here
	};
}
