import type { Abi } from "viem";
import { erc20Abi } from "viem";

const USDC = {
  address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  abi: erc20Abi satisfies Abi,
} as const;

export default USDC;
