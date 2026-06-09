---
trigger: manual
---

# Wallet Connection Integration

This document outlines how wallet connection functionality is implemented across the codebase, specifically focusing on the packages, configuration, and UI interactions. 

## 1. Core Packages & Libraries
The application relies on a modern Next.js Web3 stack:
- **`wagmi` (^2.19.5)**: The core React Hooks library for Ethereum. It provides all the logic for connecting wallets and managing chain state.
- **`@rainbow-me/rainbowkit` (^2.2.11)**: A React library built on top of Wagmi that provides a polished, out-of-the-box UI component for wallet selection and connection.
- **`viem` (2.51.3)**: A lightweight, low-level TypeScript interface for Ethereum that Wagmi uses under the hood. 
- **`@tanstack/react-query` (^5.100.14)**: Required by Wagmi v2 for handling asynchronous state, caching, and data fetching.

## 2. Configuration (`lib/wagmi.ts`)
The Wagmi and RainbowKit configuration is centralized in `lib/wagmi.ts`.
- **Chains Supported**: The app restricts connections specifically to Base (`base`) and Base Sepolia (`baseSepolia`).
- **Wallets Configured**:
  - *Recommended Group*: MetaMask and Phantom (prioritized for their extension and mobile deep-link support).
  - *Other Group*: WalletConnect (QR Code fallback) and Rainbow Wallet.
- **Transports**: Standard `http()` transports are used for both chains.

## 3. Providers Setup (`components/providers/Web3Provider.tsx`)
The `Web3Provider` wraps the entire application with the necessary context providers in the following nested order:
1. `<WagmiProvider config={config}>`
2. `<QueryClientProvider client={queryClient}>`
3. `<RainbowKitProvider theme={...} showRecentTransactions={false}>`

*Note: RainbowKit is configured with a customized `darkTheme` utilizing the project's brand colors.*

## 4. Web3 UI Components & Logic

### Mobile Nav Roll-Up & Wallet Display (`components/ui/Navbar.tsx`)
The Navbar features a customized mobile "roll-up" drawer that specifically targets mobile users by prioritizing **MetaMask** and **Phantom** connections over the standard RainbowKit modal. 

- **Detection**: The component uses custom `isMobileBrowser()`, `isMetaMaskInstalled()`, and `isPhantomInstalled()` helpers. These run strictly on the client-side inside a `useEffect` to prevent Next.js hydration mismatches.
- **Initial Mobile Display**: When a user opens the mobile nav drawer (hamburger menu), they initially see two prominent, custom-styled buttons for **MetaMask** and **Phantom**.
- **Deep Linking**: Standard RainbowKit wallet modals often fail or provide a poor UX inside mobile browsers (like Safari or Chrome on iOS). To fix this, if the native extension is *not* detected on mobile:
  - The MetaMask button triggers `openMetaMaskMobile()`, formatting a `metamask.app.link/dapp/...` URL.
  - The Phantom button triggers `openPhantomMobile()`, formatting a `phantom.app/ul/browse/...` URL.
  - This deep-links the user directly into the native wallet app's internal browser, automatically passing the dApp's URL.
- **Fallback**: A smaller "More wallets (WalletConnect QR)" button acts as a fallback, which triggers RainbowKit's `openConnectModal()` for other wallet options.

### Network Guard (`components/ui/NetworkGuard.tsx`)
This component strictly enforces the chain requirements using `useAccount` and `useSwitchChain` from `wagmi`.
- **Logic**: If a wallet is connected but the user is *not* on Base or Base Sepolia, the app displays a full-screen warning blocking the UI and providing a button to automatically switch the chain via `switchChain({ chainId: base.id })`.

### Standard Connect Button
For standard desktop pages like `app/dashboard/page.tsx`, the app imports and renders the default `<ConnectButton />` directly from `@rainbow-me/rainbowkit`.
