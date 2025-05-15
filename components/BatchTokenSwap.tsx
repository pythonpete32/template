"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ArrowDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types for the component
interface Token {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  balance: string;
  decimals: number;
}

interface SwapConfig {
  id: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  estimatedToAmount: string;
  exchangeRate: string;
  slippageTolerance: number;
}

// Sample tokens data (would be fetched from blockchain in a real app)
const SAMPLE_TOKENS: Token[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    logo: "/ethereum.svg",
    balance: "1.5",
    decimals: 18,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    logo: "/usdc.svg",
    balance: "2500",
    decimals: 6,
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    logo: "/tether.svg",
    balance: "1800",
    decimals: 6,
  },
  {
    id: "dai",
    symbol: "DAI",
    name: "Dai",
    logo: "/dai.svg",
    balance: "2000",
    decimals: 18,
  },
  {
    id: "wbtc",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    logo: "/wbtc.svg",
    balance: "0.08",
    decimals: 8,
  },
];

export default function BatchTokenSwap() {
  // State
  const [fromToken, setFromToken] = useState<Token>(SAMPLE_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(SAMPLE_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [swapQueue, setSwapQueue] = useState<SwapConfig[]>([]);
  const [showTokenSelector, setShowTokenSelector] = useState<
    "from" | "to" | null
  >(null);
  const [currentSlippageTolerance, setCurrentSlippageTolerance] =
    useState<number>(0.5);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate estimated "to" amount (simplified for demo - would use actual blockchain data)
  const calculateToAmount = (amount: string): string => {
    if (!amount || Number.isNaN(Number.parseFloat(amount))) return "0";

    // Mock exchange rates (in real app, these would come from price oracles or liquidity pools)
    const rates: Record<string, Record<string, number>> = {
      eth: { usdc: 2000, usdt: 2000, dai: 2000, wbtc: 0.06 },
      usdc: { eth: 0.0005, usdt: 1, dai: 1, wbtc: 0.00003 },
      usdt: { eth: 0.0005, usdc: 1, dai: 1, wbtc: 0.00003 },
      dai: { eth: 0.0005, usdc: 1, usdt: 1, wbtc: 0.00003 },
      wbtc: { eth: 16.5, usdc: 33000, usdt: 33000, dai: 33000 },
    };

    const rate = rates[fromToken.id]?.[toToken.id] || 0;
    const result = Number.parseFloat(amount) * rate;

    // Format based on token decimals
    return result.toFixed(
      toToken.symbol === "ETH" || toToken.symbol === "DAI" ? 4 : 2
    );
  };

  // Calculate current exchange rate
  const getExchangeRate = (): string => {
    // Mock exchange rates
    const rates: Record<string, Record<string, number>> = {
      eth: { usdc: 2000, usdt: 2000, dai: 2000, wbtc: 0.06 },
      usdc: { eth: 0.0005, usdt: 1, dai: 1, wbtc: 0.00003 },
      usdt: { eth: 0.0005, usdc: 1, dai: 1, wbtc: 0.00003 },
      dai: { eth: 0.0005, usdc: 1, usdt: 1, wbtc: 0.00003 },
      wbtc: { eth: 16.5, usdc: 33000, usdt: 33000, dai: 33000 },
    };

    const rate = rates[fromToken.id]?.[toToken.id] || 0;
    return `1 ${fromToken.symbol} = ${rate.toFixed(toToken.symbol === "USDC" || toToken.symbol === "USDT" ? 2 : 6)} ${toToken.symbol}`;
  };

  // Add current swap config to queue
  const addToQueue = () => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setError("Please enter an amount");
      return;
    }

    if (Number.parseFloat(fromAmount) > Number.parseFloat(fromToken.balance)) {
      setError("Insufficient balance");
      return;
    }

    if (fromToken.id === toToken.id) {
      setError("Cannot swap same token");
      return;
    }

    setError(null);

    const newSwap: SwapConfig = {
      id: `${Date.now()}`,
      fromToken,
      toToken,
      fromAmount,
      estimatedToAmount: calculateToAmount(fromAmount),
      exchangeRate: getExchangeRate(),
      slippageTolerance: currentSlippageTolerance,
    };

    setSwapQueue([...swapQueue, newSwap]);
    setFromAmount(""); // Reset amount after adding
  };

  // Remove swap from queue
  const removeFromQueue = (id: string) => {
    setSwapQueue(swapQueue.filter((swap) => swap.id !== id));
  };

  // Execute all swaps in batch (would connect to blockchain in real app)
  const executeAllSwaps = () => {
    // In a real app, this would call blockchain methods to execute the batch swap
    console.log("Executing batch swap", swapQueue);
    alert(`Batch swap with ${swapQueue.length} swaps initiated!`);

    // Reset queue after execution
    setSwapQueue([]);
  };

  // Handle token selection
  const selectToken = (token: Token) => {
    if (showTokenSelector === "from") {
      // Don't allow selecting the same token for both sides
      if (token.id === toToken.id) {
        // Swap the tokens
        setFromToken(toToken);
        setToToken(fromToken);
      } else {
        setFromToken(token);
      }
    } else if (showTokenSelector === "to") {
      // Don't allow selecting the same token for both sides
      if (token.id === fromToken.id) {
        // Swap the tokens
        setFromToken(toToken);
        setToToken(fromToken);
      } else {
        setToToken(token);
      }
    }

    setShowTokenSelector(null);
  };

  // Swap the from and to tokens
  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount("");
  };

  // Handle "MAX" button
  const setMaxAmount = () => {
    setFromAmount(fromToken.balance);
  };

  // Clear error on mount
  useEffect(() => {
    setError(null);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Batch Token Swap</h2>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {/* Left Column - Swap Configuration */}
        <div className="md:col-span-3">
          {/* Swap Configuration Panel */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* From Token */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {fromToken.balance} {fromToken.symbol}
                    </p>
                  </div>

                  <div className="flex h-14 items-center gap-2 rounded-md border p-2">
                    <Button
                      variant="noShadow"
                      className="flex items-center gap-2 h-full"
                      onClick={() => setShowTokenSelector("from")}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        {fromToken.symbol.charAt(0)}
                      </div>
                      <span>{fromToken.symbol}</span>
                      <ChevronDown size={16} />
                    </Button>

                    <div className="flex-1 flex items-center">
                      <Input
                        className="border-0 h-full text-lg placeholder:text-muted-foreground"
                        placeholder="0.00"
                        value={fromAmount}
                        onChange={(e) => {
                          setFromAmount(e.target.value);
                          setError(null);
                        }}
                      />
                      <Button
                        variant="noShadow"
                        size="sm"
                        onClick={setMaxAmount}
                        className="h-8"
                      >
                        MAX
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Switch Button */}
                <div className="relative flex justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <Button
                    variant="reverse"
                    size="icon"
                    className="relative bg-background z-10 rounded-full"
                    onClick={switchTokens}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      To (estimated)
                    </p>
                  </div>

                  <div className="flex h-14 items-center gap-2 rounded-md border p-2">
                    <Button
                      variant="noShadow"
                      className="flex items-center gap-2 h-full"
                      onClick={() => setShowTokenSelector("to")}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        {toToken.symbol.charAt(0)}
                      </div>
                      <span>{toToken.symbol}</span>
                      <ChevronDown size={16} />
                    </Button>

                    <div className="flex-1">
                      <p className="text-lg">
                        {fromAmount ? calculateToAmount(fromAmount) : "0.00"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Display */}
                {fromAmount && Number.parseFloat(fromAmount) > 0 && (
                  <div className="space-y-2 pt-2 border-t text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate:</span>
                      <span>{getExchangeRate()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Slippage Tolerance:
                      </span>
                      <Button
                        variant="noShadow"
                        className="p-0 h-auto text-sm font-medium"
                        onClick={() => setShowSettings(!showSettings)}
                      >
                        {currentSlippageTolerance}%
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                  <div className="p-4 border rounded-md space-y-4">
                    <h3 className="font-medium text-sm">Slippage Tolerance</h3>
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant={
                          currentSlippageTolerance === 0.1
                            ? "default"
                            : "neutral"
                        }
                        size="sm"
                        onClick={() => setCurrentSlippageTolerance(0.1)}
                      >
                        0.1%
                      </Button>
                      <Button
                        variant={
                          currentSlippageTolerance === 0.5
                            ? "default"
                            : "neutral"
                        }
                        size="sm"
                        onClick={() => setCurrentSlippageTolerance(0.5)}
                      >
                        0.5%
                      </Button>
                      <Button
                        variant={
                          currentSlippageTolerance === 1.0
                            ? "default"
                            : "neutral"
                        }
                        size="sm"
                        onClick={() => setCurrentSlippageTolerance(1.0)}
                      >
                        1.0%
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          Custom: {currentSlippageTolerance}%
                        </span>
                      </div>
                      <Slider
                        value={[currentSlippageTolerance]}
                        min={0.1}
                        max={5}
                        step={0.1}
                        onValueChange={(value) =>
                          setCurrentSlippageTolerance(value[0])
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Add to Batch Button */}
                <Button
                  className="w-full"
                  onClick={addToQueue}
                  disabled={
                    !fromAmount ||
                    Number.parseFloat(fromAmount) <= 0 ||
                    error !== null
                  }
                >
                  Add to Batch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Batch Queue and Execution */}
        <div className="md:col-span-4">
          {swapQueue.length > 0 ? (
            <>
              {/* Batch items in ScrollArea without outer card */}
              <ScrollArea className="h-[300px] mb-6">
                <div className="space-y-2">
                  {swapQueue.map((swap) => (
                    <Card key={swap.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              {swap.fromToken.symbol.charAt(0)}
                            </div>
                            <span className="font-medium">
                              {swap.fromAmount}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {swap.fromToken.symbol}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              {swap.toToken.symbol.charAt(0)}
                            </div>
                            <span className="font-medium">
                              {swap.estimatedToAmount}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {swap.toToken.symbol}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="noShadow"
                          size="icon"
                          onClick={() => removeFromQueue(swap.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <div>Rate: {swap.exchangeRate}</div>
                        <div>Slippage: {swap.slippageTolerance}%</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Batch Execution Area */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Batch Summary</h3>
                      <Badge variant="neutral">{swapQueue.length} swaps</Badge>
                    </div>

                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Estimated Gas Savings:
                        </span>
                        <span>~{(swapQueue.length - 1) * 25}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Slippage Protection:
                        </span>
                        <span>{currentSlippageTolerance}%</span>
                      </div>
                    </div>

                    <Button className="w-full" onClick={executeAllSwaps}>
                      Execute All Swaps
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      All swaps will be executed in a single transaction
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-secondary-background/30 rounded-lg p-8 mt-6 md:mt-0">
              <div className="w-16 h-16 rounded-full bg-secondary-background flex items-center justify-center mb-4">
                <ArrowDown className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                Your batch is empty
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Configure a swap on the left and add it to your batch
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Token Selector Dialog - kept outside the grid */}
      <Dialog
        open={showTokenSelector !== null}
        onOpenChange={(open) => !open && setShowTokenSelector(null)}
      >
        <DialogContent className="max-w-xs sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <Input
              className="mb-4"
              placeholder="Search token name or address"
            />
            <div className="space-y-1">
              {SAMPLE_TOKENS.map((token) => (
                <Button
                  key={token.id}
                  variant="noShadow"
                  className="w-full justify-start h-14"
                  onClick={() => selectToken(token)}
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
                    <span className="font-medium">{token.balance}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
