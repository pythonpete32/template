"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { relayTransactionAction, type RelayRequest } from "@/app/actions"; // Assuming actions.ts is in app directory
import type { Abi } from "viem";
import type { SignAuthorizationReturnType } from "viem/accounts";

interface RelayEIP7702TransactionParams {
  authorization: SignAuthorizationReturnType | undefined | null;
  abi: Abi;
  functionName: string;
  args: unknown[];
}

export function useRelayEIP7702Transaction() {
  const { address: eoa } = useAccount();

  const mutation = useMutation<
    { txHash: string },
    Error,
    RelayEIP7702TransactionParams,
    unknown
  >({
    mutationFn: async ({
      authorization,
      abi,
      functionName,
      args,
    }: RelayEIP7702TransactionParams) => {
      if (!eoa) {
        throw new Error("EOA address not available.");
      }
      if (!authorization) {
        throw new Error("Authorization not provided for relaying.");
      }

      const params: RelayRequest = {
        address: eoa,
        authorization,
        abi,
        functionName,
        args,
      };

      const result = await relayTransactionAction(params);
      if (result.error) {
        throw new Error(result.error);
      }
      if (!result.txHash) {
        throw new Error(
          "Transaction hash not found in server action response."
        );
      }
      return { txHash: result.txHash };
    },
  });

  return {
    relayTransaction: mutation.mutate,
    relayedTxData: mutation.data,
    isRelaying: mutation.isPending,
    relayingError: mutation.error,
    isRelayingError: mutation.isError,
    resetRelaying: mutation.reset,
  };
}
