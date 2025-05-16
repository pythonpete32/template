"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { ContentArea } from "@/components/ContentArea";
import { Card } from "@/components/ui/card";
import { Beaker, Wallet } from "lucide-react";
import Image from "next/image";
import { TokenApproval } from "@/components/TokenApproval";
import { SwapComponent } from "@/components/SwapComponent";
import { CombinedFlow } from "@/components/CombinedFlow";
import { TokenList } from "@/components/TokenList";
import { useEIP7702Transaction } from "@/hooks/useEIP7702Transaction";
import { Button } from "@/components/ui/button";
import type { ApproveData, RouteData, TokenData } from "@ensofinance/sdk";
import { base } from "viem/chains";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TestingPage() {
  const { address } = useAccount();
  const [approvalData, setApprovalData] = useState<ApproveData | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [combinedApprovalData, setCombinedApprovalData] =
    useState<ApproveData | null>(null);
  const [combinedRouteData, setCombinedRouteData] = useState<RouteData | null>(
    null
  );
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);

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

  const handleRouteData = (data: RouteData) => {
    console.log("Route data received:", data);
    setRouteData(data);
  };

  const handleCombinedApprovalData = (data: ApproveData) => {
    console.log("Combined approval data received:", data);
    setCombinedApprovalData(data);
  };

  const handleCombinedRouteData = (data: RouteData) => {
    console.log("Combined route data received:", data);
    setCombinedRouteData(data);
  };

  const handleSelectToken = (token: TokenData) => {
    console.log("Token selected:", token);
    setSelectedToken(token);
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

        <Tabs defaultValue="approval" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="approval">Token Approval</TabsTrigger>
            <TabsTrigger value="swap">Token Swap</TabsTrigger>
            <TabsTrigger value="combined">Combined Flow</TabsTrigger>
            <TabsTrigger value="tokens">Token List</TabsTrigger>
          </TabsList>

          <TabsContent value="approval" className="mt-4">
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
          </TabsContent>

          <TabsContent value="swap" className="mt-4">
            <div>
              <h2 className="text-xl font-bold mb-4">Token Swap Flow</h2>
              <SwapComponent onRouteData={handleRouteData} />

              {routeData && (
                <div className="mt-6">
                  <Card className="p-4 border border-primary/10">
                    <h3 className="text-lg font-semibold mb-2">
                      Route Details
                    </h3>
                    <div className="text-xs font-mono bg-background p-2 rounded overflow-auto max-h-60">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(routeData, null, 2)}
                      </pre>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="combined" className="mt-4">
            <div>
              <h2 className="text-xl font-bold mb-4">
                Combined Flow (Approve & Swap)
              </h2>
              <p className="text-muted-foreground mb-6">
                This demo shows how to approve a token and execute a swap in a
                single batched transaction using EIP-7702.
              </p>

              <CombinedFlow
                onApprovalData={handleCombinedApprovalData}
                onRouteData={handleCombinedRouteData}
              />

              {(combinedApprovalData || combinedRouteData) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {combinedApprovalData && (
                    <Card className="p-4 border border-primary/10">
                      <h3 className="text-lg font-semibold mb-2">
                        Approval Data
                      </h3>
                      <div className="text-xs font-mono bg-background p-2 rounded overflow-auto max-h-60">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(combinedApprovalData, null, 2)}
                        </pre>
                      </div>
                    </Card>
                  )}

                  {combinedRouteData && (
                    <Card className="p-4 border border-primary/10">
                      <h3 className="text-lg font-semibold mb-2">Route Data</h3>
                      <div className="text-xs font-mono bg-background p-2 rounded overflow-auto max-h-60">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(combinedRouteData, null, 2)}
                        </pre>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="mt-4">
            <div>
              <h2 className="text-xl font-bold mb-4">Token List</h2>
              <p className="text-muted-foreground mb-6">
                Explore all tokens available on Base chain via the Enso API.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className="p-4">
                    <TokenList onSelectToken={handleSelectToken} />
                  </Card>
                </div>

                <div>
                  <Card className="p-4 h-full">
                    <h3 className="font-semibold mb-2">
                      Selected Token Details
                    </h3>
                    {selectedToken ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {selectedToken.logosUri &&
                          selectedToken.logosUri.length > 0 ? (
                            <div className="h-12 w-12 relative rounded-full overflow-hidden">
                              <Image
                                src={selectedToken.logosUri[0]}
                                alt={selectedToken.symbol || "token"}
                                fill
                                className="object-contain"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              {selectedToken.symbol?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold">
                              {selectedToken.symbol || "Unknown"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedToken.name}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Type:</div>
                          <div className="font-medium">
                            {selectedToken.type}
                          </div>

                          <div className="text-muted-foreground">Decimals:</div>
                          <div className="font-medium">
                            {selectedToken.decimals}
                          </div>

                          <div className="text-muted-foreground">Chain ID:</div>
                          <div className="font-medium">
                            {selectedToken.chainId}
                          </div>
                        </div>

                        {selectedToken.type === "defi" && (
                          <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2">
                            <div className="text-muted-foreground">
                              Project:
                            </div>
                            <div className="font-medium">
                              {selectedToken.project || "N/A"}
                            </div>

                            <div className="text-muted-foreground">
                              Protocol:
                            </div>
                            <div className="font-medium">
                              {selectedToken.protocolSlug || "N/A"}
                            </div>

                            <div className="text-muted-foreground">APY:</div>
                            <div className="font-medium">
                              {selectedToken.apy !== null
                                ? `${selectedToken.apy}%`
                                : "N/A"}
                            </div>

                            <div className="text-muted-foreground">TVL:</div>
                            <div className="font-medium">
                              {selectedToken.tvl !== null
                                ? `$${selectedToken.tvl.toLocaleString()}`
                                : "N/A"}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 text-xs break-all">
                          <div className="text-muted-foreground mb-1">
                            Address:
                          </div>
                          <div className="bg-muted rounded p-2">
                            {selectedToken.address}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>Select a token to view details</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ContentArea>
  );
}
