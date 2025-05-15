"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { Address } from "viem";
import { parseUnits } from "viem";
import { useEnsoApproval } from "@/hooks/useEnsoApproval";
import { WalletTokenSelection, type Token } from "./WalletTokenSelection";

interface TokenApprovalProps {
  title?: string;
  onApprovalData?: (data: unknown) => void;
  excludeTokensWithoutValue?: boolean;
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

export function TokenApproval({
  title = "Token Approval",
  onApprovalData,
  excludeTokensWithoutValue = false,
}: TokenApprovalProps) {
  const { address } = useAccount();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>("1"); // Default to 1 token (unscaled)
  const [isApprovalRequested, setIsApprovalRequested] = useState(false);

  // Scale the amount by token decimals
  const getScaledAmount = (): string => {
    if (!selectedToken || !amount) return "0";
    return scaleAmount(amount, selectedToken.decimals || 18);
  };

  const {
    approvalData,
    isLoading: isLoadingApproval,
    error: approvalError,
  } = useEnsoApproval({
    fromAddress: address as Address,
    tokenAddress: selectedToken?.address as Address,
    amount: getScaledAmount(), // Pass the scaled amount to the hook
    enabled: isApprovalRequested && !!address && !!selectedToken,
  });

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setIsApprovalRequested(false); // Reset approval when token changes
  };

  const handleTokenRemove = () => {
    setSelectedToken(null);
    setIsApprovalRequested(false);
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    setIsApprovalRequested(false); // Reset approval when amount changes
  };

  const handleRequestApproval = () => {
    setIsApprovalRequested(true);
  };

  // When approvalData changes, call the callback
  if (approvalData && onApprovalData) {
    onApprovalData(approvalData);
  }

  return (
    <div className="space-y-4">
      <WalletTokenSelection
        title={title}
        selectedToken={selectedToken}
        onTokenSelect={handleTokenSelect}
        onTokenRemove={handleTokenRemove}
        amount={amount}
        onAmountChange={handleAmountChange}
        excludeTokensWithoutValue={excludeTokensWithoutValue}
        showAmountInput={!!selectedToken}
        showRemoveButton={!!selectedToken}
      />

      {selectedToken && (
        <Card className="p-6 border-2 border-primary/10 shadow-md">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              <p>
                Amount: {amount} {selectedToken.symbol}
              </p>
              <p>Scaled amount: {getScaledAmount()}</p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleRequestApproval}
              disabled={!address || !selectedToken || isLoadingApproval}
            >
              {isLoadingApproval ? (
                <span className="animate-spin mr-2">⟳</span>
              ) : approvalData ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approval Data Ready
                </>
              ) : (
                "Get Approval Data"
              )}
            </Button>

            {approvalError && (
              <div className="mt-2 p-3 bg-destructive/10 text-destructive rounded-md">
                <p className="text-sm">{approvalError.message}</p>
              </div>
            )}

            {approvalData && (
              <div className="mt-4">
                <div className="text-xs font-mono bg-background p-2 rounded overflow-auto max-h-60">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(approvalData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
