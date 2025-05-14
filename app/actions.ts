"use server";

import { createWalletClient, http, type Abi, type Address } from "viem";
import {
	privateKeyToAccount,
	type SignAuthorizationReturnType,
} from "viem/accounts";
import { base } from "viem/chains";
import { getServerEnv } from "../lib/env";

const env = getServerEnv();

export type RelayRequest = {
	address: Address;
	authorization: SignAuthorizationReturnType;
	abi: Abi;
	functionName: string;
	args: unknown[];
};

const client = createWalletClient({
	account: privateKeyToAccount(env.RELAY_PK),
	chain: base,
	transport: http(
		`https://base-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`,
	),
});

export async function relayTransactionAction(params: RelayRequest) {
	try {
		const { address, authorization, abi, functionName, args } = params;

		const hash = await client.writeContract({
			abi,
			address,
			authorizationList: [authorization],
			functionName,
			args,
		});

		console.log("Transaction Hash (Server Action):", hash);
		return { txHash: hash };
	} catch (err) {
		console.error("Relay Error (Server Action):", err);
		const errorMessage =
			err instanceof Error
				? err.message
				: "An unknown error occurred in server action";
		return { error: `Failed to relay transaction: ${errorMessage}` };
	}
}
