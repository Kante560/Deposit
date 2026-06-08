import { expect } from "chai";
import { ethers } from "hardhat";
import { DepositEscrow } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DepositEscrow", function () {
  let escrow: DepositEscrow;
  let owner: SignerWithAddress;
  let oracle: SignerWithAddress;
  let creator: SignerWithAddress;
  let contributor1: SignerWithAddress;
  let contributor2: SignerWithAddress;
  let newOracle: SignerWithAddress;

  const GOAL = ethers.parseEther("10"); // 10 ETH goal
  const DURATION = 3600; // 1 hour duration
  const TRANCHES = [30, 30, 40]; // 30%, 30%, 40% payouts

  beforeEach(async function () {
    [owner, oracle, creator, contributor1, contributor2, newOracle] = await ethers.getSigners();

    const DepositEscrowFactory = await ethers.getContractFactory("DepositEscrow");
    escrow = await DepositEscrowFactory.deploy(oracle.address);
    await escrow.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner and AI Oracle", async function () {
      expect(await escrow.owner()).to.equal(owner.address);
      expect(await escrow.aiOracle()).to.equal(oracle.address);
    });

    it("Should fail if initialized with zero address for Oracle", async function () {
      const DepositEscrowFactory = await ethers.getContractFactory("DepositEscrow");
      await expect(DepositEscrowFactory.deploy(ethers.ZeroAddress)).to.be.revertedWith(
        "DepositEscrow: Invalid Oracle address"
      );
    });
  });

  describe("createCampaign", function () {
    it("Should successfully create a campaign with valid inputs", async function () {
      const tx = await escrow.connect(creator).createCampaign(GOAL, DURATION, TRANCHES);
      await expect(tx).to.emit(escrow, "CampaignCreated");

      const campaign = await escrow.campaigns(1);
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.goal).to.equal(GOAL);
      expect(campaign.totalFunded).to.equal(0);
      expect(campaign.currentMilestone).to.equal(0);
      expect(campaign.isFailed).to.be.false;
      expect(campaign.isCompleted).to.be.false;
    });

    it("Should fail if goal is zero", async function () {
      await expect(escrow.connect(creator).createCampaign(0, DURATION, TRANCHES)).to.be.revertedWith(
        "DepositEscrow: Goal must be greater than zero"
      );
    });

    it("Should fail if duration is zero", async function () {
      await expect(escrow.connect(creator).createCampaign(GOAL, 0, TRANCHES)).to.be.revertedWith(
        "DepositEscrow: Duration must be greater than zero"
      );
    });

    it("Should fail if tranches don't sum to 100", async function () {
      await expect(
        escrow.connect(creator).createCampaign(GOAL, DURATION, [30, 30, 30])
      ).to.be.revertedWith("DepositEscrow: Milestone percentages must equal 100");
    });
  });

  describe("fund", function () {
    beforeEach(async function () {
      await escrow.connect(creator).createCampaign(GOAL, DURATION, TRANCHES);
    });

    it("Should allow funding a campaign and track contributions", async function () {
      const amount = ethers.parseEther("4");
      const tx = await escrow.connect(contributor1).fund(1, { value: amount });
      await expect(tx).to.emit(escrow, "Funded").withArgs(1, contributor1.address, amount);

      const campaign = await escrow.campaigns(1);
      expect(campaign.totalFunded).to.equal(amount);

      const contribution = await escrow.contributions(1, contributor1.address);
      expect(contribution).to.equal(amount);
    });

    it("Should fail if contribution is zero", async function () {
      await expect(escrow.connect(contributor1).fund(1, { value: 0 })).to.be.revertedWith(
        "DepositEscrow: Contribution must be greater than zero"
      );
    });

    it("Should fail if deadline has passed", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        escrow.connect(contributor1).fund(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("DepositEscrow: Campaign funding window has passed");
    });
  });

  describe("approveMilestone", function () {
    beforeEach(async function () {
      await escrow.connect(creator).createCampaign(GOAL, DURATION, TRANCHES);
    });

    it("Should fail if called by non-Oracle", async function () {
      await expect(escrow.connect(creator).approveMilestone(1, true)).to.be.revertedWith(
        "DepositEscrow: Caller is not the authorized AI Oracle"
      );
    });

    it("Should fail if campaign has not reached its goal", async function () {
      await escrow.connect(contributor1).fund(1, { value: ethers.parseEther("5") });
      await expect(escrow.connect(oracle).approveMilestone(1, true)).to.be.revertedWith(
        "DepositEscrow: Campaign did not reach its funding goal"
      );
    });

    describe("With Campaign Met Goal", function () {
      beforeEach(async function () {
        await escrow.connect(contributor1).fund(1, { value: ethers.parseEther("10") });
      });

      it("Should payout correct tranches on approval", async function () {
        // Milestone 1: 30% of 10 ETH = 3 ETH
        const expectedPayout1 = ethers.parseEther("3");
        const tx1 = escrow.connect(oracle).approveMilestone(1, true);
        await expect(tx1).to.emit(escrow, "MilestoneApproved").withArgs(1, 0, expectedPayout1);
        await expect(tx1).to.changeEtherBalances([creator, escrow], [expectedPayout1, -expectedPayout1]);

        let campaign = await escrow.campaigns(1);
        expect(campaign.currentMilestone).to.equal(1);
        expect(campaign.isCompleted).to.be.false;

        // Milestone 2: 30% of 10 ETH = 3 ETH
        const expectedPayout2 = ethers.parseEther("3");
        const tx2 = escrow.connect(oracle).approveMilestone(1, true);
        await expect(tx2).to.emit(escrow, "MilestoneApproved").withArgs(1, 1, expectedPayout2);
        await expect(tx2).to.changeEtherBalances([creator, escrow], [expectedPayout2, -expectedPayout2]);

        campaign = await escrow.campaigns(1);
        expect(campaign.currentMilestone).to.equal(2);
        expect(campaign.isCompleted).to.be.false;

        // Milestone 3: 40% of 10 ETH = 4 ETH
        const expectedPayout3 = ethers.parseEther("4");
        const tx3 = escrow.connect(oracle).approveMilestone(1, true);
        await expect(tx3).to.emit(escrow, "MilestoneApproved").withArgs(1, 2, expectedPayout3);
        await expect(tx3).to.changeEtherBalances([creator, escrow], [expectedPayout3, -expectedPayout3]);

        campaign = await escrow.campaigns(1);
        expect(campaign.currentMilestone).to.equal(3);
        expect(campaign.isCompleted).to.be.true;
      });

      it("Should fail if Oracle rejects the milestone (triggering refund state)", async function () {
        await expect(escrow.connect(oracle).approveMilestone(1, false))
          .to.emit(escrow, "CampaignFailed")
          .withArgs(1, "AI Oracle rejected milestone evidence execution");

        const campaign = await escrow.campaigns(1);
        expect(campaign.isFailed).to.be.true;
      });
    });
  });

  describe("claimRefund", function () {
    beforeEach(async function () {
      await escrow.connect(creator).createCampaign(GOAL, DURATION, TRANCHES);
    });

    it("Should allow refund if campaign missed funding goal and deadline passed", async function () {
      await escrow.connect(contributor1).fund(1, { value: ethers.parseEther("5") });

      // Increase time past deadline
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      const refundAmount = ethers.parseEther("5");
      const txRefund1 = escrow.connect(contributor1).claimRefund(1);
      await expect(txRefund1).to.emit(escrow, "RefundClaimed").withArgs(1, contributor1.address, refundAmount);
      await expect(txRefund1).to.changeEtherBalances([contributor1, escrow], [refundAmount, -refundAmount]);
    });

    it("Should allow refund if campaign met funding goal but Oracle rejected milestone", async function () {
      await escrow.connect(contributor1).fund(1, { value: ethers.parseEther("10") });

      // Oracle rejects first milestone
      await escrow.connect(oracle).approveMilestone(1, false);

      const refundAmount = ethers.parseEther("10");
      const txRefund2 = escrow.connect(contributor1).claimRefund(1);
      await expect(txRefund2).to.emit(escrow, "RefundClaimed").withArgs(1, contributor1.address, refundAmount);
      await expect(txRefund2).to.changeEtherBalances([contributor1, escrow], [refundAmount, -refundAmount]);
    });

    it("Should fail if campaign not eligible for refund", async function () {
      await escrow.connect(contributor1).fund(1, { value: ethers.parseEther("5") });

      // Goal is not met, but deadline is NOT yet reached
      await expect(escrow.connect(contributor1).claimRefund(1)).to.be.revertedWith(
        "DepositEscrow: Campaign not eligible for refunds"
      );
    });

    it("Should prevent double-claiming refunds", async function () {
      await escrow.connect(contributor1).fund(1, { value: ethers.parseEther("5") });

      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      await escrow.connect(contributor1).claimRefund(1);

      await expect(escrow.connect(contributor1).claimRefund(1)).to.be.revertedWith(
        "DepositEscrow: No outstanding contributions found"
      );
    });
  });

  describe("updateOracle", function () {
    it("Should allow owner to update Oracle", async function () {
      await escrow.connect(owner).updateOracle(newOracle.address);
      expect(await escrow.aiOracle()).to.equal(newOracle.address);
    });

    it("Should fail if non-owner tries to update Oracle", async function () {
      await expect(escrow.connect(creator).updateOracle(newOracle.address))
        .to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount")
        .withArgs(creator.address);
    });

    it("Should fail if owner updates to zero address", async function () {
      await expect(escrow.connect(owner).updateOracle(ethers.ZeroAddress)).to.be.revertedWith(
        "DepositEscrow: Invalid address"
      );
    });
  });
});
