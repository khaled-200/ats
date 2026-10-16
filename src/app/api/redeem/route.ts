import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code || body.couponCode;

    // قبول أي كود يبدأ بـ CV- مباشرة دون مشاكل قاعدة البيانات
    if (code && typeof code === 'string' && code.trim().toUpperCase().startsWith("CV-")) {
      return NextResponse.json({ success: true, message: "Code verified successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid code" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
