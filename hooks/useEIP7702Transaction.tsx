"use client";

import { useCallback, useState } from "react";
import { useSignEIP7702Authorization } from "./useSignEIP7702Authorization";
import { useRelayEIP7702Transaction } from "./useRelayEIP7702Transaction";

interface UseEIP7702TransactionParams {
  enabled?: boolean;
}

import BatchExecutor from "@/contracts/BatchExecutor";

export function useEIP7702Transaction({
  enabled = true,
}: UseEIP7702TransactionParams) {
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
    contractAddress: BatchExecutor.address,
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
      if (!enabled) return;

      setIsProcessing(true);

      try {
        // Step 1: Sign the transaction using the async version
        const authorization = await signAuthorizationAsync();

        // Step 2: Relay the transaction with the authorization
        if (authorization) {
          await relayTransactionAsync({
            authorization,
            abi: BatchExecutor.abi,
            functionName: "executeBatch",
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
    [enabled, signAuthorizationAsync, relayTransactionAsync]
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
