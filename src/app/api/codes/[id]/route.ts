import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// Verify admin authorization header
function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get("x-admin-password");
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === adminPass;
}

// Delete a code from the database
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = params.id;
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("codes").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Code deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
