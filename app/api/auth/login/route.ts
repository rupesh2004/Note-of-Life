import { generateToken } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/model/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest) {
    try{
        const body = await req.json();
        const { email, password} = body;
        if(!email || !password){
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }
        if(password.length < 8){
            return NextResponse.json(
                { message: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }
        const existingUser = await getUserByEmail(email);
        if(!existingUser){
            return NextResponse.json(
                { message: "User does not exist" },
                { status: 400 }
            );
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordValid){
            return NextResponse.json(
                { message: "Invalid password" },
                { status: 400 }
            );
        }
        const token = generateToken({ email, password: existingUser.password, name: existingUser.name });
        return NextResponse.json({
            message: "Login successful",
            success: true,
            token,
            user: {
                name: existingUser.name,
                email: existingUser.email
            }
        })
    }catch(error){
        console.error("Error in login route:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}