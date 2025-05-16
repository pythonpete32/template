"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { ArrowDown, RefreshCw, CheckSquare } from "lucide-react";
import { parseUnits } from "viem";
import type { Address } from "viem";
import { useEnsoRouter } from "@/hooks/useEnsoRouter";
import { useEnsoApproval } from "@/hooks/useEnsoApproval";
import { useEIP7702Transaction } from "@/hooks/useEIP7702Transaction";
import { WalletTokenSelection, type Token } from "./WalletTokenSelection";
import { base } from "viem/chains";
import type { ApproveData, RouteData } from "@ensofinance/sdk";

interface CombinedFlowProps {
  onApprovalData?: (data: ApproveData) => void;
  onRouteData?: (data: RouteData) => void;
}

// Utility function to scale amount by token decimals
const scaleAmount = (amount: string, decimals: number): string => {
  try {
    return parseUnits(amount || "0", decimals).toString();
  } catch (e) {
    console.error("Error scaling amount:", e);
    return "0";
  }
};

export function CombinedFlow({
  onApprovalData,
  onRouteData,
}: CombinedFlowProps) {
  const { address } = useAccount();
  const [inputToken, setInputToken] = useState<Token | null>(null);
  const [outputToken, setOutputToken] = useState<Token | null>(null);
  const [inputAmount, setInputAmount] = useState<string>("1");

  const [isApprovalRequested, setIsApprovalRequested] = useState(false);
  const [isRouteRequested, setIsRouteRequested] = useState(false);

  // Use EIP-7702 for execution
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

  // Scale the amount by token decimals
  const getScaledAmount = (): string => {
    if (!inputToken || !inputAmount) return "0";
    return scaleAmount(inputAmount, inputToken.decimals || 18);
  };

  // Get approval data from Enso
  const {
    approvalData,
    isLoading: isLoadingApproval,
    error: approvalError,
  } = useEnsoApproval({
    fromAddress: address as Address,
    tokenAddress: inputToken?.address as Address,
    amount: getScaledAmount(),
    enabled: isApprovalRequested && !!address && !!inputToken,
  });

  // Get route data from Enso
  const {
    routeData,
    isLoading: isLoadingRoute,
    error: routeError,
  } = useEnsoRouter({
    fromAddress: address as Address,
    receiver: address as Address,
    amountIn: getScaledAmount(),
    tokenIn: inputToken?.address as Address,
    tokenOut: outputToken?.address as Address,
    enabled: isRouteRequested && !!address && !!inputToken && !!outputToken,
  });

  // Pass data back to parent component if needed
  if (approvalData && onApprovalData) {
    onApprovalData(approvalData);
  }

  if (routeData && onRouteData) {
    onRouteData(routeData);
  }

  const handleInputTokenSelect = (token: Token) => {
    setInputToken(token);
    setIsApprovalRequested(false);
    setIsRouteRequested(false);
  };

  const handleOutputTokenSelect = (token: Token) => {
    setOutputToken(token);
    setIsRouteRequested(false);
  };

  const handleInputAmountChange = (newAmount: string) => {
    setInputAmount(newAmount);
    setIsApprovalRequested(false);
    setIsRouteRequested(false);
  };

  const handleGetApproval = () => {
    setIsApprovalRequested(true);
  };

  const handleGetRoute = () => {
    setIsRouteRequested(true);
  };

  const handleExecuteCombined = () => {
    if (!approvalData || !routeData) return;

    console.log("Executing combined transaction");
    console.log("Approval data:", approvalData);
    console.log("Route data:", routeData);

    // Batch both transactions together
    execute([
      // Add both transactions to the targets array
      [approvalData.tx.to, routeData.tx.to],
      // Add both transactions' data
      [approvalData.tx.data, routeData.tx.data],
    ]);
  };

  // Helpers for display
  const explorerUrl = base.blockExplorers?.default.url;
  const isReadyForCombined = !!approvalData && !!routeData;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Combined Approval & Swap</h3>

      {/* Input Token Selection */}
      <div>
        <p className="text-sm mb-1">From</p>
        <WalletTokenSelection
          selectedToken={inputToken}
          onTokenSelect={handleInputTokenSelect}
          onTokenRemove={() => setInputToken(null)}
          amount={inputAmount}
          onAmountChange={handleInputAmountChange}
          showAmountInput={!!inputToken}
          showRemoveButton={!!inputToken}
          buttonText="Select Token"
        />
      </div>

      {/* Swap Direction Indicator */}
      <div className="flex justify-center">
        <div className="p-2 rounded-full bg-secondary">
          <ArrowDown className="h-5 w-5" />
        </div>
      </div>

      {/* Output Token Selection */}
      <div>
        <p className="text-sm mb-1">To</p>
        <WalletTokenSelection
          selectedToken={outputToken}
          onTokenSelect={handleOutputTokenSelect}
          onTokenRemove={() => setOutputToken(null)}
          showAmountInput={false}
          showRemoveButton={!!outputToken}
          buttonText="Select Token"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid gap-2">
        {inputToken && (
          <Button
            onClick={handleGetApproval}
            disabled={isLoadingApproval || !address || !inputToken}
            variant={approvalData ? "neutral" : "default"}
            className="relative"
          >
            {isLoadingApproval ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : approvalData ? (
              <>
                <CheckSquare className="h-4 w-4 mr-2 text-green-500" />
                Approval Data Ready
              </>
            ) : (
              "1. Get Token Approval"
            )}
          </Button>
        )}

        {inputToken && outputToken && (
          <Button
            onClick={handleGetRoute}
            disabled={isLoadingRoute || !address || !inputToken || !outputToken}
            variant={routeData ? "neutral" : "default"}
            className="relative"
          >
            {isLoadingRoute ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : routeData ? (
              <>
                <CheckSquare className="h-4 w-4 mr-2 text-green-500" />
                Route Data Ready
              </>
            ) : (
              "2. Get Swap Route"
            )}
          </Button>
        )}

        {isReadyForCombined && (
          <Button
            onClick={handleExecuteCombined}
            disabled={isLoading || !address}
            className="w-full mt-2"
            variant="default"
            size="lg"
          >
            {isSigning
              ? "Signing..."
              : isRelaying || isTxPending
                ? "Processing..."
                : "3. Execute Combined Transaction"}
          </Button>
        )}
      </div>

      {/* Errors */}
      {(approvalError || routeError) && (
        <div className="mt-2 p-3 bg-destructive/10 text-destructive rounded-md">
          <p className="text-sm font-medium">Error:</p>
          {approvalError && <p className="text-sm">{approvalError.message}</p>}
          {routeError && <p className="text-sm">{routeError.message}</p>}
        </div>
      )}

      {/* Transaction Result */}
      {isError && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md">
          <p className="text-sm font-medium">Transaction Error:</p>
          <p className="text-sm">
            {error?.message || "An unknown error occurred"}
          </p>
        </div>
      )}

      {isSuccess && txHash && explorerUrl && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md">
          <h3 className="text-base font-medium mb-2">
            Combined Transaction Successful!
          </h3>
          <p className="text-sm mb-2">
            Successfully approved tokens and executed swap in a single
            transaction.
          </p>
          <a
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm block"
          >
            View on Basescan
          </a>
        </div>
      )}
    </div>
  );
}
