import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    // ─── Protect the cron with a secret ──────────────────────────
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("note-of-life");

        // ─── Get all users with daily reminder enabled ────────────
        const users = await db
            .collection("users")
            .find({ "settings.dailyReminder": true })
            .toArray();

        let sent = 0, failed = 0;

        // ─── For each user, call the existing notification route ──
        for (const user of users) {
            try {
                const response = await fetch(
                    `${process.env.NEXTAUTH_URL}/api/notifications/daily-reminder`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: user.email, name: user.name }),
                    }
                );
                if (response.ok) sent++;
                else failed++;
            } catch {
                failed++;
            }
        }

        return NextResponse.json({ success: true, sent, failed, total: users.length });
    } catch (error) {
        console.error("Cron error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}