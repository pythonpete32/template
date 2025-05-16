"use server";

import {
  type BalanceData,
  EnsoClient,
  type ApproveData,
  type ApproveParams,
  type RouteData,
  type RouteParams,
  type TokenData,
  type TokenParams,
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

export async function getRouterData(
  fromAddress: Address,
  receiver: Address,
  amountIn: string,
  tokenIn: Address,
  tokenOut: Address,
  slippage = 50 // Default to 0.5%
): Promise<RouteData | { error: string }> {
  try {
    const params: RouteParams = {
      fromAddress: fromAddress as `0x${string}`,
      receiver: receiver as `0x${string}`,
      spender: fromAddress as `0x${string}`, // Default to the same address
      chainId: 8453, // Base mainnet
      amountIn,
      tokenIn: tokenIn as `0x${string}`,
      tokenOut: tokenOut as `0x${string}`,
      slippage, // In basis points (50 = 0.5%)
      routingStrategy: "router",
    };

    console.log("Router params:", params);

    const routeData: RouteData = await enso.getRouterData(params);

    console.log(
      "Route data from Enso SDK:",
      JSON.stringify(routeData, null, 2)
    );

    return routeData;
  } catch (error: unknown) {
    console.error("Error fetching route data from Enso SDK:", error);
    if (error instanceof Error) {
      return { error: `Failed to fetch route data: ${error.message}` };
    }
    return { error: "An unknown error occurred while fetching route data." };
  }
}

export async function getTokenData(
  params: Partial<TokenParams> = { includeMetadata: true }
): Promise<{ data: TokenData[] } | { error: string }> {
  try {
    // Ensure chainId is set and includeMetadata defaults to true
    const tokenParams: TokenParams = {
      chainId: 8453, // Base mainnet
      includeMetadata: true,
      ...params,
    };

    console.log("Token params:", tokenParams);

    const tokenData = await enso.getTokenData(tokenParams);

    console.log(
      "Token data from Enso SDK:",
      JSON.stringify(tokenData, null, 2)
    );

    return tokenData;
  } catch (error: unknown) {
    console.error("Error fetching token data from Enso SDK:", error);
    if (error instanceof Error) {
      return { error: `Failed to fetch token data: ${error.message}` };
    }
    return { error: "An unknown error occurred while fetching token data." };
  }
}
