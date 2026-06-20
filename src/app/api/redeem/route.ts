import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const normalize = (c: string) => c.replace(/[^A-Z0-9]/ig, "").toUpperCase();
    const normalizedInput = normalize(code);

    // Backup feature: Admin password acts as a master unlock code for easy testing/support
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    if (normalizedInput === normalize(adminPass)) {
      return NextResponse.json({ success: true, message: "Unlocked with master override!" });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db();

    // Look for an active, unused code
    const existingCode = await db.collection("codes").findOne({
      normalizedCode: normalizedInput,
      isRedeemed: false
    });

    if (!existingCode) {
      return NextResponse.json({ error: "Invalid code or code already used. Please contact support." }, { status: 400 });
    }

    // Mark code as used
    await db.collection("codes").updateOne(
      { _id: existingCode._id },
      {
        $set: {
          isRedeemed: true,
          redeemedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true, message: "Success! Downloads unlocked." });
  } catch (error: any) {
    console.error("Redeem API Error:", error);
    return NextResponse.json({ error: "Database error or server error" }, { status: 500 });
  }
}
