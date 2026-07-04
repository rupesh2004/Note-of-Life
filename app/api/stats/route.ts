import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db("note-of-life");

        let totalUsers = 0;
        let totalEntries = 0;

        try {
            totalUsers = await db.collection("users").countDocuments();
        } catch {}

        try {
            totalEntries = await db.collection("entries").countDocuments();
        } catch {}

        return NextResponse.json({ totalUsers, totalEntries });
    } catch (error: any) {
        console.error("Stats API error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}