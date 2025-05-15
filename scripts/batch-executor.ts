import { privateKeyToAccount } from "viem/accounts";
import {
  type Address,
  createWalletClient,
  encodeFunctionData,
  http,
} from "viem";
import { base } from "viem/chains";
import BatchExecutor from "@/contracts/BatchExecutor";
import USDT from "@/contracts/USDT";
import USDC from "@/contracts/USDC";
import { getServerEnv } from "@/lib/env";

// 1. Get  variables
const { ALCHEMY_API_KEY, RELAY_PK, SENDER_PK } = getServerEnv();
const BASE_RPC = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const RECIPIENT_ADDRESS: Address = "0x47d80912400ef8f8224531EBEB1ce8f2ACf4b75a";
const TRANSFER_AMOUNT = 69n;

// 2. Create clients
export const relayClient = createWalletClient({
  account: privateKeyToAccount(`0x${RELAY_PK}`),
  chain: base,
  transport: http(BASE_RPC),
});

export const senderClient = createWalletClient({
  account: privateKeyToAccount(`0x${SENDER_PK}`),
  chain: base,
  transport: http(BASE_RPC),
});

async function main() {
  // 3. Sign authorization
  const authorization = await senderClient.signAuthorization({
    contractAddress: BatchExecutor.address,
  });

  // 4. Encode actions to be executed
  const encodedTransferUSDT = encodeFunctionData({
    abi: USDT.abi,
    functionName: "transfer",
    args: [RECIPIENT_ADDRESS, TRANSFER_AMOUNT],
  });

  const encodedTransferUSDC = encodeFunctionData({
    abi: USDC.abi,
    functionName: "transfer",
    args: [RECIPIENT_ADDRESS, TRANSFER_AMOUNT],
  });

  const hash = await relayClient.writeContract({
    abi: BatchExecutor.abi,
    address: senderClient.account.address,
    authorizationList: [authorization],
    functionName: "executeBatch",
    args: [
      [USDT.address, USDC.address],
      [encodedTransferUSDT, encodedTransferUSDC],
    ],
  });

  console.log(`Transaction sent: https://basescan.org/tx/${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
