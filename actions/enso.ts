"use server";

import { type BalanceData, EnsoClient } from "@ensofinance/sdk";
import { getServerEnv } from "../lib/env";

const enso = new EnsoClient({
	apiKey: getServerEnv().ENSO_API_KEY,
});

export async function getEOABalances(
	eoaAddress: string,
): Promise<Array<BalanceData> | { error: string }> {
	if (!eoaAddress || !eoaAddress.startsWith("0x")) {
		return { error: "Valid EOA address (starting with 0x) is required." };
	}

	try {
		const balances: BalanceData[] = await enso.getBalances({
			chainId: 8453, // Base mainnet
			eoaAddress: eoaAddress as `0x${string}`,
			useEoa: true,
		});

		// Log the raw balances to the server console for inspection
		console.log(
			"Raw balances from Enso SDK:",
			JSON.stringify(balances, null, 2),
		);

		return balances;
	} catch (error: unknown) {
		console.error("Error fetching balances from Enso SDK:", error);
		if (error instanceof Error) {
			return { error: `Failed to fetch balances: ${error.message}` };
		}
		return { error: "An unknown error occurred while fetching balances." };
	}
}
