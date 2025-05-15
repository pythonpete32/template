"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { encodeFunctionData, parseUnits } from "viem";
import { base } from "viem/chains";
import { Button } from "@/components/ui/button";
import { ContentArea } from "@/components/ContentArea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSignEIP7702Authorization } from "@/hooks/useSignEIP7702Authorization";
import { useRelayEIP7702Transaction } from "@/hooks/useRelayEIP7702Transaction";
import BatchExecutor from "@/contracts/BatchExecutor";
import USDT from "@/contracts/USDT";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useEnrichedTokenBalances } from "@/hooks/useEnrichedTokenBalances";
import type { EnrichedTokenBalance } from "@/hooks/useEnrichedTokenBalances";

// Token type definition
interface Token {
  id: string;
  symbol: string;
  name: string;
  address: `0x${string}`;
  icon: string;
  decimals: number;
  abi: typeof USDT.abi;
  balance: string;
}

// We'll use real token data from the useEnrichedTokenBalances hook

// Batch transfer item type
interface BatchTransferItem {
  token: Token;
  amount: string;
}

// Map from EnrichedTokenBalance to Token interface
const mapEnrichedBalanceToToken = (balance: EnrichedTokenBalance): Token => {
  console.log("Mapping balance:", balance);
  console.log("  - id:", balance.id);
  console.log("  - token:", balance.token);
  console.log("  - symbol:", balance.symbol);
  console.log("  - name:", balance.name);
  console.log("  - logoURI:", balance.logoURI);
  console.log("  - decimals:", balance.decimals);
  console.log("  - formattedAmount:", balance.formattedAmount);

  return {
    id: balance.id,
    symbol: balance.symbol,
    name: balance.name,
    address: balance.token as `0x${string}`,
    icon: balance.logoURI || "https://cryptologos.cc/logos/question-mark.png",
    decimals: balance.decimals || 18,
    abi: USDT.abi, // Using USDT ABI as default since ERC20 standard is the same
    balance: balance.formattedAmount,
  };
};

export default function TestingPage() {
  const { address: eoa } = useAccount();
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [batchItems, setBatchItems] = useState<BatchTransferItem[]>([]);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);

  const {
    enrichedBalances,
    isLoading: isLoadingTokens,
    error: tokenLoadError,
  } = useEnrichedTokenBalances();

  // Update available tokens when enriched balances load
  useEffect(() => {
    console.log("Effect running, enrichedBalances:", enrichedBalances);
    if (enrichedBalances) {
      console.log("Raw enrichedBalances data:", enrichedBalances);
      try {
        const tokens = enrichedBalances.map((balance) => {
          console.log("Processing balance item:", balance);
          return mapEnrichedBalanceToToken(balance);
        });
        console.log("Mapped tokens:", tokens);
        setAvailableTokens(tokens);
      } catch (error) {
        console.error("Error mapping enriched balances:", error);
      }
    }
  }, [enrichedBalances]);

  const {
    signAuthorization,
    signedAuthorization,
    isSigning,
    signingError,
    isSigningError,
  } = useSignEIP7702Authorization({ contractAddress: BatchExecutor.address });

  const {
    relayTransaction,
    relayedTxData,
    isRelaying,
    relayingError,
    isRelayingError,
    resetRelaying,
  } = useRelayEIP7702Transaction();

  const handleSignAuthorizationClick = () => {
    resetRelaying();
    signAuthorization();
  };

  const handleAddToken = (token: Token) => {
    // Check if token already exists in the list
    if (batchItems.some((item) => item.token.id === token.id)) {
      return;
    }

    setBatchItems((prev) => [
      ...prev,
      {
        token,
        amount: "",
      },
    ]);
    setIsTokenDialogOpen(false);
  };

  const handleRemoveToken = (index: number) => {
    setBatchItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAmountChange = (index: number, amount: string) => {
    setBatchItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, amount } : item))
    );
  };

  const handleMaxAmount = (index: number) => {
    const token = batchItems[index].token;
    handleAmountChange(index, token.balance);
  };

  const handleRelayTransactionClick = () => {
    if (!recipientAddress) {
      alert("Please enter a recipient address");
      return;
    }

    const validItems = batchItems.filter((item) => item.amount);

    if (validItems.length === 0) {
      alert("Please add at least one token and enter an amount");
      return;
    }

    const targets: `0x${string}`[] = [];
    const encodedCalls: `0x${string}`[] = [];

    for (const item of validItems) {
      const parsedAmount = parseUnits(item.amount, item.token.decimals);
      const encodedTransfer = encodeFunctionData({
        abi: item.token.abi,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, parsedAmount],
      });

      targets.push(item.token.address);
      encodedCalls.push(encodedTransfer);
    }

    relayTransaction({
      authorization: signedAuthorization,
      abi: BatchExecutor.abi,
      functionName: "executeBatch",
      args: [targets, encodedCalls],
    });
  };

  const explorerUrl = base.blockExplorers?.default.url;
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const anyValid = batchItems.some((item) => item.amount);
  const availableTokensToAdd = availableTokens.filter(
    (token) => !batchItems.some((item) => item.token.id === token.id)
  );

  return (
    <ContentArea>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Batch Token Transfer</h1>
        <p className="text-muted-foreground">
          Transfer multiple tokens in a single transaction using EIP-7702
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left side: Token selection and input */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Transfer Configuration
            </h2>

            <div className="mb-6">
              <Label htmlFor="recipient" className="block mb-2">
                Recipient Address
              </Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Token Selection</h3>
                <Dialog
                  open={isTokenDialogOpen}
                  onOpenChange={setIsTokenDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2"
                      disabled={
                        availableTokensToAdd.length === 0 || isLoadingTokens
                      }
                    >
                      {isLoadingTokens ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading Tokens...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="h-4 w-4" />
                          Add Token
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
                        {availableTokensToAdd.map((token) => (
                          <Button
                            key={token.id}
                            variant="neutral"
                            className="w-full justify-start gap-2"
                            onClick={() => handleAddToken(token)}
                          >
                            <div className="h-5 w-5 rounded-full overflow-hidden">
                              <img
                                src={token.icon}
                                alt={token.symbol}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <span>{token.symbol}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {token.balance}
                            </span>
                          </Button>
                        ))}
                        {availableTokensToAdd.length === 0 && (
                          <p className="text-center text-muted-foreground py-2">
                            {availableTokens.length === 0
                              ? "No tokens found in your wallet"
                              : "All tokens have been added"}
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
              ) : batchItems.length === 0 ? (
                <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground">
                  <p>Click Add Token to select tokens for batch transfer</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-4">
                    {batchItems.map((item, index) => (
                      <div
                        key={`${item.token.id}-${index}`}
                        className="flex items-center p-4 border rounded-lg"
                      >
                        <div className="flex-grow flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={item.token.icon}
                              alt={item.token.symbol}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {item.token.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Balance: {item.token.balance}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <div className="relative">
                            <Input
                              type="text"
                              value={item.amount}
                              onChange={(e) =>
                                handleAmountChange(index, e.target.value)
                              }
                              placeholder={item.token.balance}
                              className="w-[100px]"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => handleMaxAmount(index)}
                            className="flex-shrink-0"
                          >
                            MAX
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="neutral"
                            onClick={() => handleRemoveToken(index)}
                            className="flex-shrink-0 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </Card>
        </div>

        {/* Right side: Batch execution */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Batch Execution</h2>
            <div className="space-y-3">
              <Button
                onClick={handleSignAuthorizationClick}
                disabled={
                  isSigning ||
                  isRelaying ||
                  !eoa ||
                  !walletClient ||
                  !publicClient
                }
                className="w-full"
              >
                {isSigning ? "Signing..." : "1. Sign Authorization"}
              </Button>

              <Button
                onClick={handleRelayTransactionClick}
                disabled={
                  isRelaying ||
                  isSigning ||
                  !signedAuthorization ||
                  !anyValid ||
                  !recipientAddress ||
                  batchItems.length === 0
                }
                variant="neutral"
                className="w-full"
              >
                {isRelaying ? "Relaying..." : "2. Execute Batch Transfer"}
              </Button>
            </div>

            {isSigningError && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
                Signing Error:{" "}
                {signingError?.message || "An unknown error occurred"}
              </div>
            )}

            {isRelayingError && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
                Relay Error:{" "}
                {relayingError?.message || "An unknown error occurred"}
              </div>
            )}

            {relayedTxData?.txHash && explorerUrl && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md">
                <h3 className="text-base font-medium mb-2">
                  Transaction Successful!
                </h3>
                <a
                  href={`${explorerUrl}/tx/${relayedTxData.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
                >
                  View on Basescan
                </a>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ContentArea>
  );
}
