import type { Abi } from "viem";

const BatchExecutor = {
  address: "0x5d6EBDDD42f3668073b2707b763A201872d6Eca0",
  abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "CallFailed",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "targetsLength",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "dataLength",
          type: "uint256",
        },
      ],
      name: "InvalidInputLength",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "result",
          type: "bytes",
        },
      ],
      name: "CallExecuted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "success",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "result",
          type: "bytes",
        },
      ],
      name: "CallResult",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "msgSender",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "contractThis",
          type: "address",
        },
      ],
      name: "TestLog",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address[]",
          name: "targets",
          type: "address[]",
        },
        {
          internalType: "bytes[]",
          name: "data",
          type: "bytes[]",
        },
      ],
      name: "executeBatch",
      outputs: [
        {
          internalType: "bytes[]",
          name: "results",
          type: "bytes[]",
        },
        {
          internalType: "bool[]",
          name: "successes",
          type: "bool[]",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ] satisfies Abi,
} as const;

export default BatchExecutor;
