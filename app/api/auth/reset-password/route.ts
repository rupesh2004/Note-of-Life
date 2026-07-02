import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    try {
        const { email, newPassword } = await req.json();
        if (!email || !newPassword) {
            return NextResponse.json({ message: "Email and new password are required" }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("note-of-life");

        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Hash and update password
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.collection("users").updateOne(
            { email },
            { $set: { password: hashed } }
        );

        // (Optional) also remove any lingering OTP from memory
        // We can't access the store here easily – but the OTP was already deleted on verification.

        return NextResponse.json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}