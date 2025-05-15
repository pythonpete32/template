"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Types
interface Token {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  balance: string;
  usdPrice: number;
  usdValue: number;
  decimals: number;
}

interface SweepState {
  targetToken: Token | null;
  selectedTokens: Record<string, boolean>;
  totalInputValue: number;
  estimatedOutput: string;
}

// Sample tokens data (would be fetched from blockchain in a real app)
const SAMPLE_TOKENS: Token[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    logo: "/ethereum.svg",
    balance: "1.5",
    usdPrice: 3000,
    usdValue: 4500,
    decimals: 18,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    logo: "/usdc.svg",
    balance: "2500",
    usdPrice: 1,
    usdValue: 2500,
    decimals: 6,
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    logo: "/tether.svg",
    balance: "1800",
    usdPrice: 1,
    usdValue: 1800,
    decimals: 6,
  },
  {
    id: "dai",
    symbol: "DAI",
    name: "Dai",
    logo: "/dai.svg",
    balance: "2000",
    usdPrice: 1,
    usdValue: 2000,
    decimals: 18,
  },
  {
    id: "wbtc",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    logo: "/wbtc.svg",
    balance: "0.08",
    usdPrice: 62000,
    usdValue: 4960,
    decimals: 8,
  },
  {
    id: "link",
    symbol: "LINK",
    name: "Chainlink",
    logo: "/link.svg",
    balance: "150",
    usdPrice: 14.5,
    usdValue: 2175,
    decimals: 18,
  },
  {
    id: "uni",
    symbol: "UNI",
    name: "Uniswap",
    logo: "/uni.svg",
    balance: "100",
    usdPrice: 8.2,
    usdValue: 820,
    decimals: 18,
  },
  {
    id: "aave",
    symbol: "AAVE",
    name: "Aave",
    logo: "/aave.svg",
    balance: "20",
    usdPrice: 102,
    usdValue: 2040,
    decimals: 18,
  },
];

// Token Item Component
const TokenItem = ({
  token,
  selected,
  disabled,
  onChange,
}: {
  token: Token;
  selected: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) {
        onChange(!selected);
      }
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between p-3 border rounded-md mb-2 
        ${disabled ? "opacity-60" : "hover:bg-secondary-background cursor-pointer"}
        ${selected ? "bg-secondary-background border-main" : ""}
      `}
      onClick={() => !disabled && onChange(!selected)}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={`${token.name} (${token.balance} ${token.symbol})`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {token.symbol.charAt(0)}
          </div>
          {selected && (
            <div className="absolute -top-1 -right-1 bg-main text-white rounded-full w-5 h-5 flex items-center justify-center">
              <Check size={12} />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">{token.symbol}</p>
          <p className="text-sm text-muted-foreground">{token.name}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-medium">{token.balance}</p>
        <p className="text-sm text-muted-foreground">
          ${token.usdValue.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// TokenList Component
const TokenList = ({
  tokens,
  selectedTokens,
  targetToken,
  onChange,
}: {
  tokens: Token[];
  selectedTokens: Record<string, boolean>;
  targetToken: Token | null;
  onChange: (tokenId: string, selected: boolean) => void;
}) => {
  return (
    <div className="mt-4">
      <ScrollArea className="h-[400px] pr-2">
        {tokens.map((token) => (
          <TokenItem
            key={token.id}
            token={token}
            selected={!!selectedTokens[token.id]}
            disabled={targetToken?.id === token.id}
            onChange={(selected) => onChange(token.id, selected)}
          />
        ))}
      </ScrollArea>
    </div>
  );
};

// Target Selector Component
const TargetSelector = ({
  tokens,
  selectedToken,
  onChange,
}: {
  tokens: Token[];
  selectedToken: Token | null;
  onChange: (token: Token) => void;
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const selectId = "target-token-selector";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setShowDialog(true);
    }
  };

  return (
    <>
      <div className="mb-6">
        <label htmlFor={selectId} className="block text-sm font-medium mb-2">
          Sweep into
        </label>
        <button
          id={selectId}
          type="button"
          className="w-full text-left flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-secondary-background"
          onClick={() => setShowDialog(true)}
          onKeyDown={handleKeyDown}
        >
          {selectedToken ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {selectedToken.symbol.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{selectedToken.symbol}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedToken.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-medium">${selectedToken.usdPrice}</p>
                  <p className="text-sm text-muted-foreground">per token</p>
                </div>
                <ChevronDown size={16} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span>Select a token</span>
              <ChevronDown size={16} />
            </div>
          )}
        </button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xs sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Select target token</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <Input
              className="mb-4"
              placeholder="Search token name or address"
            />
            <div className="space-y-1">
              {tokens.map((token) => (
                <Button
                  key={token.id}
                  variant="noShadow"
                  className="w-full justify-start h-14"
                  onClick={() => {
                    onChange(token);
                    setShowDialog(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {token.symbol.charAt(0)}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {token.name}
                      </span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="font-medium">${token.usdPrice}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// SweepButton Component
const SweepButton = ({
  selectedCount,
  hasTarget,
  totalValue,
  onClick,
  loading,
}: {
  selectedCount: number;
  hasTarget: boolean;
  totalValue: number;
  onClick: () => void;
  loading: boolean;
}) => {
  const disabled = selectedCount === 0 || !hasTarget || loading;

  return (
    <Button className="w-full mt-4" disabled={disabled} onClick={onClick}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Sweep
        </>
      ) : (
        `Sweep ${selectedCount} Token${selectedCount !== 1 ? "s" : ""} ($${totalValue.toLocaleString()})`
      )}
    </Button>
  );
};

// Main TokenSweeper Component
export default function TokenSweeper() {
  // States
  const [loading, setLoading] = useState(true);
  const [sweepLoading, setSweepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [sweepState, setSweepState] = useState<SweepState>({
    targetToken: null,
    selectedTokens: {},
    totalInputValue: 0,
    estimatedOutput: "0",
  });

  // Load tokens (simulated)
  useEffect(() => {
    const loadTokens = async () => {
      try {
        // In a real app, this would be an API call to fetch user's token balances
        // For this demo, we'll use the sample data with a delay to simulate loading
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTokens(SAMPLE_TOKENS);
        setLoading(false);
      } catch (err) {
        setError("Failed to load token balances. Please try again.");
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  // Handle token selection
  const handleTokenSelection = (tokenId: string, selected: boolean) => {
    const newSelectedTokens = {
      ...sweepState.selectedTokens,
      [tokenId]: selected,
    };

    if (!selected) {
      delete newSelectedTokens[tokenId];
    }

    // Calculate total value of selected tokens
    const totalValue = tokens
      .filter((token) => newSelectedTokens[token.id])
      .reduce((sum, token) => sum + token.usdValue, 0);

    // Estimate output amount based on USD value
    let estimatedOutput = "0";
    if (sweepState.targetToken && totalValue > 0) {
      estimatedOutput = (totalValue / sweepState.targetToken.usdPrice).toFixed(
        sweepState.targetToken.decimals === 18 ? 4 : 2
      );
    }

    setSweepState({
      ...sweepState,
      selectedTokens: newSelectedTokens,
      totalInputValue: totalValue,
      estimatedOutput,
    });
  };

  // Handle target token selection
  const handleTargetTokenChange = (token: Token) => {
    // If the target token is already selected as an input, deselect it
    const newSelectedTokens = { ...sweepState.selectedTokens };
    if (newSelectedTokens[token.id]) {
      delete newSelectedTokens[token.id];
    }

    // Calculate total value of selected tokens
    const totalValue = tokens
      .filter((t) => newSelectedTokens[t.id])
      .reduce((sum, t) => sum + t.usdValue, 0);

    // Estimate output amount
    const estimatedOutput =
      totalValue > 0
        ? (totalValue / token.usdPrice).toFixed(token.decimals === 18 ? 4 : 2)
        : "0";

    setSweepState({
      targetToken: token,
      selectedTokens: newSelectedTokens,
      totalInputValue: totalValue,
      estimatedOutput,
    });
  };

  // Execute the sweep
  const executeSweep = async () => {
    if (!sweepState.targetToken) return;

    try {
      setSweepLoading(true);

      // In a real app, this would call blockchain methods to execute the batch swap
      console.log("Executing sweep:", {
        targetToken: sweepState.targetToken,
        selectedTokens: tokens.filter(
          (token) => sweepState.selectedTokens[token.id]
        ),
        totalValue: sweepState.totalInputValue,
        estimatedOutput: sweepState.estimatedOutput,
      });

      // Simulate transaction processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear selections after successful sweep
      setSweepState({
        ...sweepState,
        selectedTokens: {},
        totalInputValue: 0,
        estimatedOutput: "0",
      });

      alert(`Successfully swept tokens into ${sweepState.targetToken.symbol}!`);
      setSweepLoading(false);
    } catch (err) {
      setError("Failed to execute sweep. Please try again.");
      setSweepLoading(false);
    }
  };

  // Selected tokens count
  const selectedCount = Object.values(sweepState.selectedTokens).filter(
    Boolean
  ).length;

  // Render loading state
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg font-medium">Loading your tokens...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          className="mt-4 w-full"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Render empty state
  if (tokens.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-4 text-center">
        <div className="py-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-secondary-background flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No tokens found</h3>
          <p className="text-muted-foreground mb-6">
            Your wallet doesn't have any tokens to display
          </p>
          <Button>Connect another wallet</Button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Token Sweeper</h2>
        <p className="text-muted-foreground">
          Select tokens to sweep into a single asset
        </p>
      </div>

      {/* Target Token Selector */}
      <TargetSelector
        tokens={tokens}
        selectedToken={sweepState.targetToken}
        onChange={handleTargetTokenChange}
      />

      {/* Selection Counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Select Tokens</h3>
          {selectedCount > 0 && (
            <Badge variant="neutral">{selectedCount} selected</Badge>
          )}
        </div>
        {selectedCount > 0 && (
          <Button
            variant="noShadow"
            size="sm"
            onClick={() =>
              setSweepState({
                ...sweepState,
                selectedTokens: {},
                totalInputValue: 0,
                estimatedOutput: "0",
              })
            }
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Token List */}
      <TokenList
        tokens={tokens}
        selectedTokens={sweepState.selectedTokens}
        targetToken={sweepState.targetToken}
        onChange={handleTokenSelection}
      />

      {/* Sweep Preview */}
      {selectedCount > 0 && sweepState.targetToken && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Sweep Preview</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Input Value:</span>
                <span>${sweepState.totalInputValue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Output:</span>
                <span>
                  {sweepState.estimatedOutput} {sweepState.targetToken.symbol}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Expected Price Impact:
                </span>
                <span className="text-green-600">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sweep Button */}
      <SweepButton
        selectedCount={selectedCount}
        hasTarget={!!sweepState.targetToken}
        totalValue={sweepState.totalInputValue}
        onClick={executeSweep}
        loading={sweepLoading}
      />
    </div>
  );
}
