import { ethers } from "hardhat";

import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../apps/oracle/.env.local") });

/**
 * Setup script: creates campaign #1 and funds it to its goal.
 * Run after deploying.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const creator = deployer;
  const contributor = deployer;

  const CONTRACT_ADDRESS = process.env.DEPOSIT_ESCROW_ADDRESS;
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Missing DEPOSIT_ESCROW_ADDRESS in apps/oracle/.env.local");
  }

  const escrow = await ethers.getContractAt("DepositEscrow", CONTRACT_ADDRESS);

  console.log("\n📋 Setting up test campaign...");
  console.log(`   Creator/Contributor : ${creator.address}`);

  // Create campaign: 0.01 ETH goal, 24 hour deadline, 3 tranches [30, 30, 40]
  const goal = ethers.parseEther("0.01");
  const duration = 86400; // 24 hours in seconds
  const tranches = [30, 30, 40];

  console.log("   Submitting createCampaign transaction...");
  const createTx = await escrow.connect(creator).createCampaign(goal, duration, tranches);
  await createTx.wait();
  console.log("✅ Campaign #1 created (goal: 0.01 ETH, tranches: 30/30/40%)");

  // Fund the campaign to meet the 0.01 ETH goal
  console.log("   Submitting fund transaction...");
  const fundTx = await escrow.connect(contributor).fund(1, { value: goal });
  await fundTx.wait();
  console.log("✅ Campaign #1 fully funded (0.01 ETH)");

  const campaign = await escrow.campaigns(1);
  console.log(`\n📊 Campaign State:`);
  console.log(`   Total Funded : ${ethers.formatEther(campaign.totalFunded)} ETH`);
  console.log(`   Goal         : ${ethers.formatEther(campaign.goal)} ETH`);
  console.log(`   Milestone    : ${campaign.currentMilestone} / ${tranches.length}`);
  console.log(`   Is Failed    : ${campaign.isFailed}`);
  console.log(`   Is Completed : ${campaign.isCompleted}`);

  console.log(`\n🎯 Ready! POST to http://localhost:3002/api/verify-milestone with:`);
  console.log(JSON.stringify({ campaignId: 1, originalPromise: "Build a web3 wallet connect button", evidenceLink: "https://github.com/rainbow-me/rainbowkit" }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
