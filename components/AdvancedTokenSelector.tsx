"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Loader2, Trash2, Wallet, Globe } from "lucide-react";
import Image from "next/image";
import type { Address } from "viem";
import {
  useEnsoBalances,
  type EnsoBalanceExtended,
} from "@/hooks/useEnsoBalances";
import { useEnsoTokens } from "@/hooks/useEnsoTokens";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TokenData } from "@ensofinance/sdk";

// Unified Token type that works with both wallet tokens and Enso TokenData
export interface Token {
  id: string;
  symbol: string;
  name: string;
  address: Address;
  icon: string;
  decimals: number;
  balance?: string;
  logosUri?: string[];
}

interface AdvancedTokenSelectorProps {
  title?: string;
  onTokenSelect?: (token: Token) => void;
  onTokenRemove?: () => void;
  onAmountChange?: (amount: string) => void;
  selectedToken?: Token | null;
  amount?: string;
  buttonText?: string;
  showAmountInput?: boolean;
  showRemoveButton?: boolean;
  className?: string;
  walletOnly?: boolean; // If true, only wallet tokens are available
  allTokensOnly?: boolean; // If true, only all tokens are available
  defaultTab?: "wallet" | "all";
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

// Helper to map TokenData to our unified Token interface
const mapTokenDataToToken = (tokenData: TokenData): Token => {
  return {
    id: tokenData.address,
    symbol: tokenData.symbol || "Unknown",
    name: tokenData.name || "Unknown Token",
    address: tokenData.address as Address,
    icon: tokenData.logosUri?.[0] || "/images/token-placeholder.png",
    decimals: tokenData.decimals || 18,
    balance: "", // Add an empty string for balance to satisfy the Token interface
    logosUri: tokenData.logosUri,
  };
};

export function AdvancedTokenSelector({
  title = "Token Selection",
  onTokenSelect,
  onTokenRemove,
  onAmountChange,
  selectedToken: externalSelectedToken = null,
  amount: externalAmount = "",
  buttonText = "Select Token",
  showAmountInput = false,
  showRemoveButton = false,
  className = "",
  walletOnly = false,
  allTokensOnly = false,
  defaultTab = "wallet",
}: AdvancedTokenSelectorProps) {
  // Use internal state if external state is not provided
  const [internalSelectedToken, setInternalSelectedToken] =
    useState<Token | null>(null);
  const [internalAmount, setInternalAmount] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"wallet" | "all">(
    allTokensOnly ? "all" : walletOnly ? "wallet" : defaultTab
  );

  // Use either external state or internal state
  const selectedToken =
    externalSelectedToken !== null
      ? externalSelectedToken
      : internalSelectedToken;
  const amount = externalAmount !== "" ? externalAmount : internalAmount;

  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);

  // Fetch wallet tokens
  const {
    balances,
    isLoading: isLoadingWalletTokens,
    error: walletTokensError,
  } = useEnsoBalances({});

  // Fetch all tokens from Enso
  const {
    tokens: allTokens,
    isLoading: isLoadingAllTokens,
    error: allTokensError,
  } = useEnsoTokens({
    enabled: !walletOnly,
    includeMetadata: true,
  });

  const handleSelectToken = (token: Token) => {
    if (!externalSelectedToken) {
      setInternalSelectedToken(token);
    }
    setIsTokenDialogOpen(false);
    setSearchTerm("");

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
    if (selectedToken && selectedToken.balance) {
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
  const walletTokens = balances
    ? balances.map((balance) =>
        mapBalanceToToken(balance as EnsoBalanceExtended)
      )
    : [];

  // Filter tokens based on search term
  const filteredWalletTokens = walletTokens?.filter((token) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (token.name ? token.name.toLowerCase().includes(term) : false) ||
      (token.symbol ? token.symbol.toLowerCase().includes(term) : false) ||
      token.address.toLowerCase().includes(term)
    );
  });

  const filteredAllTokens = allTokens?.filter((token) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (token.name ? token.name.toLowerCase().includes(term) : false) ||
      (token.symbol ? token.symbol.toLowerCase().includes(term) : false) ||
      token.address.toLowerCase().includes(term)
    );
  });

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
                disabled={isLoadingWalletTokens && isLoadingAllTokens}
              >
                {isLoadingWalletTokens && isLoadingAllTokens ? (
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogTitle>Select Token</DialogTitle>
              <DialogDescription>
                Choose from your wallet tokens or browse all available tokens
              </DialogDescription>

              {/* Search bar */}
              <div className="relative my-2">
                <Input
                  placeholder="Search by name or address"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Tab navigation */}
              {!walletOnly && !allTokensOnly && (
                <Tabs
                  value={activeTab}
                  onValueChange={(val) => setActiveTab(val as "wallet" | "all")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="wallet"
                      className="flex items-center gap-1"
                    >
                      <Wallet className="h-3 w-3" />
                      My Wallet
                    </TabsTrigger>
                    <TabsTrigger
                      value="all"
                      className="flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      All Tokens
                    </TabsTrigger>
                  </TabsList>

                  {/* Wallet tokens tab */}
                  <TabsContent value="wallet">
                    {isLoadingWalletTokens ? (
                      <div className="flex items-center justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading your tokens...</span>
                      </div>
                    ) : walletTokensError ? (
                      <div className="text-center text-red-500 p-4">
                        Error loading tokens: {walletTokensError.message}
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-1 py-2">
                          {filteredWalletTokens.length > 0 ? (
                            filteredWalletTokens.map((token) => (
                              <Button
                                key={token.id}
                                variant="neutral"
                                className="w-full justify-start gap-3"
                                onClick={() => handleSelectToken(token)}
                              >
                                <div className="h-6 w-6 relative rounded-full overflow-hidden flex-shrink-0">
                                  <Image
                                    src={token.icon}
                                    alt={token.symbol}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                  />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">
                                      {token.symbol}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {token.balance}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {token.name}
                                  </div>
                                </div>
                              </Button>
                            ))
                          ) : (
                            <div className="text-center text-muted-foreground py-8">
                              No matching tokens in your wallet
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  {/* All tokens tab */}
                  <TabsContent value="all">
                    {isLoadingAllTokens ? (
                      <div className="flex items-center justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading tokens...</span>
                      </div>
                    ) : allTokensError ? (
                      <div className="text-center text-red-500 p-4">
                        Error loading tokens: {allTokensError.message}
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-1 py-2">
                          {filteredAllTokens && filteredAllTokens.length > 0 ? (
                            filteredAllTokens.map((token) => (
                              <Button
                                key={`${token.chainId}-${token.address}`}
                                variant="neutral"
                                className="w-full justify-start gap-3"
                                onClick={() =>
                                  handleSelectToken(mapTokenDataToToken(token))
                                }
                              >
                                <div className="h-6 w-6 relative rounded-full overflow-hidden flex-shrink-0 bg-background">
                                  {token.logosUri &&
                                  token.logosUri.length > 0 ? (
                                    <Image
                                      src={token.logosUri[0]}
                                      alt={token.symbol || "token"}
                                      width={24}
                                      height={24}
                                      className="object-contain"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-muted flex items-center justify-center text-xs">
                                      {token.symbol?.charAt(0) || "?"}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="font-medium">
                                    {token.symbol || "Unknown"}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {token.name || token.address}
                                  </div>
                                </div>
                                {token.type === "defi" && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    DeFi
                                  </span>
                                )}
                              </Button>
                            ))
                          ) : (
                            <div className="text-center text-muted-foreground py-8">
                              No matching tokens found
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              )}

              {/* If only wallet tokens should be shown */}
              {walletOnly && (
                <div className="mt-2">
                  {isLoadingWalletTokens ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading your tokens...</span>
                    </div>
                  ) : walletTokensError ? (
                    <div className="text-center text-red-500 p-4">
                      Error loading tokens: {walletTokensError.message}
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-1 py-2">
                        {filteredWalletTokens.length > 0 ? (
                          filteredWalletTokens.map((token) => (
                            <Button
                              key={token.id}
                              variant="neutral"
                              className="w-full justify-start gap-3"
                              onClick={() => handleSelectToken(token)}
                            >
                              <div className="h-6 w-6 relative rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={token.icon}
                                  alt={token.symbol}
                                  width={24}
                                  height={24}
                                  className="object-contain"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">
                                    {token.symbol}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {token.balance}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {token.name}
                                </div>
                              </div>
                            </Button>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No matching tokens in your wallet
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}

              {/* If only all tokens should be shown */}
              {allTokensOnly && (
                <div className="mt-2">
                  {isLoadingAllTokens ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading tokens...</span>
                    </div>
                  ) : allTokensError ? (
                    <div className="text-center text-red-500 p-4">
                      Error loading tokens: {allTokensError.message}
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-1 py-2">
                        {filteredAllTokens && filteredAllTokens.length > 0 ? (
                          filteredAllTokens.map((token) => (
                            <Button
                              key={`${token.chainId}-${token.address}`}
                              variant="neutral"
                              className="w-full justify-start gap-3"
                              onClick={() =>
                                handleSelectToken(mapTokenDataToToken(token))
                              }
                            >
                              <div className="h-6 w-6 relative rounded-full overflow-hidden flex-shrink-0 bg-background">
                                {token.logosUri && token.logosUri.length > 0 ? (
                                  <Image
                                    src={token.logosUri[0]}
                                    alt={token.symbol || "token"}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-muted flex items-center justify-center text-xs">
                                    {token.symbol?.charAt(0) || "?"}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium">
                                  {token.symbol || "Unknown"}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {token.name || token.address}
                                </div>
                              </div>
                              {token.type === "defi" && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  DeFi
                                </span>
                              )}
                            </Button>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No matching tokens found
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Selected token display */}
        {!selectedToken ? (
          <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground">
            <p>No token selected</p>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 relative rounded-full overflow-hidden">
                  <Image
                    src={selectedToken.icon}
                    alt={selectedToken.symbol}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="font-medium">{selectedToken.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedToken.name}
                  </div>
                </div>
              </div>

              {showRemoveButton && (
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={handleRemoveToken}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove token</span>
                </Button>
              )}
            </div>

            {showAmountInput && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pr-16"
                    />
                    {selectedToken?.balance && (
                      <Button
                        variant="neutral"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 text-xs"
                        onClick={handleMaxAmount}
                      >
                        MAX
                      </Button>
                    )}
                  </div>
                </div>
                {selectedToken?.balance && (
                  <div className="text-xs text-right mt-1 text-muted-foreground">
                    Balance: {selectedToken.balance} {selectedToken.symbol}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
