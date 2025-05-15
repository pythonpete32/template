"use client";

import { useCallback, useState } from "react";
import { useSignEIP7702Authorization } from "./useSignEIP7702Authorization";
import { useRelayEIP7702Transaction } from "./useRelayEIP7702Transaction";
import type { Abi, Address } from "viem";

interface UseEIP7702TransactionParams<TFunctionName extends string> {
  contractAddress: Address | undefined;
  abi: Abi;
  functionName: TFunctionName;
  enabled?: boolean;
}

export function useEIP7702Transaction<TFunctionName extends string>({
  contractAddress,
  abi,
  functionName,
  enabled = true,
}: UseEIP7702TransactionParams<TFunctionName>) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Use the existing hooks
  const {
    signAuthorizationAsync,
    signedAuthorization,
    isSigning,
    signingError,
    isSigningError,
    resetSigning,
  } = useSignEIP7702Authorization({
    contractAddress,
  });

  const {
    relayTransactionAsync,
    relayedTxData,
    isRelaying,
    relayingError,
    isRelayingError,
    resetRelaying,
    txReceipt,
    isTxConfirmed,
    isTxPending,
  } = useRelayEIP7702Transaction();

  // Combined reset function
  const reset = useCallback(() => {
    resetSigning();
    resetRelaying();
    setIsProcessing(false);
  }, [resetSigning, resetRelaying]);

  // Combined execute function that handles both signing and relaying
  const execute = useCallback(
    async (args: unknown[]) => {
      if (!enabled || !contractAddress) return;

      setIsProcessing(true);

      try {
        // Step 1: Sign the transaction using the async version
        const authorization = await signAuthorizationAsync();

        // Step 2: Relay the transaction with the authorization
        if (authorization) {
          await relayTransactionAsync({
            authorization,
            abi,
            functionName,
            args,
          });
        }
      } catch (error) {
        console.error("EIP-7702 transaction error:", error);
        // Errors are already handled by the individual hooks with toasts
      } finally {
        setIsProcessing(false);
      }
    },
    [
      enabled,
      contractAddress,
      signAuthorizationAsync,
      relayTransactionAsync,
      abi,
      functionName,
    ]
  );

  return {
    // Main execution function
    execute,

    // Status indicators
    isLoading: isProcessing || isSigning || isRelaying || isTxPending,
    isSuccess: isTxConfirmed,
    isError: isSigningError || isRelayingError,

    // Detailed status
    isSigning,
    isRelaying,
    isTxPending,
    isTxConfirmed,

    // Results
    signedAuthorization,
    txHash: relayedTxData?.txHash,
    txReceipt,

    // Errors
    error: signingError || relayingError,
    signingError,
    relayingError,

    // Reset function
    reset,
  };
}
