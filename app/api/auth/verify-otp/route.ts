import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    const record = otpStore.get(email);
    if (!record) {
      return NextResponse.json({ message: "OTP not found" }, { status: 401 });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return NextResponse.json({ message: "OTP expired" }, { status: 401 });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    // OTP is valid – remove it so it can't be reused
    otpStore.delete(email);

    return NextResponse.json({ message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}