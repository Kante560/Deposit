<div align="center">
  <img src="./apps/web/public/oracle2.png" alt="Deposit Protocol Header" width="100%" />

  # 🛡️ Deposit Protocol
  **AI-Verified Crowd Escrow on Base**

  [![Base](https://img.shields.io/badge/Network-Base%20Sepolia-blue?style=for-the-badge&logo=base)](https://base.org)
  [![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Solidity](https://img.shields.io/badge/Smart%20Contracts-Solidity-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
  [![OpenRouter](https://img.shields.io/badge/AI%20Oracle-OpenRouter-000000?style=for-the-badge&logo=openai)](https://openrouter.ai/)
</div>

<br />

## 📖 Overview

**Deposit** is a decentralized crowd-escrow platform designed to bring absolute trust to Web3 crowdfunding. By locking funds in an immutable smart contract and automating milestone verification using an autonomous **AI Oracle Swarm**, Deposit ensures that builders only get paid when they actually deliver, and contributors are fully protected from rug pulls and abandoned projects.

### The Problem
Traditional crowdfunding platforms rely on blind trust. Once money is handed over, contributors have zero leverage if the creator fails to deliver.

### The Deposit Solution
1. **Milestone Setup:** Creators define specific deliverables and percentage payout tranches (e.g., 30%, 30%, 40%).
2. **AI Oracle Audits:** A decentralized AI swarm automatically verifies github commits, test runs, and deployment states to confirm a milestone has been completed.
3. **Cryptographic Releases:** The AI Oracle programmatically signs transactions to release the next tranche of locked funds from the Base L2 smart contract.
4. **Refund Safeguards:** If the builder misses a deadline or fails the AI verification, contributors can instantly claim refunds for the remaining funds.

---

## 🏗️ Architecture

Deposit is structured as an NPM Workspace Monorepo:

```
deposit/
├── apps/
│   ├── web/           # Next.js 14 Frontend (App Router, GSAP, Tailwind, Wagmi)
│   └── oracle/        # Node.js AI Oracle Backend (Ethers.js, Express, OpenRouter API)
├── packages/
│   └── contracts/     # Hardhat, Solidity Smart Contracts, Tests & Deployments
```

### 1. The Web App (`apps/web`)
A highly immersive, dynamic frontend featuring 3D Three.js elements, glassmorphism UI, GSAP animations, and ConnectKit/Wagmi for seamless Web3 wallet connections.

### 2. The Smart Contracts (`packages/contracts`)
An optimized Solidity Escrow contract deployed on **Base Sepolia**. It maps campaigns to creators, tracks fund tranches, and strictly requires the specific cryptographic signature of the AI Oracle to authorize payouts. 

### 3. The AI Oracle Swarm (`apps/oracle`)
An off-chain Node.js microservice that acts as the cryptographic bridge. It uses advanced LLMs via OpenRouter to read GitHub links, evidence, and original promises. If the AI determines the milestone was fulfilled, it securely signs an `approveMilestone` transaction using its private key and broadcasts it to Base.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- Web3 Wallet (MetaMask, Rainbow, etc.) with Base Sepolia testnet ETH.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/deposit.git
   cd deposit
   ```

2. **Install dependencies from the root:**
   ```bash
   npm install
   ```

### Configuration

You need to set up environment variables for the different packages.

**1. Contracts (`packages/contracts/.env`):**
```env
PRIVATE_KEY="your-wallet-private-key"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
```

**2. Frontend (`apps/web/.env.local`):**
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-id"
```

**3. Oracle (`apps/oracle/.env.local`):**
```env
PORT=3002
RPC_URL="https://sepolia.base.org"
# The Private Key of the dedicated Oracle Wallet
ORACLE_PRIVATE_KEY="your-oracle-private-key"
# OpenRouter API Key for AI verification
OPENROUTER_API_KEY="your-openrouter-key"
# The deployed DepositEscrow contract address
CONTRACT_ADDRESS="0x..."
```

---

## 💻 Running Locally

To boot up the entire development environment, run the following commands in separate terminal windows:

**1. Run the Frontend:**
```bash
cd apps/web
npm run dev
```
*Frontend will be available at [http://localhost:3001](http://localhost:3001)*

**2. Run the AI Oracle:**
```bash
cd apps/oracle
npm run dev
```
*Oracle server will listen on [http://localhost:3002](http://localhost:3002)*

---

## 🧪 Testing the Oracle Workflow

You can simulate the AI verification process locally using our built-in test script:

1. Deploy a dummy campaign on-chain:
   ```bash
   cd packages/contracts
   npx hardhat run scripts/setup-test.ts --network baseSepolia
   ```

2. Trigger the AI Oracle verification manually:
   ```bash
   # Run this using Node in the root folder
   node -e "fetch('http://localhost:3002/api/verify-milestone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId: 1, originalPromise: 'Build a web3 wallet connect button', evidenceLink: 'https://github.com/rainbow-me/rainbowkit' }) }).then(r=>r.json()).then(console.log)"
   ```
   *Watch your Oracle terminal panel process the AI response and execute the on-chain payout!*

---

## 🛠️ Built With
- **[Base](https://base.org)** - The L2 Ethereum scaling solution
- **[Next.js](https://nextjs.org/)** - React Framework
- **[Wagmi & ConnectKit](https://wagmi.sh/)** - Web3 Hooks and Wallet Connection
- **[OpenRouter](https://openrouter.ai/)** - Unified AI API Routing
- **[Hardhat](https://hardhat.org/)** - Ethereum Development Environment
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[GSAP](https://gsap.com/) & [Framer Motion](https://www.framer.com/motion/)** - Advanced UI Animations

---

<div align="center">
  <p>Built for the future of decentralized trust.</p>
</div>
