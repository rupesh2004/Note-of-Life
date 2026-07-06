import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { decrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("note-of-life");

        // ─── Latest entry ──────────────────────────────────────────
        const latestEntry = await db
            .collection("entries")
            .find({ email: payload.email })
            .sort({ date: -1 })
            .limit(1)
            .toArray();

        let entryData = null;
        if (latestEntry.length > 0) {
            const entry = latestEntry[0];
            const decryptedContent = decrypt(entry.content);
            entryData = {
                _id: entry._id.toString(), // ✅ added for the read‑more link
                title: decrypt(entry.title),
                contentPreview: decryptedContent.slice(0, 80) + (decryptedContent.length > 80 ? "..." : ""),
                mood: decrypt(entry.mood),
                date: entry.date,
            };
        }

        // ─── Streak ──────────────────────────────────────────────
        const allEntries = await db
            .collection("entries")
            .find({ email: payload.email })
            .project({ date: 1 })
            .sort({ date: -1 })
            .toArray();

        let streak = 0;
        if (allEntries.length > 0) {
            const dates = allEntries.map(e => new Date(e.date).toDateString());
            const uniqueDates = [...new Set(dates)];
            const today = new Date().toDateString();
            let currentDate = new Date();

            if (uniqueDates.includes(today)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
                while (uniqueDates.includes(currentDate.toDateString())) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                }
            } else {
                currentDate.setDate(currentDate.getDate() - 1);
                if (uniqueDates.includes(currentDate.toDateString())) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                    while (uniqueDates.includes(currentDate.toDateString())) {
                        streak++;
                        currentDate.setDate(currentDate.getDate() - 1);
                    }
                }
            }
        }

        // ─── Insights (entries in last 7 days) ────────────────────
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const insightsCount = await db
            .collection("entries")
            .countDocuments({
                email: payload.email,
                date: { $gte: oneWeekAgo.toISOString() }
            });

        // ─── Current date/time ────────────────────────────────────
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return NextResponse.json({
            latestEntry: entryData,
            streak,
            insightsCount,
            currentDate: `${dateStr} at ${timeStr}`,
            mood: entryData?.mood || "neutral",
        });
    } catch (error) {
        console.error("Card data error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}