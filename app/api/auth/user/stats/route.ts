import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("note-of-life");
    const user = await db.collection("users").findOne({ email: payload.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const entries = await db.collection("entries").find({ userEmail: payload.email }).toArray();
    const totalEntries = entries.length;
    const moodCounts = entries.reduce((acc, entry) => {
      const mood = entry.mood || "neutral";
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

    return NextResponse.json({
      totalEntries,
      totalMoods: Object.keys(moodCounts).length,
      topMood,
      streak: 0,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
