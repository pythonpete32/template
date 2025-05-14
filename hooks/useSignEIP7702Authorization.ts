'use client';

import { useMutation } from '@tanstack/react-query';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { signAuthorizationTyped } from '@/lib/sign-7702-auth';
import type { Address, PublicClient, WalletClient, Chain, Transport } from 'viem';
import type { SignAuthorizationReturnType } from 'viem/accounts';

interface UseSignEIP7702AuthorizationProps {
  contractAddress: Address | undefined;
}

export function useSignEIP7702Authorization({ contractAddress }: UseSignEIP7702AuthorizationProps) {
  const { address: eoa } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const mutation = useMutation<SignAuthorizationReturnType, Error, void, unknown>({
    mutationFn: async () => {
      if (!eoa || !walletClient || !publicClient || !publicClient.chain || !contractAddress) {
        throw new Error(
          'EOA, wallet client, public client (with chain), or contract address not available.',
        );
      }
      // It might be good practice to reset dependent mutations here if any,
      // or handle it in the component using the hook.
      // For now, keeping it focused on signing.

      // Assert that publicClient has a defined chain for TypeScript's benefit
      const checkedPublicClient = publicClient as PublicClient<Transport, Chain>;

      return signAuthorizationTyped(
        walletClient as WalletClient,
        checkedPublicClient,
        eoa,
        contractAddress,
      );
    },
    // onSuccess and onError can be handled by the component using the hook
    // or defined here if there's common logic.
  });

  return {
    signAuthorization: mutation.mutate,
    signedAuthorization: mutation.data,
    isSigning: mutation.isPending,
    signingError: mutation.error,
    isSigningError: mutation.isError,
    resetSigning: mutation.reset, // Expose reset for more control
  };
}
