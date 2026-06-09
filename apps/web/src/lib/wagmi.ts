import { http } from "wagmi";
import { hardhat, baseSepolia, mainnet } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { 
  metaMaskWallet, 
  phantomWallet, 
  rainbowWallet, 
  coinbaseWallet 
} from "@rainbow-me/rainbowkit/wallets";

export const config = getDefaultConfig({
  appName: "Deposit",
  appDescription: "AI-Verified Crowd Escrow",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://deposit-web.vercel.app/",
  appIcon: "https://deposit-web.vercel.app/favicon.ico",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "deposit-local-dev",
  chains: [hardhat, baseSepolia, mainnet],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [mainnet.id]: http("https://cloudflare-eth.com"), // Fixes eth.merkle.io CORS error during ENS resolution
  },
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [phantomWallet, metaMaskWallet],
    },
    {
      groupName: 'Others',
      wallets: [rainbowWallet, coinbaseWallet],
    }
  ],
});
