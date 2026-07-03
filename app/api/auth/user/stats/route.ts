import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { decrypt } from "@/lib/encryption"; // 👈 import decryption helper

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

    // Verify user exists
    const user = await db.collection("users").findOne({ email: payload.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Query entries by email
    const entries = await db
      .collection("entries")
      .find({ email: payload.email })
      .toArray();

    const totalEntries = entries.length;

    // ─── Decrypt moods and count ──────────────────────────────
    const moodCounts: Record<string, number> = {};
    for (const entry of entries) {
      let mood = entry.mood || "neutral";
      try {
        // Attempt decryption – if it fails, keep the raw value
        mood = decrypt(mood);
      } catch {
        // If decryption fails, mood remains as is (maybe already plain text)
        // We'll just keep it.
      }
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }

    const totalMoods = Object.keys(moodCounts).length;
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

    // ─── Calculate streak ──────────────────────────────────────
    let streak = 0;
    if (entries.length > 0) {
      // Get unique dates
      const dates = entries
        .map((entry) => new Date(entry.date).toDateString())
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const today = new Date().toDateString();
      let currentDate = today;

      // Check if there's an entry today
      if (dates.includes(today)) {
        streak++;
        // Move to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        currentDate = yesterday.toDateString();

        while (dates.includes(currentDate)) {
          streak++;
          const prevDate = new Date(currentDate);
          prevDate.setDate(prevDate.getDate() - 1);
          currentDate = prevDate.toDateString();
        }
      } else {
        // Check if there's an entry yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        if (dates.includes(yesterdayStr)) {
          streak++;
          const prevDate = new Date(yesterdayStr);
          prevDate.setDate(prevDate.getDate() - 1);
          currentDate = prevDate.toDateString();

          while (dates.includes(currentDate)) {
            streak++;
            const prevDateObj = new Date(currentDate);
            prevDateObj.setDate(prevDateObj.getDate() - 1);
            currentDate = prevDateObj.toDateString();
          }
        }
      }
    }

    return NextResponse.json({
      totalEntries,
      totalMoods,
      topMood,
      streak,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}