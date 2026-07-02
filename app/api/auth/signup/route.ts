import { generateToken } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/model/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest) {
    try{
        const body = await req.json();
        const {name, email, password} = body;
        if(!name || !email || !password){
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
        if(existingUser){
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        }
        await createUser(newUser);
        
        const token = generateToken({ email, password: hashedPassword, name });
        return NextResponse.json({
            message: "User created successfully",
            success: true,
            token,
            user: {
                name,
                email
            }
        })
    }catch(error){
        console.error("Error in signup route:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}