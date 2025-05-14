import { parseSignature } from "viem";
import type { Address, WalletClient } from "viem";
import type { SignAuthorizationReturnType } from "viem/accounts";
import type { usePublicClient } from "wagmi";

/**
 * @description Signs an EIP-7702 Authorization via EIP-712
 * @param walletClient - The injected wallet client used for signing
 * @param publicClient - The public client used to fetch the nonce
 * @param eoa - The user's Externally Owned Account address
 * @param contractAddress - The address of the contract to delegate to
 * @returns A value that can be pushed into `authorizationList`
 */
export async function signAuthorizationTyped(
	walletClient: WalletClient,
	publicClient: ReturnType<typeof usePublicClient>,
	eoa: Address,
	contractAddress: Address,
): Promise<SignAuthorizationReturnType> {
	const chainId = walletClient.chain?.id;
	if (!chainId) throw new Error("walletClient.chain.id undefined");
	if (!publicClient) throw new Error("publicClient undefined");

	/* fetch the current nonce (as bigint) & cast to number */
	const nonce = Number(
		await publicClient.getTransactionCount({
			address: eoa,
			blockTag: "pending",
		}),
	);

	/* ---------- EIP-712 domain / types / message ---------- */
	const domain = {
		name: "EIP-7702 Authorization",
		version: "1",
		chainId,
	} as const;

	const types = {
		Authorization: [
			{ name: "chainId", type: "uint256" },
			{ name: "contractAddress", type: "address" },
			{ name: "nonce", type: "uint256" },
		],
	} as const;

	const message = {
		chainId: BigInt(chainId),
		contractAddress,
		nonce: BigInt(nonce),
	} as const;

	/* ---------- user signs ---------- */
	const sig = await walletClient.signTypedData({
		account: eoa,
		primaryType: "Authorization",
		domain,
		types,
		message,
	});

	/* r / s / v → yParity */
	const { r, s, v } = parseSignature(sig);
	const yParity = v === 27n ? 0 : 1;

	/* ---------- exact shape viem expects ---------- */
	const authorization: SignAuthorizationReturnType = {
		address: contractAddress, // note: "address", not "contractAddress"
		chainId,
		nonce,
		r,
		s,
		v,
		yParity,
	};

	return authorization;
}
