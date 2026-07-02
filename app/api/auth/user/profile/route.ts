import { NextRequest, NextResponse } from "next/server";
import { generateToken, verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
    try{
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if(!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const payload = verifyToken(token);
        if(!payload) {
            return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
        }
        const { name, email } = await req.json();
        if(!name || !email || name.length < 2 || !email.includes("@")) {
            return NextResponse.json({ message: "Invalid name or email" }, { status: 400 });
        }
        const client = await clientPromise;
        const db = client.db("note-of-life");
        const result = await db.collection("users").updateOne(
            {email : payload.email},
            {$set: {name, email}}
        )
        if(result.modifiedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        const newToken = generateToken({ email, password: payload.password, name });
        return NextResponse.json({ message: "Profile updated successfully", token: newToken }, { status: 200 });
    }catch(error){
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if(!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const payload = verifyToken(token);
        if(!payload) {
            return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
        }
        const client = await clientPromise;
        const db = client.db("note-of-life");
        const result = await db.collection("users").deleteOne({ email: payload.email });
        if(result.deletedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
    } catch(error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

