# EIP-7702 In-Action: Batch Transactions & Relaying Demo

Welcome to this hands-on demonstration of **EIP-7702: Set Code During Transaction**, showcasing how it can be leveraged for powerful use-cases like batching multiple operations and enabling gas-sponsored transactions via a relayer. This project provides a Next.js application and a Hardhat environment to explore these concepts, primarily on the Base network.

The core idea is to simplify complex multi-step interactions (like approving multiple tokens and then transferring them) into a single, user-authorized transaction, potentially sponsored by a third-party relayer.

## Table of Contents

- [1. The "Why" - Problem & Motivation](#1-the-why---problem--motivation)
  - [The Annoyance of "Dust" & Multi-Step Operations](#the-annoyance-of-dust--multi-step-operations)
  - [Enter EIP-7702: A New Paradigm](#enter-eip-7702-a-new-paradigm)
- [2. Features](#2-features)
- [3. Getting Started / Prerequisites](#3-getting-started--prerequisites)
- [4. Installation](#4-installation)
  - [Environment Variables](#environment-variables)
- [5. Project Tour - Understanding the Pieces (The Core Tutorial)](#5-project-tour---understanding-the-pieces-the-core-tutorial)
  - [Directory Structure Overview](#directory-structure-overview)
  - [A. EIP-7702: A Quick Primer](#a-eip-7702-a-quick-primer)
  - [B. The `BatchExecutor.sol` Smart Contract](#b-the-batchexecutorsol-smart-contract)
  - [C. The Standalone Script (`scripts/batch-executor.ts`): Laying the Foundation](#c-the-standalone-script-scriptsbatch-executorts-laying-the-foundation)
    - [Running the Script](#running-the-script)
    - [Inspecting the Transaction: EIP-7702 in Action](#inspecting-the-transaction-eip-7702-in-action)
  - [D. The Challenge: Browser Wallets & `signAuthorization`](#d-the-challenge-browser-wallets--signauthorization)
  - [E. Custom EIP-7702 Signing (`lib/sign-7702-auth.ts`)](#e-custom-eip-7702-signing-libsign-7702-authts)
  - [F. Frontend Integration: The React Hooks](#f-frontend-integration-the-react-hooks)
    - [`useSignEIP7702Authorization`](#usesigneip7702authorization)
    - [`useRelayEIP7702Transaction`](#userelayeip7702transaction)
  - [G. The Relayer (`app/actions.ts` - Next.js Server Action)](#g-the-relayer-appactionsts---nextjs-server-action)
- [6. Usage / How to Run the Frontend Demo](#6-usage--how-to-run-the-frontend-demo)
  - [Demo Page 1: `/transfer`](#demo-page-1-transfer)
- [Demo Page 2: `/testing2` (Batch Executor)](#demo-page-2-testing2-batch-executor)
  - [Step-by-Step Guide](#step-by-step-guide)
- [7. Building a "Dust Sweeper" - The Next Step](#7-building-a-dust-sweeper---the-next-step)
- [8. Contributing](#8-contributing)
- [9. License](#9-license)

## 1. The "Why" - Problem & Motivation

### The Annoyance of "Dust" & Multi-Step Operations

If you've used DeFi or interacted with various dApps, you've likely encountered "dust" – small, leftover balances of various tokens in your wallet. Individually, they might not be worth much, and cleaning them up often requires multiple transactions:

1.  **Approve** Token A for a contract (e.g., a DEX or our `BatchExecutor`).
2.  **Transfer/Swap** Token A.
3.  Repeat for Token B, Token C, and so on...

Each of these steps is a separate on-chain transaction, costing gas and requiring user confirmation. This is cumbersome and expensive!

### Enter EIP-7702: A New Paradigm

EIP-7702 introduces a way for an Externally Owned Account (EOA) to delegate its authority to a smart contract _for the duration of a single transaction_. This means a contract (like our `BatchExecutor.sol`) can temporarily act _as if it were the EOA itself_.

**Why is this powerful?**

- **Atomic Batching:** We can design a contract that performs multiple actions (e.g., N approvals and N transfers) in one go. With EIP-7702, the EOA authorizes this batch contract, and all sub-operations within that batch are executed as if initiated directly by the EOA.
- **Gas Sponsorship (Relaying):** Since the EOA just needs to sign an authorization message (which is off-chain), a third-party "relayer" can pick up this authorization and the desired operations, bundle them into a transaction, and pay the gas fees. The user gets a "gasless" experience for complex actions!

This project was born out of the desire to explore these capabilities, particularly to make complex interactions like dust sweeping feasible and user-friendly. We started by deploying a `BatchExecutor` contract on Base (a low-cost, EIP-7702-enabled network) and then built the pieces to interact with it, first via a script and then through a user-friendly web interface.

## 2. Features

- **Batch Execution:** `BatchExecutor.sol` smart contract allows multiple arbitrary calls to other contracts in a single transaction.
- **EIP-7702 Authorization:** Demonstrates how an EOA can authorize the `BatchExecutor` to act on its behalf.
- **Custom EIP-7702 Signing for Browser Wallets:** Includes a `signAuthorizationTyped` function (`lib/sign-7702-auth.ts`) because `viem`'s built-in `signAuthorization` does not support JSON-RPC accounts (like MetaMask) out-of-the-box.
- **Transaction Relaying:** Uses Next.js Server Actions (`app/actions.ts`) for a backend relayer that sponsors transactions, taking the EOA's authorization and executing the batch.
- **Frontend Examples:** Two demo pages (`/transfer` and `/testing2`) in a Next.js app to showcase the end-to-end flow with browser wallets.
- **Standalone Test Script:** A script (`scripts/batch-executor.ts`) to test the core EIP-7702 and batching logic directly.
- **Base Network Focus:** Examples are configured for the Base blockchain.

## 3. Getting Started / Prerequisites

- **Node.js:** v18.x or later.
- **Package Manager:** npm, yarn, or pnpm.
- **Browser Wallet:** MetaMask, Rabby, Frame, or any EIP-712 compatible wallet.
- **Alchemy Account:** To get an API key for interacting with the Base network.
- **WalletConnect Project ID:** If you plan to use WalletConnect with ConnectKit.

## 4. Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd hack-7702 # or your repository name
    ```

2.  **Install dependencies** in the `template` directory:

    ```bash
    cd template
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the `template` directory (`template/.env.local`) by copying `template/.env.example` (if one exists, otherwise create it from scratch) with the following variables:

    ```env
    # For the relayer script and server-side operations (Alchemy API Key for Base)
    ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY"

    # Private key for the account that will RELAY/SPONSOR transactions (must have Base ETH for gas)
    # IMPORTANT: This key will be used on the server-side to send transactions. Keep it secure.
    # Example: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
    RELAY_PK="YOUR_RELAYER_PRIVATE_KEY"

    # Private key for the SENDER EOA (used ONLY by the standalone script `scripts/batch-executor.ts`)
    # This EOA will be the one authorizing the BatchExecutor in the script.
    # For the web UI, the connected wallet's EOA is used.
    SENDER_PK="YOUR_SENDER_PRIVATE_KEY_FOR_SCRIPT"

    # Client-side Alchemy ID for wagmi/ConnectKit (Base)
    NEXT_PUBLIC_ALCHEMY_ID="YOUR_ALCHEMY_APPLICATION_ID" # Often same as API_KEY, but sometimes just the ID part

    # WalletConnect Project ID for ConnectKit
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"
    ```

    - **`ALCHEMY_API_KEY`**: Your API key from Alchemy for Base Mainnet. Used by the relayer script and server action.
    - **`RELAY_PK`**: The private key of an account that will act as the relayer. This account needs Base ETH to pay for gas when submitting transactions.
    - **`SENDER_PK`**: The private key of an account that will authorize transactions. **This is ONLY used by the `scripts/batch-executor.ts` script for testing.** In the web application, the user's connected wallet provides the authorization.
    - **`NEXT_PUBLIC_ALCHEMY_ID`**: Your Alchemy Application ID (often the same as the API key) for client-side interactions via wagmi/ConnectKit.
    - **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`**: Your project ID from WalletConnect Cloud, required by ConnectKit.

## 5. Project Tour - Understanding the Pieces (The Core Tutorial)

Let's walk through the key components of this project bit by bit.

### Directory Structure Overview

```

├── hardhat/
│ └── contracts/
│ └── BatchExecutor.sol # The smart contract for batching calls
├── template/
│ ├── app/
│ │ ├── actions.ts # Next.js Server Action for relaying
│ │ ├── testing/ # Demo page 1
│ │ │ └── page.tsx
│ │ ├── testing2/ # Demo page 2 (uses BatchExecutor)
│ │ │ └── page.tsx
│ │ └── ... (other Next.js app files)
│ ├── components/ # React components (Header, ConnectButton, etc.)
│ ├── contracts/ # Frontend ABIs and addresses (BatchExecutor, USDT, USDC)
│ ├── hooks/
│ │ ├── useSignEIP7702Authorization.ts # Hook for EIP-7702 signing
│ │ └── useRelayEIP7702Transaction.ts # Hook for relaying transactions
│ ├── lib/
│ │ └── sign-7702-auth.ts # Custom EIP-7702 signing logic for browser wallets
│ ├── scripts/
│ │ └── batch-executor.ts # Standalone script to test EIP-7702 & batching
│ ├── .env.local # (You create this) Environment variables
│ └── ... (Next.js config, package.json, etc.)

```

### A. EIP-7702: A Quick Primer

EIP-7702 allows an EOA to temporarily grant another address (typically a smart contract) the ability to act as `msg.sender` on its behalf for the duration of a single transaction. This is achieved by the EOA signing an "authorization" message (an EIP-712 typed data structure). This signed authorization is then included in a transaction submitted by _any_ address (e.g., a relayer).

When the Ethereum Virtual Machine (EVM) processes such a transaction, it recognizes the EIP-7702 authorization. For calls made to the authorized contract (and potentially calls made _by_ that authorized contract, depending on its logic), `msg.sender` will be the EOA that signed the authorization, not the address that submitted the transaction (the relayer).

### B. The `BatchExecutor.sol` Smart Contract

Located at `hardhat/contracts/BatchExecutor.sol`, this contract is the heart of our batching mechanism.

- **Purpose:** To execute a series of arbitrary calls to different contracts with specified calldata, all within a single atomic transaction.
- **Why this design?** It allows us to bundle multiple operations (like multiple ERC20 approvals, or an approval followed by a transfer) into one. When combined with EIP-7702, the `BatchExecutor` can perform these actions _as if it were the user's EOA_.

Key parts of `BatchExecutor.sol`:

```solidity
// hardhat/contracts/BatchExecutor.sol
contract BatchExecutor {
    // ... errors and events ...

    event TestLog(address indexed msgSender, address indexed contractThis);

    function executeBatch(
        address[] calldata targets,
        bytes[] calldata data
    ) external returns (bytes[] memory results, bool[] memory successes) {
        emit TestLog(msg.sender, address(this)); // Crucial for observing EIP-7702
        uint256 len = targets.length;
        // ... input validation ...

        results = new bytes[](len);
        successes = new bool[](len);

        for (uint256 i = 0; i < len; ++i) {
            (bool ok, bytes memory res) = targets[i].call(data[i]);
            // ... store results and emit events ...
        }
    }
}
```

The `TestLog` event is particularly important. When `executeBatch` is called via an EIP-7702 authorized transaction, `msg.sender` in this event will be the EOA that signed the authorization, _not_ the relayer's address.

### C. The Standalone Script (`scripts/batch-executor.ts`): Laying the Foundation

Before diving into the complexities of browser wallets and frontend integration, we started with a simpler script (`template/scripts/batch-executor.ts`) to verify the core EIP-7702 interaction with our `BatchExecutor.sol` contract. This script uses viem and private keys directly.

- **Purpose:** To demonstrate the EIP-7702 flow using viem's native `signAuthorization` (which works with local private key accounts) and the `BatchExecutor` contract.
- **Workflow:**
  1.  **Setup Clients:** It creates two `WalletClient` instances using viem:
      - `senderClient`: Represents the EOA that wants to perform batch operations. Its private key comes from `SENDER_PK` in your `.env.local`.
      - `relayClient`: Represents the relayer that will submit the transaction and pay for gas. Its private key comes from `RELAY_PK`.
  2.  **Sign Authorization:**
      ```typescript
      // template/scripts/batch-executor.ts
      const authorization = await senderClient.signAuthorization({
        contractAddress: BatchExecutor.address, // Authorize BatchExecutor
      });
      ```
      The `senderClient` (EOA) signs an authorization message, granting `BatchExecutor.address` the right to act on its behalf.
  3.  **Encode Actions:** The script then encodes the desired function calls. In this example, it prepares two ERC20 `transfer` calls (one for USDT, one for USDC):
      ```typescript
      // template/scripts/batch-executor.ts
      const encodedTransferUSDT = encodeFunctionData({
        /* ... */
      });
      const encodedTransferUSDC = encodeFunctionData({
        /* ... */
      });
      ```
  4.  **Relay the Transaction:** The `relayClient` submits the transaction:
      ```typescript
      // template/scripts/batch-executor.ts
      const hash = await relayClient.writeContract({
        abi: BatchExecutor.abi,
        // CRITICAL: The 'address' here is the EOA we want to act as,
        // not the BatchExecutor's address or the relayer's address.
        // Viem's writeContract (when authorizationList is present)
        // will make the call TO the BatchExecutor.address
        // but the EIP-7702 context ensures BatchExecutor thinks
        // msg.sender is senderClient.account.address
        address: BatchExecutor.address, // Target contract for writeContract
        account: senderClient.account.address, // EOA who signed the auth
        authorizationList: [authorization],
        functionName: "executeBatch",
        args: [
          [USDT.address, USDC.address], // targets for executeBatch
          [encodedTransferUSDT, encodedTransferUSDC], // data for executeBatch
        ],
      });
      ```
      **Key Point:** In `relayClient.writeContract`, the `account` parameter is set to `senderClient.account.address` (the EOA), and `authorizationList` contains the signed authorization. This tells the network that `BatchExecutor.address` is authorized by `senderClient.account.address` for this transaction. The `address` parameter is the target contract `BatchExecutor.address`, and `functionName` is `executeBatch`. The relayer (`relayClient`) pays the gas.

#### Running the Script

1.  Ensure your `template/.env.local` is set up with `ALCHEMY_API_KEY`, `RELAY_PK`, and `SENDER_PK`.
2.  The `SENDER_PK` account should have some USDT and USDC on Base for the transfers to succeed (or you can modify the script for other actions). The `RELAY_PK` account needs Base ETH for gas.
3.  Execute the script from the `template` directory:
    ```bash
    npx ts-node ./scripts/batch-executor.ts
    ```
    (You might need to install `ts-node` globally: `npm install -g ts-node`)

You should see a transaction hash printed.

#### Inspecting the Transaction: EIP-7702 in Action

1.  Take the transaction hash from the script's output and look it up on a Base network explorer (e.g., Basescan).
2.  Find the "Logs" section of the transaction details.
3.  You should see the `TestLog` event emitted by our `BatchExecutor.sol` contract.

    - `msgSender`: This should be the address of your `SENDER_PK` EOA.
    - `contractThis`: This will be the address of the `BatchExecutor.sol` contract.

    This is the crucial evidence! Even though the `relayClient` (with `RELAY_PK`) submitted and paid for the transaction, inside `BatchExecutor.sol`, `msg.sender` was correctly identified as the `senderClient`'s EOA. This is EIP-7702 working its magic!

### D. The Challenge: Browser Wallets & `signAuthorization`

The standalone script worked beautifully because `viem`'s `signAuthorization` function is designed for "local accounts" where the private key is directly available. However, when working with browser wallets (MetaMask, Rabby, etc.), the private key is not directly accessible to the dApp. These wallets expose a JSON-RPC interface.

We discovered that `viem`'s `signAuthorization` **does not support JSON-RPC accounts out-of-the-box**. This was a significant hurdle because the main goal is to enable these EIP-7702 flows for users with standard browser wallets.

### E. Custom EIP-7702 Signing (`lib/sign-7702-auth.ts`)

To overcome the limitation with browser wallets, we had to implement our own function to construct and sign the EIP-7702 authorization message using the EIP-712 standard. This is `signAuthorizationTyped` in `template/lib/sign-7702-auth.ts`.

- **Purpose:** To create an EIP-7702 authorization signature using a browser wallet (`WalletClient` from `wagmi`).
- **How it works:**

  1.  **Fetch Nonce and Chain ID:** It gets the EOA's current nonce (for replay protection) and the chain ID.
  2.  **Define EIP-712 Structure:** It defines the EIP-712 domain, types, and message for the authorization:

      ```typescript
      // template/lib/sign-7702-auth.ts
      const domain = {
        name: "EIP-7702 Authorization",
        version: "1",
        chainId,
      } as const;

      const types = {
        Authorization: [
          { name: "chainId", type: "uint256" },
          { name: "authorized", type: "address" }, // The contract being authorized
          { name: "nonce", type: "uint256" },
        ],
      } as const;

      const message = {
        chainId: BigInt(chainId),
        authorized: contractAddress, // e.g., BatchExecutor.address
        nonce: BigInt(nonce),
      } as const;
      ```

      The `authorized` field is key: it's the address of the contract (e.g., `BatchExecutor.address`) that the EOA is granting temporary authority to.

  3.  **User Signs Typed Data:** It uses `walletClient.signTypedData()` to prompt the user to sign this structured message. This is a standard EIP-712 signing request that browser wallets understand.
  4.  **Parse Signature:** The resulting signature is parsed to get `r`, `s`, `v`, and `yParity` components.
  5.  **Format for Viem:** The function returns an object matching the `SignAuthorizationReturnType` that `viem`'s `writeContract` expects in its `authorizationList`.

This custom function allows us to get the necessary EIP-7702 authorization signature from users interacting via browser wallets.

### F. Frontend Integration: The React Hooks

To make the EIP-7702 flow usable in our Next.js frontend, we created two custom React hooks:

#### `useSignEIP7702Authorization`

Located in `template/hooks/useSignEIP7702Authorization.ts`.

- **Purpose:** A React hook to wrap the `signAuthorizationTyped` logic.
- **Functionality:**
  - Takes the `contractAddress` (the address of the contract to be authorized, e.g., `BatchExecutor.address`) as an argument.
  - Uses `useAccount`, `useWalletClient`, and `usePublicClient` from `wagmi` to get the EOA, wallet signer, and provider.
  - Calls `signAuthorizationTyped` when its `signAuthorization` mutate function is invoked.
  - Manages signing state (loading, error, success) using `@tanstack/react-query`'s `useMutation`.
  - Returns the `signedAuthorization` data.

#### `useRelayEIP7702Transaction`

Located in `template/hooks/useRelayEIP7702Transaction.ts`.

- **Purpose:** A React hook to send the signed authorization and transaction details to our backend relayer.
- **Functionality:**
  - Takes the `authorization` (from `useSignEIP7702Authorization`), target contract `abi`, `functionName`, and `args` for the function to be called (e.g., `executeBatch` on `BatchExecutor`).
  - Calls the Next.js Server Action (`relayTransactionAction`) to perform the relaying.
  - Manages relaying state using `useMutation`.
  - Returns relaying status and the transaction hash if successful.

### G. The Relayer (`app/actions.ts` - Next.js Server Action)

For a true "gasless" user experience (where the user doesn't pay gas for the main transaction), we need a relayer. We implemented this using a Next.js Server Action in `template/app/actions.ts`.

- **Purpose:** To receive the EOA's signed authorization and the desired batch operations from the frontend, then use a backend private key (`RELAY_PK`) to submit the transaction to the blockchain, paying the gas.
- **Why Server Actions?** They are a modern Next.js feature for writing backend logic that can be called from frontend components, simplifying the architecture compared to traditional API routes for this use case.
- **How it works:**

  ```typescript
  // template/app/actions.ts
  "use server"; // Marks this as a Server Action

  // ... imports and setup ...

  // Client for the relayer, using RELAY_PK from .env.local
  const client = createWalletClient({
    account: privateKeyToAccount(env.RELAY_PK),
    chain: base,
    transport: http(/* ... Alchemy RPC ... */),
  });

  export async function relayTransactionAction(params: RelayRequest) {
    try {
      const { address, authorization, abi, functionName, args } = params;
      // `address` here is the EOA that signed the authorization

      const hash = await client.writeContract({
        abi, // ABI of the contract to call (e.g., BatchExecutor.abi)
        address: authorization.address, // The contract authorized (e.g., BatchExecutor.address)
        account: address, // The EOA who signed the authorization
        authorizationList: [authorization],
        functionName, // e.g., "executeBatch"
        args,
      });

      return { txHash: hash };
    } catch (err) {
      // ... error handling ...
    }
  }
  ```

  1.  The `relayTransactionAction` receives the `RelayRequest` which includes:
      - `address`: The EOA who signed the authorization.
      - `authorization`: The signed EIP-7702 authorization object.
      - `abi`, `functionName`, `args`: Details for the call to the authorized contract (e.g., to `BatchExecutor.executeBatch`).
  2.  It uses its own `client` (configured with `RELAY_PK`) to call `writeContract`.
  3.  Crucially, similar to the script:
      - `account` is set to the EOA's address (`address` from `params`).
      - `authorizationList` contains the `authorization` signed by the EOA.
      - `address` for `writeContract` is `authorization.address` (the contract that was authorized, e.g., `BatchExecutor.address`).
  4.  The relayer (identified by `RELAY_PK`) pays the gas for this `writeContract` call. But because of the EIP-7702 authorization, the `BatchExecutor` (or any contract it calls on behalf of the EOA) will see the EOA as the `msg.sender`.

This completes the chain: User signs an off-chain message -> Frontend sends it to Server Action -> Server Action (Relayer) submits it to the blockchain.

## 6. Usage / How to Run the Frontend Demo

After installation and setting up your `template/.env.local` file:

1.  **Start the development server** from the `template` directory:
    ```bash
    cd template
    npm run dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000) in your browser.

You'll find two main demo pages accessible via navigation (or directly):

### Demo Page 1: `/transfer`

- **URL:** `http://localhost:3000/transfer`
- **Purpose:** A simpler test of the EIP-7702 authorization and relay flow. It targets a generic contract address (defined in `template/app/transfer/page.tsx`) and attempts to call a dummy `sendTokens` function.
- This page helps verify the basic signing and relaying mechanism without the complexity of the `BatchExecutor`.

### Demo Page 2: `/testing2` (Batch Executor)

- **URL:** `http://localhost:3000/testing2`
- **Purpose:** This page demonstrates the full flow with the `BatchExecutor.sol` contract. It prepares batch calls to transfer USDT and USDC (you'll need these tokens on Base in your connected wallet for the transfers to fully succeed, though the authorization and relay will work regardless).
- This is the more comprehensive demo showing batching powered by EIP-7702 and sponsored by the relayer.

### Step-by-Step Guide (for either demo page):

1.  **Connect Your Wallet:** Use the "Connect Wallet" button. Ensure your wallet is set to the Base network.
2.  **Sign Authorization:**
    - Click the "1. Sign Authorization" button.
    - Your browser wallet will pop up asking you to sign an EIP-712 typed data message. This is the EIP-7702 authorization.
      - For `/transfer`, it authorizes the contract specified in `template/app/transfer/page.tsx`.
      - For `/testing2`, it authorizes the `BatchExecutor.address`.
    - Inspect the message if your wallet allows; you'll see the `chainId`, the `authorized` contract address, and your `nonce`.
    - Sign the message.
    - The `signedAuthorization` object will be displayed on the page.
3.  **Relay Transaction:**
    - Once authorization is signed, the "2. Relay Transaction" button will become active. Click it.
    - This action sends the `signedAuthorization` and the transaction details (which contract to call, what function, what arguments) to the Next.js Server Action (`relayTransactionAction`).
    - The server action (our relayer) uses `RELAY_PK` to submit this transaction to the Base network, paying the gas.
4.  **Observe Results:**
    - If successful, a "Transaction Relayed Successfully!" message will appear with a link to view the transaction on Basescan.
    - Click the Basescan link. Check the transaction details and logs.
      - For `/transfer`, you'll see the transaction details.
      - For `/testing2`, you should see the `TestLog` event from `BatchExecutor.sol`, where `msgSender` is your EOA's address. You'll also see events for the underlying ERC20 transfers if they were successful.
      - The "From" address on Basescan will be the `RELAY_PK`'s address (the one who paid gas), but the internal `msg.sender` for the authorized calls will be your EOA.

This flow demonstrates how a user can perform complex, potentially multi-step operations with just a single signature, with the gas costs handled by a relayer.

## 7. Building a "Dust Sweeper" - The Next Step

The original motivation for this project was to build a "dust sweeper" – an application that allows users to easily convert many small token balances into ETH (or another primary token) in a single, user-friendly operation.

With the primitives established in this repository (EIP-7702 authorization, `BatchExecutor.sol`, and a relayer), here's how a dust sweeper could be built (Part 2 of this idea):

1.  **Token Discovery:** The frontend would scan the user's wallet for various token balances.
2.  **User Selection:** The user selects which "dust" tokens they want to sweep.
3.  **Transaction Preparation:** For each selected token:
    - Generate calldata for an `approve` call to `BatchExecutor.address` (or a DEX router if swapping directly).
    - Generate calldata for a `transferFrom` call (if `BatchExecutor` is pulling tokens) or a `swap` call (if interacting with a DEX).
4.  **EIP-7702 Authorization:** The user signs a single EIP-7702 authorization for the `BatchExecutor.address`.
5.  **Relay Batch:** The frontend sends the list of all encoded `approve` and `transferFrom/swap` calls, along with the EIP-7702 authorization, to the relayer.
6.  **Execution:** The relayer calls `executeBatch` on `BatchExecutor.sol`. The `BatchExecutor` then, acting as the user's EOA:
    - Executes all the `approve` calls.
    - Executes all the `transferFrom` (to itself) or `swap` calls.
    - (If transferring to itself, `BatchExecutor` might then have a separate function, callable by anyone or a trusted party, to swap all collected tokens to ETH and send it back to the user, or this could be part of the batch).

This repository provides the foundational understanding and components to build such an application.

## 8. Contributing

Contributions are welcome! If you have ideas for improvements, find bugs, or want to expand on the examples:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Create a new Pull Request.

Please ensure your code follows the existing style and that you've tested your changes.

## 9. License

[TODO: Add License Information - e.g., MIT License]

This project is currently unlicensed. Please specify a license if you intend for others to use, modify, or distribute this code. A common choice for open-source projects is the MIT License.
