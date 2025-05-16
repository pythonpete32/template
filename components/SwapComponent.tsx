"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowDown, RefreshCw } from "lucide-react";
import { parseUnits } from "viem";
import type { Address } from "viem";
import { useEnsoRouter } from "@/hooks/useEnsoRouter";
import { useEIP7702Transaction } from "@/hooks/useEIP7702Transaction";
import { WalletTokenSelection, type Token } from "./WalletTokenSelection";
import { base } from "viem/chains";
import type { RouteData } from "@ensofinance/sdk";

interface SwapComponentProps {
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

export function SwapComponent({ onRouteData }: SwapComponentProps) {
  const { address } = useAccount();
  const [inputToken, setInputToken] = useState<Token | null>(null);
  const [outputToken, setOutputToken] = useState<Token | null>(null);
  const [inputAmount, setInputAmount] = useState<string>("1");
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

  // Get route data from Enso
  const { routeData, isLoading: isLoadingRoute } = useEnsoRouter({
    fromAddress: address as Address,
    receiver: address as Address,
    amountIn: getScaledAmount(),
    tokenIn: inputToken?.address as Address,
    tokenOut: outputToken?.address as Address,
    enabled: isRouteRequested && !!address && !!inputToken && !!outputToken,
  });

  // When route data changes, call the callback
  useEffect(() => {
    if (routeData && onRouteData) {
      onRouteData(routeData);
    }
  }, [routeData, onRouteData]);

  const handleInputTokenSelect = (token: Token) => {
    setInputToken(token);
    setIsRouteRequested(false); // Reset route when token changes
  };

  const handleOutputTokenSelect = (token: Token) => {
    setOutputToken(token);
    setIsRouteRequested(false); // Reset route when token changes
  };

  const handleInputAmountChange = (newAmount: string) => {
    setInputAmount(newAmount);
    setIsRouteRequested(false); // Reset route when amount changes
  };

  const handleGetRoute = () => {
    setIsRouteRequested(true);
  };

  const handleExecuteSwap = () => {
    if (!routeData || !routeData.tx) return;

    // Use the transaction data from the route
    // Using the BatchExecutor contract's executeBatch function
    execute([
      [routeData.tx.to], // targets array
      [routeData.tx.data], // data array
    ]);
  };

  // Helpers for display
  const explorerUrl = base.blockExplorers?.default.url;
  const getOutputAmount = () => {
    if (!routeData) return "0";
    return routeData.amountOut.toString();
  };

  const getPriceImpact = () => {
    if (!routeData || routeData.priceImpact === null) return "Unknown";
    return `${(routeData.priceImpact * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
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

      {/* Get Route Button */}
      {inputToken && outputToken && (
        <Button
          className="w-full"
          onClick={handleGetRoute}
          disabled={
            isLoadingRoute ||
            !address ||
            !inputToken ||
            !outputToken ||
            !inputAmount
          }
        >
          {isLoadingRoute ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            "Get Swap Route"
          )}
        </Button>
      )}

      {/* Route Information */}
      {routeData && (
        <Card className="p-6 border-2 border-primary/10 shadow-md">
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output Amount:</span>
                <span>{getOutputAmount()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact:</span>
                <span>{getPriceImpact()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Estimate:</span>
                <span>{routeData.gas}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleExecuteSwap}
              disabled={isLoading || !address}
            >
              {isSigning
                ? "Signing..."
                : isRelaying || isTxPending
                  ? "Processing..."
                  : "Swap Tokens"}
            </Button>

            {isError && (
              <div className="mt-2 p-3 bg-destructive/10 text-destructive rounded-md">
                <p className="text-sm">
                  {error?.message || "An unknown error occurred"}
                </p>
              </div>
            )}

            {isSuccess && txHash && explorerUrl && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md">
                <h3 className="text-base font-medium mb-2">Swap Successful!</h3>
                <a
                  href={`${explorerUrl}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View on Basescan
                </a>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
