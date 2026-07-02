import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    const body = await req.json();
    const dailyReminder = body?.dailyReminder;

    if (typeof dailyReminder !== "boolean") {
      return NextResponse.json({ message: "Invalid setting" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("note-of-life");
    const result = await db.collection("users").updateOne(
      { email: payload.email },
      { $set: { dailyReminder } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Daily reminder preference saved" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
