import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createEntry, getEntriesByUser } from "@/lib/model/Note";
import { encrypt, encryptArray, decrypt, decryptArray } from "@/lib/encryption";

// ─── POST: Create a new entry (encrypt) ───────────────────────
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

        // Encrypt the fields
        const encryptedTitle = encrypt(title.trim());
        const encryptedContent = encrypt(content.trim());
        const encryptedMood = mood ? encrypt(mood) : encrypt("neutral");
        const encryptedTags = tags ? encryptArray(tags) : [];

        const entry = await createEntry({
            email: payload.email,
            title: encryptedTitle,
            content: encryptedContent,
            mood: encryptedMood,
            tags: encryptedTags,
            date: date || new Date().toISOString(),
        });

        // Return the entry without decrypting (we don't need to send back encrypted)
        // But we can decrypt for the response, or just send a success message.
        // We'll send a decrypted version for immediate display if needed.
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

// ─── GET: Fetch all entries for the user (decrypt) ────────────
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

        const entries = await getEntriesByUser(payload.email);

        // Decrypt each entry
        const decryptedEntries = entries.map(entry => ({
            ...entry,
            title: decrypt(entry.title),
            content: decrypt(entry.content),
            mood: decrypt(entry.mood),
            tags: decryptArray(entry.tags),
        }));

        return NextResponse.json({ entries: decryptedEntries });
    } catch (error) {
        console.error("Get entries error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}