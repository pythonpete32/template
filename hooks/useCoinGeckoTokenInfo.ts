'use client';

import { useQuery } from '@tanstack/react-query';
import { getTokenInfoFromCoinGecko, type CoinGeckoTokenInfo } from './actions';

/**
 * Options for the useCoinGeckoTokenInfo hook (currently none, but placeholder for future extension).
 */
// interface UseCoinGeckoTokenInfoOptions {}

/**
 * Defines the shape of the object returned by the `useCoinGeckoTokenInfo` hook.
 */
interface UseCoinGeckoTokenInfoReturn {
  tokenInfo: CoinGeckoTokenInfo | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isFetching: boolean;
}

/**
 * Custom hook to fetch detailed token information (name, symbol, logo) from CoinGecko.
 *
 * @param platformId The CoinGecko platform ID (e.g., 'base', 'ethereum').
 * @param contractAddress The token's contract address.
 * @returns {UseCoinGeckoTokenInfoReturn} The state of the token info fetching operation.
 */
export function useCoinGeckoTokenInfo(
  platformId: string | undefined | null, // Allow undefined/null to easily disable query
  contractAddress: string | undefined | null
  // options?: UseCoinGeckoTokenInfoOptions // Placeholder for future options
): UseCoinGeckoTokenInfoReturn {
  // const {} = options || {}; // Destructure future options here

  const queryResult = useQuery<
    CoinGeckoTokenInfo | { error: string },
    Error,
    CoinGeckoTokenInfo, // Data type after select transformation
    [string, string | undefined | null, string | undefined | null] // QueryKey type
  >({
    queryKey: ['coinGeckoTokenInfo', platformId, contractAddress],
    queryFn: async () => {
      // queryFn must have platformId and contractAddress, checked by 'enabled' option
      if (!platformId || !contractAddress) {
        // This should not be reached if 'enabled' is working correctly
        throw new Error('Platform ID and Contract Address are required to fetch CoinGecko token info.');
      }
      return getTokenInfoFromCoinGecko(platformId, contractAddress);
    },
    enabled: !!platformId && !!contractAddress, // Only run query if both params are provided
    staleTime: 1000 * 60 * 60 * 24, // Token metadata (name, symbol, logo) rarely changes, cache for 24 hours
    gcTime: 1000 * 60 * 60 * 25,    // Keep in cache for 25 hours
    retry: 1, // Retry once on failure for network blips
    select: (data: CoinGeckoTokenInfo | { error: string }) => {
      if ('error' in data && typeof data.error === 'string') {
        // If the server action itself returned an error object, throw it so React Query handles it
        throw new Error(data.error);
      }
      return data as CoinGeckoTokenInfo;
    },
  });

  return {
    tokenInfo: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    isError: queryResult.isError,
    isFetching: queryResult.isFetching,
  };
}
