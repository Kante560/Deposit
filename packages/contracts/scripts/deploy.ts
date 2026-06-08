import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deployment script for DepositEscrow.
 *
 * Usage (local Hardhat node):
 *   npx --no-install hardhat run scripts/deploy.ts --network localhost
 *
 * The script deploys with Account #0 as BOTH the deployer/owner AND the aiOracle.
 * This means the local Oracle backend (using Account #0 private key) can call approveMilestone().
 *
 * After deployment, it automatically patches DEPOSIT_ESCROW_ADDRESS in apps/oracle/.env.local.
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`\n🚀 Deploying DepositEscrow...`);
  console.log(`   Deployer / Oracle: ${deployer.address}`);
  console.log(`   Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy: set deployer as the aiOracle so the local Oracle wallet can call approveMilestone()
  const DepositEscrow = await ethers.getContractFactory("DepositEscrow");
  const escrow = await DepositEscrow.deploy(deployer.address);
  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  console.log(`✅ DepositEscrow deployed at: ${contractAddress}`);

  // ── Auto-patch apps/oracle/.env.local ─────────────────────────────────────
  const envPath = path.resolve(__dirname, "../../../apps/oracle/.env.local");

  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");

    if (envContent.includes("DEPOSIT_ESCROW_ADDRESS=")) {
      // Replace existing value
      envContent = envContent.replace(
        /DEPOSIT_ESCROW_ADDRESS=.*/,
        `DEPOSIT_ESCROW_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nDEPOSIT_ESCROW_ADDRESS=${contractAddress}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`\n📝 Auto-patched DEPOSIT_ESCROW_ADDRESS in apps/oracle/.env.local`);
  } else {
    console.log(`\n⚠️  apps/oracle/.env.local not found. Manually set:`);
    console.log(`   DEPOSIT_ESCROW_ADDRESS=${contractAddress}`);
  }

  console.log(`\n🎉 Deployment complete!`);
  console.log(`   Contract : ${contractAddress}`);
  console.log(`   Oracle   : ${deployer.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
