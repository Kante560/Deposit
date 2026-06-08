import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from the oracle app's .env.local to avoid duplication
dotenv.config({ path: path.resolve(__dirname, "../../apps/oracle/.env.local") });

// Hardhat Account #0 private key — LOCAL TESTING ONLY (fallback)
const LOCAL_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || LOCAL_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [LOCAL_PRIVATE_KEY],
    },
    baseSepolia: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
  },
};

export default config;

