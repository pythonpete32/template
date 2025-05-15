"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { signAuthorizationTyped } from "@/lib/sign-7702-auth";
import { toast } from "sonner";
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

      // Show toast when signing starts
      const toastId = toast.loading("Please sign the authorization...");

      try {
        // Assert that publicClient has a defined chain for TypeScript's benefit
        const checkedPublicClient = publicClient as PublicClient<
          Transport,
          Chain
        >;

        const result = await signAuthorizationTyped(
          walletClient as WalletClient,
          checkedPublicClient,
          eoa,
          contractAddress
        );

        // Show success toast when signing completes
        toast.success("Authorization signed successfully", {
          id: toastId,
        });

        return result;
      } catch (error) {
        // Show error toast if signing fails
        toast.error(`Signing failed: ${(error as Error).message}`, {
          id: toastId,
        });
        throw error;
      }
    },
  });

  return {
    signAuthorization: mutation.mutate,
    signAuthorizationAsync: mutation.mutateAsync,
    signedAuthorization: mutation.data,
    isSigning: mutation.isPending,
    signingError: mutation.error,
    isSigningError: mutation.isError,
    resetSigning: mutation.reset,
  };
}
