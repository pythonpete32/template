"use client";

import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { type Address, type Abi, encodeFunctionData } from "viem";
import { base } from "viem/chains";
import { Button } from "@/components/ui/button";
import { ContentArea } from "@/components/ContentArea";
import { useSignEIP7702Authorization } from "@/hooks/useSignEIP7702Authorization";
import { useRelayEIP7702Transaction } from "@/hooks/useRelayEIP7702Transaction";
import BatchExecutor from "@/contracts/BatchExecutor";
import USDT from "@/contracts/USDT";
import USDC from "@/contracts/USDC";

const contractAddress: Address = BatchExecutor.address;
const sendTokensAbi: Abi = BatchExecutor.abi;

export default function TestingPage() {
  const { address: eoa } = useAccount();

  const {
    signAuthorization,
    signedAuthorization,
    isSigning,
    signingError,
    isSigningError,
  } = useSignEIP7702Authorization({ contractAddress });

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

  const handleRelayTransactionClick = () => {
    const encodedTransferUSDT = encodeFunctionData({
      abi: USDT.abi,
      functionName: "transfer",
      args: ["0x47d80912400ef8f8224531EBEB1ce8f2ACf4b75a", 69n],
    });

    const encodedTransferUSDC = encodeFunctionData({
      abi: USDC.abi,
      functionName: "transfer",
      args: ["0x47d80912400ef8f8224531EBEB1ce8f2ACf4b75a", 69n],
    });

    relayTransaction({
      authorization: signedAuthorization,
      abi: sendTokensAbi,
      functionName: "executeBatch",
      args: [
        [USDT.address, USDC.address],
        [encodedTransferUSDT, encodedTransferUSDC],
      ],
    });
  };

  const explorerUrl = base.blockExplorers?.default.url;
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return (
    <ContentArea>
      <h1 className="text-2xl font-bold mb-4">
        EIP-7702 Authorization Test (Refactored)
      </h1>
      <div className="flex flex-col space-y-4">
        <Button
          onClick={handleSignAuthorizationClick}
          disabled={
            isSigning || isRelaying || !eoa || !walletClient || !publicClient
          }
        >
          {isSigning ? "Signing..." : "1. Sign Authorization"}
        </Button>

        {signedAuthorization && (
          <Button
            onClick={handleRelayTransactionClick}
            disabled={isRelaying || isSigning || !signedAuthorization}
            variant="neutral"
          >
            {isRelaying ? "Relaying..." : "2. Relay Transaction"}
          </Button>
        )}
      </div>

      {isSigningError && (
        <p className="text-red-500 mt-4">
          Signing Error: {signingError?.message || "An unknown error occurred"}
        </p>
      )}
      {isRelayingError && (
        <p className="text-red-500 mt-4">
          Relay Error: {relayingError?.message || "An unknown error occurred"}
        </p>
      )}

      {signedAuthorization && (
        <div className="mt-4 p-4 bg-gray-100 rounded dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2">Signed Authorization:</h2>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(
              signedAuthorization,
              (key, value) =>
                typeof value === "bigint" ? value.toString() : value,
              2
            )}
          </pre>
        </div>
      )}

      {relayedTxData?.txHash && explorerUrl && (
        <div className="mt-4 p-4 bg-green-100 rounded dark:bg-green-900">
          <h2 className="text-lg font-semibold mb-2">
            Transaction Relayed Successfully!
          </h2>
          <a
            href={`${explorerUrl}/tx/${relayedTxData.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            View on Basescan: {relayedTxData.txHash}
          </a>
        </div>
      )}
    </ContentArea>
  );
}
