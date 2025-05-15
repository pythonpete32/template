"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Address } from "viem";
import {
  useEnsoBalances,
  type EnsoBalanceExtended,
} from "@/hooks/useEnsoBalances";

// Token type definition (similar to transfer page)
export interface Token {
  id: string;
  symbol: string;
  name: string;
  address: Address;
  icon: string;
  decimals: number;
  balance: string;
}

export interface TokenSelectionItem {
  token: Token;
  amount: string;
}

interface WalletTokenSelectionProps {
  title?: string;
  onTokenSelect?: (token: Token) => void;
  onTokenRemove?: () => void;
  onAmountChange?: (amount: string) => void;
  selectedToken?: Token | null;
  amount?: string;
  excludeTokensWithoutValue?: boolean;
  buttonText?: string;
  showAmountInput?: boolean;
  showRemoveButton?: boolean;
  className?: string;
}

// Helper to map Enso balance to Token interface
const mapBalanceToToken = (balance: EnsoBalanceExtended): Token => {
  let formattedAmount = "0";
  try {
    if (balance.amount && balance.decimals !== undefined) {
      const amount = BigInt(balance.amount);
      // Format the amount with the token's decimals
      formattedAmount = (Number(amount) / 10 ** balance.decimals).toString();
    }
  } catch (e) {
    console.error(`Error formatting amount for ${balance.token}:`, e);
  }

  return {
    id: balance.token,
    symbol: balance.symbol || "Unknown",
    name: balance.name || balance.symbol || "Unknown Token",
    address: balance.token as Address,
    icon: balance.logoUri || "/images/token-placeholder.png",
    decimals: balance.decimals || 18,
    balance: formattedAmount,
  };
};

export function WalletTokenSelection({
  title = "Token Selection",
  onTokenSelect,
  onTokenRemove,
  onAmountChange,
  selectedToken: externalSelectedToken = null,
  amount: externalAmount = "",
  excludeTokensWithoutValue = false,
  buttonText = "Add Token",
  showAmountInput = false,
  showRemoveButton = false,
  className = "",
}: WalletTokenSelectionProps) {
  // Use internal state if external state is not provided
  const [internalSelectedToken, setInternalSelectedToken] =
    useState<Token | null>(null);
  const [internalAmount, setInternalAmount] = useState<string>("");

  // Use either external state or internal state
  const selectedToken =
    externalSelectedToken !== null
      ? externalSelectedToken
      : internalSelectedToken;
  const amount = externalAmount !== "" ? externalAmount : internalAmount;

  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);

  // We need account info for the balances hook to work
  useAccount();

  const {
    balances,
    isLoading: isLoadingTokens,
    error: tokenLoadError,
  } = useEnsoBalances({
    excludeTokensWithoutValue,
  });

  const handleSelectToken = (token: Token) => {
    if (!externalSelectedToken) {
      setInternalSelectedToken(token);
    }
    setIsTokenDialogOpen(false);

    if (onTokenSelect) {
      onTokenSelect(token);
    }
  };

  const handleRemoveToken = () => {
    if (!externalSelectedToken) {
      setInternalSelectedToken(null);
    }

    if (onTokenRemove) {
      onTokenRemove();
    }
  };

  const handleAmountChange = (newAmount: string) => {
    if (!externalAmount) {
      setInternalAmount(newAmount);
    }

    if (onAmountChange) {
      onAmountChange(newAmount);
    }
  };

  const handleMaxAmount = () => {
    if (selectedToken) {
      const maxAmount = selectedToken.balance;
      if (!externalAmount) {
        setInternalAmount(maxAmount);
      }

      if (onAmountChange) {
        onAmountChange(maxAmount);
      }
    }
  };

  // Map balances to tokens
  const availableTokens = balances
    ? balances.map((balance) =>
        mapBalanceToToken(balance as EnsoBalanceExtended)
      )
    : [];

  return (
    <Card className={`p-6 border-2 border-primary/10 shadow-md ${className}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="gap-2"
                disabled={isLoadingTokens}
              >
                {isLoadingTokens ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    {buttonText}
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Select Token</DialogTitle>
              {isLoadingTokens ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading your tokens...</span>
                </div>
              ) : tokenLoadError ? (
                <div className="text-center text-red-500 p-4">
                  Error loading tokens: {tokenLoadError.message}
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {availableTokens.map((token) => (
                    <Button
                      key={token.id}
                      variant="neutral"
                      className="w-full justify-start gap-2"
                      onClick={() => handleSelectToken(token)}
                    >
                      <div className="h-5 w-5 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={token.icon}
                          alt={token.symbol}
                          width={20}
                          height={20}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="truncate max-w-[120px] text-left">
                        {token.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto truncate flex-shrink-0">
                        {token.balance}
                      </span>
                    </Button>
                  ))}
                  {availableTokens.length === 0 && (
                    <p className="text-center text-muted-foreground py-2">
                      No tokens found in your wallet
                    </p>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingTokens ? (
          <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p>Loading your tokens...</p>
            </div>
          </div>
        ) : !selectedToken ? (
          <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground">
            <p>Select a token from your wallet</p>
          </div>
        ) : (
          <div className="flex items-center p-4 border rounded-lg">
            <div className="flex-grow flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={selectedToken.icon}
                  alt={selectedToken.symbol}
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-shrink overflow-hidden">
                <div className="font-medium truncate max-w-[180px]">
                  {selectedToken.symbol}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                  Balance: {selectedToken.balance}
                </div>
              </div>
            </div>

            {showAmountInput && (
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <div className="relative">
                  <Input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={selectedToken.balance}
                    className="w-[100px]"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={handleMaxAmount}
                  className="flex-shrink-0"
                >
                  MAX
                </Button>
              </div>
            )}

            {showRemoveButton && (
              <Button
                type="button"
                size="sm"
                variant="neutral"
                onClick={handleRemoveToken}
                className="flex-shrink-0 h-8 w-8 p-0 ml-2"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
