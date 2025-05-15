"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { signAuthorizationTyped } from "@/lib/sign-7702-auth";
import type {
  Address,
  PublicClient,
  WalletClient,
  Chain,
  Transport,
} from "viem";
import type { SignAuthorizationReturnType } from "viem/accounts";

interface UseSignEIP7702AuthorizationProps {
  contractAddress: Address | undefined;
}

export function useSignEIP7702Authorization({
  contractAddress,
}: UseSignEIP7702AuthorizationProps) {
  const { address: eoa } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const mutation = useMutation<
    SignAuthorizationReturnType,
    Error,
    void,
    unknown
  >({
    mutationFn: async () => {
      if (!eoa || !contractAddress) {
        throw new Error("EOA or contract address not available.");
      }

      // Assert that publicClient has a defined chain for TypeScript's benefit
      const checkedPublicClient = publicClient as PublicClient<
        Transport,
        Chain
      >;

      return signAuthorizationTyped(
        walletClient as WalletClient,
        checkedPublicClient,
        eoa,
        contractAddress
      );
    },
  });

  return {
    signAuthorization: mutation.mutate,
    signedAuthorization: mutation.data,
    isSigning: mutation.isPending,
    signingError: mutation.error,
    isSigningError: mutation.isError,
    resetSigning: mutation.reset,
  };
}
