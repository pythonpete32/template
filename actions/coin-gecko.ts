"use server";

/**
 * Represents the structure of the token information we expect to get from CoinGecko.
 */
export interface CoinGeckoTokenInfo {
  name: string;
  symbol: string;
  logoURI?: string; // Logo URI might be nested under 'image'
  contractAddress: string; // To confirm we got the right token
  price_change_percentage_24h: number;
  error?: string; // To pass along errors
}

interface CoinGeckoImage {
  thumb: string;
  small: string;
  large: string;
}

/**
 * Represents a partial structure of the CoinGecko API response for a token by contract address.
 * See: https://www.coingecko.com/en/api/documentation -> /coins/{id}/contract/{contract_address}
 */
interface CoinGeckoApiResponse {
  id: string;
  symbol: string;
  name: string;
  contract_address: string;
  price_change_percentage_24h: number;
  image?: CoinGeckoImage; // Image object can sometimes be missing for obscure tokens
  // We only care about these fields for now, but the API returns much more.
  // Add more fields here if needed.
}

const COINGECKO_API_BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * Fetches detailed token information from the CoinGecko API.
 * @param platformId The CoinGecko platform ID (e.g., 'base', 'ethereum').
 * @param contractAddress The token's contract address.
 * @returns {Promise<CoinGeckoTokenInfo | { error: string }>} Token information or an error object.
 */
export async function getTokenInfoFromCoinGecko(
  platformId: string,
  contractAddress: string
): Promise<CoinGeckoTokenInfo | { error: string }> {
  if (!platformId || !contractAddress) {
    return { error: "Platform ID and contract address are required." };
  }

  const url = `${COINGECKO_API_BASE_URL}/coins/${platformId}/contract/${contractAddress.toLowerCase()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Try to parse error from CoinGecko if possible
      let errorBody = "Failed to fetch token info from CoinGecko.";
      try {
        const errorData = await response.json();
        errorBody =
          errorData?.error ||
          `CoinGecko API Error: ${response.status} ${response.statusText}`;
      } catch (e) {
        // Ignore if error response is not JSON
      }
      console.error(
        `CoinGecko API request failed for ${contractAddress} on ${platformId}: ${response.status} ${response.statusText}`
      );
      return { error: errorBody };
    }

    const data = (await response.json()) as CoinGeckoApiResponse;

    // Basic validation to see if we got something sensible
    if (!data || !data.symbol || !data.name) {
      console.warn(
        `CoinGecko: No sufficient data for ${contractAddress} on ${platformId}`,
        data
      );
      return {
        error: `Incomplete data received from CoinGecko for token ${contractAddress}.`,
      };
    }

    return {
      name: data.name,
      symbol: data.symbol.toUpperCase(), // Often symbols are lowercase in API
      logoURI: data.image?.small || data.image?.thumb, // Prefer small, fallback to thumb
      contractAddress: data.contract_address, // Ensure it's the one we queried for
      price_change_percentage_24h: data.price_change_percentage_24h,
    };
  } catch (error) {
    console.error(
      `Error fetching CoinGecko data for ${contractAddress} on ${platformId}:`,
      error
    );
    if (error instanceof Error) {
      return { error: error.message };
    }
    return {
      error:
        "An unknown error occurred while fetching token info from CoinGecko.",
    };
  }
}
