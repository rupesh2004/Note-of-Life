import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb"; // ✅ Added missing import
import { encrypt, encryptArray, decrypt, decryptArray } from "@/lib/encryption"; // Adjust if you don't use encryption

// ─── POST: Save a new entry ──────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const { title, content, mood, tags, date } = await req.json();
        if (!title || !content) {
            return NextResponse.json(
                { message: "Title and content are required" },
                { status: 400 }
            );
        }

        // Encrypt fields (skip if you don't use encryption)
        const encryptedTitle = encrypt(title.trim());
        const encryptedContent = encrypt(content.trim());
        const encryptedMood = mood ? encrypt(mood) : encrypt("neutral");
        const encryptedTags = tags ? encryptArray(tags) : [];

        const client = await clientPromise;
        const db = client.db("note-of-life");
        const now = new Date().toISOString();
        const newEntry = {
            email: payload.email,
            title: encryptedTitle,
            content: encryptedContent,
            mood: encryptedMood,
            tags: encryptedTags,
            date: date || now,
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection("entries").insertOne(newEntry);
        const entry = { _id: result.insertedId.toString(), ...newEntry };

        return NextResponse.json({
            message: "Entry saved successfully",
            entry: {
                ...entry,
                title: decrypt(entry.title),
                content: decrypt(entry.content),
                mood: decrypt(entry.mood),
                tags: decryptArray(entry.tags),
            }
        });
    } catch (error) {
        console.error("Save entry error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── GET: Fetch all entries ──────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("note-of-life");
        const entries = await db
            .collection("entries")
            .find({ email: payload.email })
            .sort({ date: -1 })
            .toArray();

        const decrypted = entries.map((entry) => ({
            _id: entry._id.toString(),
            email: entry.email,
            title: decrypt(entry.title),
            content: decrypt(entry.content),
            mood: decrypt(entry.mood),
            tags: decryptArray(entry.tags),
            date: entry.date,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        }));

        return NextResponse.json({ entries: decrypted });
    } catch (error) {
        console.error("Get entries error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── DELETE: Remove all entries for the authenticated user ──
export async function DELETE(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const client = await clientPromise; // ✅ Now clientPromise is defined
        const db = client.db("note-of-life");
        const result = await db.collection("entries").deleteMany({ email: payload.email });

        return NextResponse.json({
            message: `Deleted ${result.deletedCount} entries`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Delete all entries error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}