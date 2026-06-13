import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// File-based database to store connected wallets at the root of apps/web
const FILE_PATH = path.join(process.cwd(), "connected-wallets.json");

interface ConnectedWallet {
  address: string;
  firstConnected: string;
  lastConnected: string;
  connectionCount: number;
}

/**
 * Read wallets from JSON file database safely
 */
function readWallets(): ConnectedWallet[] {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading wallets file database:", error);
    return [];
  }
}

/**
 * Write wallets to JSON file database safely
 */
function writeWallets(wallets: ConnectedWallet[]) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(wallets, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing wallets file database:", error);
  }
}

/**
 * GET: Retrieves the list of all connected wallets.
 * Restricts access to the admin wallet: 0x68d0f9286195723e56429ed09F50966f4344b5B7
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminAddress = searchParams.get("adminAddress")?.toLowerCase();

    const AUTHORIZED_ADMIN = "0x68d0f9286195723e56429ed09F50966f4344b5B7".toLowerCase();

    // Verify requesting address
    if (!adminAddress || adminAddress !== AUTHORIZED_ADMIN) {
      return NextResponse.json(
        { error: "Access Denied: You are not authorized to view this data." },
        { status: 403 }
      );
    }

    const wallets = readWallets();
    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Error inside GET /api/wallets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST: Records a new wallet connection event.
 * If the address exists, increments the connection count and updates the timestamp.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = body.address?.toLowerCase();

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    const wallets = readWallets();
    const existingIndex = wallets.findIndex((w) => w.address.toLowerCase() === address);
    const now = new Date().toISOString();

    if (existingIndex > -1) {
      // Update existing wallet stats
      wallets[existingIndex].lastConnected = now;
      wallets[existingIndex].connectionCount += 1;
    } else {
      // Add new wallet entry
      wallets.push({
        address,
        firstConnected: now,
        lastConnected: now,
        connectionCount: 1,
      });
    }

    writeWallets(wallets);
    return NextResponse.json({ success: true, count: wallets.length });
  } catch (error) {
    console.error("Error inside POST /api/wallets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
