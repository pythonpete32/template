"use server";

import {
  type BalanceData,
  EnsoClient,
  type ApproveData,
  type ApproveParams,
} from "@ensofinance/sdk";
import { getServerEnv } from "../lib/env";
import type { Address } from "viem";

const enso = new EnsoClient({
  apiKey: getServerEnv().ENSO_API_KEY,
});

export async function getEOABalances(
  eoaAddress: Address
): Promise<Array<BalanceData> | { error: string }> {
  if (!eoaAddress || !eoaAddress.startsWith("0x")) {
    return { error: "Valid EOA address (starting with 0x) is required." };
  }

  try {
    const balances: BalanceData[] = await enso.getBalances({
      chainId: 8453, // Base mainnet
      eoaAddress: eoaAddress,
      useEoa: true,
    });

    // Log the raw balances to the server console for inspection
    console.log(
      "Raw balances from Enso SDK:",
      JSON.stringify(balances, null, 2)
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

export async function getApprovalData(
  fromAddress: Address,
  tokenAddress: Address,
  amount: string
): Promise<ApproveData | { error: string }> {
  try {
    const params: ApproveParams = {
      fromAddress: fromAddress as `0x${string}`,
      tokenAddress: tokenAddress as `0x${string}`,
      chainId: 8453, // Base mainnet
      amount,
      routingStrategy: "router",
    };

    console.log("Approval params:", params);

    const approvalData: ApproveData = await enso.getApprovalData(params);

    console.log(
      "Approval data from Enso SDK:",
      JSON.stringify(approvalData, null, 2)
    );

    return approvalData;
  } catch (error: unknown) {
    console.error("Error fetching approval data from Enso SDK:", error);
    if (error instanceof Error) {
      return { error: `Failed to fetch approval data: ${error.message}` };
    }
    return { error: "An unknown error occurred while fetching approval data." };
  }
}
