import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const escrow = await ethers.getContractAt("DepositEscrow", contractAddress);
  
  const count = await escrow.campaignCount();
  console.log(`Current campaign count on-chain: ${count.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
