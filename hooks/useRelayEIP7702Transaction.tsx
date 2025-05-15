"use client";

import { useMutation } from "@tanstack/react-query";
import { useAccount, useWaitForTransactionReceipt, useConfig } from "wagmi";
import { relayTransactionAction, type RelayRequest } from "@/app/actions";
import { toast } from "sonner";
import type { Abi } from "viem";
import type { SignAuthorizationReturnType } from "viem/accounts";
import { useEffect, useState, useCallback } from "react";

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
  const config = useConfig();

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

  // Get block explorer URL for current chain
  const getBlockExplorerUrl = useCallback(
    (hash: string): string | undefined => {
      if (!hash) return undefined;

      // Get the current chain from config - for a transaction we haven't received yet,
      // use the current chain from wagmi config
      const currentChainId = txReceipt?.chainId || config.chains?.[0]?.id;

      if (!currentChainId || !config.chains) return undefined;

      const currentChain = config.chains.find(
        (chain) => chain.id === currentChainId
      );

      if (!currentChain?.blockExplorers?.default?.url) return undefined;

      // Return the block explorer URL with the transaction hash
      return `${currentChain.blockExplorers.default.url}/tx/${hash}`;
    },
    [txReceipt?.chainId, config.chains]
  );

  // Debug logging for transaction status
  useEffect(() => {
    if (txHash) {
      console.log(`⏳ Monitoring tx: ${txHash}`);
      console.log(`Status: ${status}, FetchStatus: ${fetchStatus}`);
      console.log(
        `isLoading: ${isTxLoading}, isSuccess: ${isTxSuccess}, isError: ${isTxError}`
      );
      console.log(`Current toastId: ${toastId}`);
      console.log(`Explorer URL: ${getBlockExplorerUrl(txHash)}`);
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
    getBlockExplorerUrl,
  ]);

  // Handle transaction status changes with toast updates
  useEffect(() => {
    if (!txHash) return;

    // For any state, if we have a transaction hash, include the link
    const explorerUrl = getBlockExplorerUrl(txHash);

    // Create action config for explorer link if URL is available
    const explorerAction = explorerUrl
      ? {
          label: "View on explorer",
          onClick: () =>
            window.open(explorerUrl, "_blank", "noopener,noreferrer"),
        }
      : undefined;

    // Allow toast updates even without a toast ID (will create new toasts)
    if (isTxLoading) {
      if (toastId) {
        toast.loading("Waiting for transaction confirmation...", {
          id: toastId,
          action: explorerAction,
        });
      } else {
        const newId = toast.loading("Waiting for transaction confirmation...", {
          action: explorerAction,
        });
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
            `Transaction confirmed in block ${txReceipt.blockNumber.toString()}!`,
            {
              id: toastId,
              duration: 8000,
              action: explorerAction,
            }
          );
        } else {
          toast.success(
            `Transaction confirmed in block ${txReceipt.blockNumber.toString()}!`,
            {
              duration: 8000,
              action: explorerAction,
            }
          );
        }
        console.log("🎉 Success toast displayed");
      } else {
        // Update existing toast or create new error toast for reverted transactions
        if (toastId) {
          toast.error("Transaction reverted on chain", {
            id: toastId,
            action: explorerAction,
          });
        } else {
          toast.error("Transaction reverted on chain", {
            action: explorerAction,
          });
        }
        console.log("❌ Error toast displayed for reverted transaction");
      }
    }

    if (isTxError && txError) {
      if (toastId) {
        toast.error(`Transaction failed: ${txError.message}`, {
          id: toastId,
          action: explorerAction,
        });
      } else {
        toast.error(`Transaction failed: ${txError.message}`, {
          action: explorerAction,
        });
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
    getBlockExplorerUrl,
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

        // Store the transaction hash for monitoring - ensure it's properly typed as 0x-prefixed string
        const hash = result.txHash as `0x${string}`;
        console.log(`📝 Setting tx hash for monitoring: ${hash}`);
        setTxHash(hash);

        // Create explorer link as soon as we have the tx hash
        const explorerUrl = getBlockExplorerUrl(hash);

        // Update toast to waiting for confirmation with explorer link button
        toast.loading("Transaction submitted - waiting for confirmation...", {
          id,
          action: explorerUrl
            ? {
                label: "View on explorer",
                onClick: () =>
                  window.open(explorerUrl, "_blank", "noopener,noreferrer"),
              }
            : undefined,
        });

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
    relayTransactionAsync: mutation.mutateAsync,
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
