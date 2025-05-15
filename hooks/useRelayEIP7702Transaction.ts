"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { relayTransactionAction, type RelayRequest } from "@/app/actions";
import { toast } from "sonner";
import type { Abi } from "viem";
import type { SignAuthorizationReturnType } from "viem/accounts";
import { useEffect, useState } from "react";

interface RelayEIP7702TransactionParams {
  authorization: SignAuthorizationReturnType | undefined | null;
  abi: Abi;
  functionName: string;
  args: unknown[];
}

export function useRelayEIP7702Transaction() {
  const { address: eoa } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );

  // Use wagmi hook to watch for transaction confirmation
  const {
    data: txReceipt,
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
    isError: isTxError,
    error: txError,
    status,
    fetchStatus,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  // Debug logging for transaction status
  useEffect(() => {
    if (txHash) {
      console.log(`⏳ Monitoring tx: ${txHash}`);
      console.log(`Status: ${status}, FetchStatus: ${fetchStatus}`);
      console.log(
        `isLoading: ${isTxLoading}, isSuccess: ${isTxSuccess}, isError: ${isTxError}`
      );
      console.log(`Current toastId: ${toastId}`);
      if (txReceipt) {
        console.log("Receipt:", txReceipt);
      }
      if (txError) {
        console.log("Error:", txError);
      }
    }
  }, [
    txHash,
    status,
    fetchStatus,
    isTxLoading,
    isTxSuccess,
    isTxError,
    txReceipt,
    txError,
    toastId,
  ]);

  // Handle transaction status changes with toast updates
  useEffect(() => {
    if (!txHash) return;

    // Allow toast updates even without a toast ID (will create new toasts)
    if (isTxLoading) {
      if (toastId) {
        toast.loading("Waiting for transaction confirmation...", {
          id: toastId,
        });
      } else {
        const newId = toast.loading("Waiting for transaction confirmation...");
        setToastId(newId);
      }
    }

    if (isTxSuccess && txReceipt) {
      console.log(
        `Transaction success detected! Status: ${txReceipt.status}, Type: ${typeof txReceipt.status}`
      );

      // Normalize the status to handle different formats
      const txStatus = String(txReceipt.status).toLowerCase();
      const success = txStatus === "success" || txStatus === "1";

      if (success) {
        // Update existing toast or create new success toast
        if (toastId) {
          toast.success(
            `Transaction confirmed in block ${txReceipt.blockNumber}!`,
            { id: toastId }
          );
        } else {
          toast.success(
            `Transaction confirmed in block ${txReceipt.blockNumber}!`
          );
        }
        console.log("🎉 Success toast displayed");
      } else {
        // Update existing toast or create new error toast
        if (toastId) {
          toast.error("Transaction reverted on chain", { id: toastId });
        } else {
          toast.error("Transaction reverted on chain");
        }
        console.log("❌ Error toast displayed for reverted transaction");
      }
    }

    if (isTxError && txError) {
      if (toastId) {
        toast.error(`Transaction failed: ${txError.message}`, { id: toastId });
      } else {
        toast.error(`Transaction failed: ${txError.message}`);
      }
      console.log("❌ Error toast displayed for failed transaction");
    }
  }, [
    txHash,
    toastId,
    isTxLoading,
    isTxSuccess,
    isTxError,
    txReceipt,
    txError,
  ]);

  const mutation = useMutation<
    { txHash: `0x${string}` },
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

      // Show toast when relaying transaction starts
      const id = toast.loading("Submitting transaction to relay...");
      console.log(`Generated toast ID: ${id} (type: ${typeof id})`);
      setToastId(id);

      try {
        const params: RelayRequest = {
          address: eoa,
          authorization,
          abi,
          functionName,
          args,
        };

        const result = await relayTransactionAction(params);

        if (result.error) {
          // Update toast if there's an error in the response
          toast.error(`Transaction failed: ${result.error}`, { id });
          throw new Error(result.error);
        }

        if (!result.txHash) {
          // Update toast if there's no transaction hash
          toast.error("Transaction hash not found in server action response", {
            id,
          });
          throw new Error(
            "Transaction hash not found in server action response."
          );
        }

        // Update toast to waiting for confirmation
        toast.loading("Transaction submitted - waiting for confirmation...", {
          id,
        });

        // Store the transaction hash for monitoring - ensure it's properly typed as 0x-prefixed string
        const hash = result.txHash as `0x${string}`;
        console.log(`📝 Setting tx hash for monitoring: ${hash}`);
        setTxHash(hash);

        return { txHash: hash };
      } catch (error) {
        // Show error toast for any uncaught errors
        toast.error(`Transaction failed: ${(error as Error).message}`, { id });
        throw error;
      }
    },
  });

  return {
    relayTransaction: mutation.mutate,
    relayedTxData: mutation.data,
    isRelaying: mutation.isPending,
    relayingError: mutation.error,
    isRelayingError: mutation.isError,
    resetRelaying: mutation.reset,
    // Additional transaction status
    txReceipt,
    isTxConfirmed: isTxSuccess,
    isTxPending: isTxLoading,
    txError,
    status,
    fetchStatus,
  };
}
