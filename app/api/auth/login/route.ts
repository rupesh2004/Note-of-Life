import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/model/User";
import { generateToken } from "@/lib/auth";   // ✅ use generateToken (or signToken if you added the alias)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        const existingUser = await getUserByEmail(email);
        if (!existingUser) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // ─── OAuth users don't have a password ─────────────────────
        if (!existingUser.password) {
            return NextResponse.json(
                { message: "This account uses Google or GitHub. Please log in with that provider." },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const token = generateToken({
            email: existingUser.email,
            name: existingUser.name,
            // password is optional, don't include it
        });

        return NextResponse.json({
            success: true,
            token,
            user: { name: existingUser.name, email: existingUser.email },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}