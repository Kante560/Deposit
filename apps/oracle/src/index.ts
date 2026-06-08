import express, { Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import * as path from "path";
import { ethers } from "ethers";
import OpenAI from "openai";

// ─── Load ABI from shared workspace ──────────────────────────────────────────
import { DepositEscrowABI } from "@deposit/contracts";

// ─── Load .env.local from the apps/oracle root (one level up from src/) ───────
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ─── Validate required environment variables at startup ──────────────────────
const REQUIRED_ENV = ["AI_API_KEY", "ORACLE_PRIVATE_KEY", "RPC_URL", "DEPOSIT_ESCROW_ADDRESS"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const PORT = parseInt(process.env.PORT ?? "3002", 10);
const { AI_API_KEY, ORACLE_PRIVATE_KEY, RPC_URL, DEPOSIT_ESCROW_ADDRESS } = process.env as Record<string, string>;

// ─── Warn if using placeholder contract address ───────────────────────────────
if (DEPOSIT_ESCROW_ADDRESS === "0x0000000000000000000000000000000000000000") {
  console.warn("⚠️  DEPOSIT_ESCROW_ADDRESS is a placeholder. Deploy the contract and update .env.local.");
}

// ─── Blockchain setup: provider, signer wallet, contract instance ─────────────
const provider = new ethers.JsonRpcProvider(RPC_URL);
const oracleWallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
const escrowContract = new ethers.Contract(DEPOSIT_ESCROW_ADDRESS, DepositEscrowABI, oracleWallet);

// ─── OpenAI client ────────────────────────────────────────────────────────────
// If the key starts with 'sk-or-', configure for OpenRouter, otherwise default to standard OpenAI
const isOpenRouter = AI_API_KEY.startsWith("sk-or-");
const openai = new OpenAI({
  apiKey: AI_API_KEY,
  baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
});

const aiModel = process.env.AI_MODEL_NAME || "gpt-4o";

// ─── Express app setup ────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cors());

// ─── Health check endpoint ────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    oracle: oracleWallet.address,
    contract: DEPOSIT_ESCROW_ADDRESS,
    rpc: RPC_URL,
    model: aiModel,
  });
});

// ─── POST /api/verify-milestone ───────────────────────────────────────────────
/**
 * Accepts a campaignId, originalPromise, and evidenceLink.
 * Sends both to the AI auditor for evaluation, then:
 *   - PASS → calls approveMilestone(campaignId, true) on-chain → returns tx hash.
 *   - FAIL → calls approveMilestone(campaignId, false) on-chain (flags for refunds) → returns 400 with reason.
 */
app.post("/api/verify-milestone", async (req: Request, res: Response) => {
  const { campaignId, originalPromise, evidenceLink } = req.body;

  // ── Input validation ─────────────────────────────────────────────────────
  if (!campaignId || !originalPromise || !evidenceLink) {
    res.status(400).json({
      error: "Missing required fields: campaignId, originalPromise, evidenceLink",
    });
    return;
  }

  console.log(`\n🔍 Verifying milestone for campaign #${campaignId}`);
  console.log(`   Promise : ${originalPromise}`);
  console.log(`   Evidence: ${evidenceLink}`);

  // ── AI Evaluation ────────────────────────────────────────────────────────
  let aiStatus: "PASS" | "FAIL";
  let aiReason: string;

  // MOCK_AI=true bypasses the real OpenAI call for local end-to-end testing.
  // Remove or set to false when using a live API key with sufficient quota.
  if (process.env.MOCK_AI === "true") {
    console.log("🧪 MOCK_AI mode enabled — skipping real OpenAI call, returning PASS");
    aiStatus = "PASS";
    aiReason = "[MOCK] Evidence link references a matching implementation. Milestone approved for local testing.";
  } else {
    try {
      const completion = await openai.chat.completions.create({
        model: aiModel,
        messages: [
          {
            role: "system",
            content: `You are a decentralized technical auditor for Web3 crowdfunding milestones.
Your task is to verify if the campaign creator has fulfilled the milestone described in the "originalPromise" by reviewing the "evidenceLink".

Rules:
- Assume the evidence link is accessible and contains relevant code, UI screenshots, or written proof.
- If the evidence URL relates to a GitHub repository, assume it contains code matching the promise.
- Be strict but fair — partial implementations should FAIL.
- You MUST output ONLY valid raw JSON in this exact format, with no markdown formatting, no backticks, and no extra text:
{
  "status": "PASS" or "FAIL",
  "reason": "Detailed justification"
}`,
          },
          {
            role: "user",
            content: JSON.stringify({ originalPromise, evidenceLink }),
          },
        ],
      });

      let rawContent = completion.choices[0]?.message?.content ?? "{}";
      
      // Strip markdown code blocks if the model ignored the system prompt
      rawContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
      
      const parsed = JSON.parse(rawContent) as { status: string; reason: string };

      if (parsed.status !== "PASS" && parsed.status !== "FAIL") {
        throw new Error(`Unexpected AI status value: "${parsed.status}"`);
      }

      aiStatus = parsed.status as "PASS" | "FAIL";
      aiReason = parsed.reason ?? "No reason provided.";
      console.log(`🤖 AI verdict (${aiModel}): ${aiStatus} — ${aiReason}`);
    } catch (err) {
      console.error("❌ AI evaluation error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: "AI evaluation failed. Please try again.", details: errorMessage });
      return;
    }
  }

  // ── Blockchain Transaction ────────────────────────────────────────────────
  const isApproved = aiStatus === "PASS";

  try {
    console.log(`⛓️  Submitting approveMilestone(${campaignId}, ${isApproved}) to contract...`);
    const tx = await escrowContract.approveMilestone(BigInt(campaignId), isApproved);
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);

    if (isApproved) {
      // PASS: milestone funds released to creator
      res.status(200).json({
        status: "PASS",
        reason: aiReason,
        transactionHash: receipt.hash,
        message: "Milestone approved. Funds have been released to the campaign creator.",
      });
    } else {
      // FAIL: campaign flagged for contributor refunds
      res.status(400).json({
        status: "FAIL",
        reason: aiReason,
        transactionHash: receipt.hash,
        message: "Milestone rejected. Campaign has been flagged — contributors may now claim refunds.",
      });
    }
  } catch (err: unknown) {
    console.error("❌ Blockchain transaction error:", err);

    // Surface clean error messages from contract reverts
    const message = err instanceof Error ? err.message : "Unknown blockchain error";
    res.status(500).json({
      error: "Blockchain transaction failed.",
      details: message,
    });
  }
});

// ─── Start server (Local Dev Only) ────────────────────────────────────────────
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Deposit Oracle running on http://localhost:${PORT}`);
    console.log(`   Oracle wallet : ${oracleWallet.address}`);
    console.log(`   Contract      : ${DEPOSIT_ESCROW_ADDRESS}`);
    console.log(`   RPC endpoint  : ${RPC_URL}`);
    console.log(`   AI model      : ${aiModel}`);
    console.log(`\n📡 POST http://localhost:${PORT}/api/verify-milestone`);
  });
}

export default app;
