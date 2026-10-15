import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const codes = await db.collection("codes").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ codes });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let note = "Client Code";
    try {
      const body = await req.json();
      if (body && body.note) note = body.note;
    } catch (e) {}

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomCode = "CV-";
    for (let i = 0; i < 8; i++) {
      randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newCode = {
      code: randomCode,
      note: note,
      isUsed: false,
      createdAt: new Date().toISOString(),
    };

    const client = await clientPromise;
    const db = client.db();
    await db.collection("codes").insertOne(newCode);

    return NextResponse.json({ success: true, code: newCode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
