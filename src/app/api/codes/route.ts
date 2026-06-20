import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";

// Helper to verify admin auth header
function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get("x-admin-password");
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === adminPass;
}

// Fetch all codes
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const codes = await db.collection("codes").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ codes });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// Generate new code
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { note } = await req.json();
    
    // Generate a random, easy-to-read coupon code: CV-XXXX-XXXX
    // We avoid confusing letters like I, O, 0, 1
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
    const genBlock = (len: number) => {
      let s = "";
      for (let i = 0; i < len; i++) {
        s += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return s;
    };
    
    const fullCode = `CV-${genBlock(4)}-${genBlock(4)}`;
    const normalized = fullCode.replace(/[^A-Z0-9]/g, "").toUpperCase();

    const client = await clientPromise;
    const db = client.db();

    const newCodeDoc = {
      code: fullCode,
      normalizedCode: normalized,
      isRedeemed: false,
      redeemedAt: null,
      createdAt: new Date(),
      note: note || ""
    };

    await db.collection("codes").insertOne(newCodeDoc);

    return NextResponse.json({ success: true, code: newCodeDoc });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
