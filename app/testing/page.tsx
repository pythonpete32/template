"use client";

import { useAccount } from "wagmi";
import { ContentArea } from "@/components/ContentArea";
import { Card } from "@/components/ui/card";
import { Beaker, Wallet } from "lucide-react";
import Image from "next/image";
import { TokenApproval } from "@/components/TokenApproval";
import { useEIP7702Transaction } from "@/hooks/useEIP7702Transaction";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ApproveData } from "@ensofinance/sdk";
import { base } from "viem/chains";

export default function TestingPage() {
  const { address } = useAccount();
  const [approvalData, setApprovalData] = useState<ApproveData | null>(null);

  // Use our combined hook for EIP-7702 transactions
  const {
    execute,
    isLoading,
    isSigning,
    isRelaying,
    isTxPending,
    isSuccess,
    isError,
    txHash,
    error,
  } = useEIP7702Transaction({});

  const handleApprovalData = (data: unknown) => {
    console.log("Approval data received:", data);
    setApprovalData(data as ApproveData);
  };

  const handleExecuteTransaction = () => {
    if (!approvalData) return;

    console.log("Executing transaction with approval data:", approvalData);

    // Use the transaction data from the approval
    // Using the BatchExecutor contract's executeBatch function
    execute([
      [approvalData.tx.to], // targets array - token contract
      [approvalData.tx.data], // data array - approval data
    ]);
  };

  // Base explorer URL for transaction links
  const explorerUrl = base.blockExplorers?.default.url;

  return (
    <ContentArea>
      <div className="mb-8 flex items-center">
        <div className="relative h-16 w-16 mr-4">
          <Image
            src="/logo.png"
            alt="Based Wallet"
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Based Wallet - Testing Lab
          </h1>
          <p className="text-muted-foreground">
            Try new experimental features and help us improve Based Wallet
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 border-2 border-primary/10 shadow-md">
          <div className="flex items-center mb-4">
            <Beaker className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Connected Wallet</h2>
          </div>

          <div className="p-4 bg-secondary/20 rounded-md mb-6">
            <div className="flex items-center mb-2">
              <Wallet className="h-5 w-5 mr-2 text-secondary-foreground" />
              <p className="font-medium">Connected wallet:</p>
            </div>
            <p className="text-sm font-mono bg-background p-2 rounded overflow-auto">
              {address || "Not connected"}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Token Approval Flow</h2>
            <TokenApproval
              title="Test Token Approval"
              onApprovalData={handleApprovalData}
            />

            {approvalData && (
              <div className="mt-6">
                <Button
                  onClick={handleExecuteTransaction}
                  disabled={isLoading || !address}
                  className="w-full"
                >
                  {isSigning
                    ? "Signing..."
                    : isRelaying || isTxPending
                      ? "Processing..."
                      : "Execute Approval Transaction with EIP-7702"}
                </Button>

                {isError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
                    Error: {error?.message || "An unknown error occurred"}
                  </div>
                )}

                {isSuccess && txHash && explorerUrl && (
                  <div className="mt-4 p-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md">
                    <h3 className="text-base font-medium mb-2">
                      Transaction Successful!
                    </h3>
                    <a
                      href={`${explorerUrl}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
                    >
                      View on Basescan
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentArea>
  );
}
