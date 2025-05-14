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

const eoa = privateKeyToAccount(
  `0x${process.env.SENDER_PRIVATE_KEY}` as `0x${string}`
);
const relay = privateKeyToAccount(
  `0x${process.env.RELAYER_PRIVATE_KEY}` as `0x${string}`
);

export const walletClient = createWalletClient({
  account: relay,
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
});

async function main() {
  const authorization = await walletClient.signAuthorization({
    account: eoa,
    contractAddress: BatchExecutor.address,
  });

  console.log("Authorization:", authorization);

  const RECIPIENT_ADDRESS: Address =
    "0x47d80912400ef8f8224531EBEB1ce8f2ACf4b75a";
  const TRANSFER_AMOUNT = 69n; // Wei

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

  const hash = await walletClient.writeContract({
    abi: BatchExecutor.abi,
    address: eoa.address,
    authorizationList: [authorization],
    functionName: "executeBatch",
    args: [
      [USDT.address, USDC.address],
      [encodedTransferUSDT, encodedTransferUSDC],
    ],
  });

  const explorerUrl = base.blockExplorers?.default.url;
  console.log(`Transaction sent! View on Basescan: ${explorerUrl}/tx/${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
