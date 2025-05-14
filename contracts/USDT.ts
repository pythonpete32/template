import type { Abi } from "viem";
import { erc20Abi } from "viem";

const USDT = {
  address: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  abi: erc20Abi satisfies Abi,
} as const;

export default USDT;
