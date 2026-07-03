import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getEntryById, updateEntry, deleteEntry } from "@/lib/model/Note";
import { decrypt, decryptArray, encrypt, encryptArray } from "@/lib/encryption";

const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
};

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
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

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json(
                { message: "Entry ID is required" },
                { status: 400 }
            );
        }

        // Check if entry exists and belongs to user
        const existing = await getEntryById(id);
        if (!existing) {
            return NextResponse.json({ message: "Entry not found" }, { status: 404 });
        }
        if (existing.email !== payload.email) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const isEntryToday = isToday(existing.date) || isToday(existing.createdAt);
        if (!isEntryToday) {
            return NextResponse.json(
                { message: "Only today's entries can be updated." },
                { status: 403 }
            );
        }

        // Parse request body
        const { title, content, mood, tags, date } = await req.json();
        if (!title || !content) {
            return NextResponse.json(
                { message: "Title and content are required" },
                { status: 400 }
            );
        }

        // Encrypt fields
        const encryptedTitle = encrypt(title.trim());
        const encryptedContent = encrypt(content.trim());
        const encryptedMood = mood ? encrypt(mood) : encrypt("neutral");
        const encryptedTags = tags ? encryptArray(tags) : [];

        // Update the entry
        const updatedEntry = await updateEntry(id, {
            title: encryptedTitle,
            content: encryptedContent,
            mood: encryptedMood,
            tags: encryptedTags,
            date: date || new Date().toISOString(),
            
        });

        if (!updatedEntry) {
            return NextResponse.json({ message: "Failed to update entry" }, { status: 500 });
        }

        // Return decrypted entry
        return NextResponse.json({
            message: "Entry updated successfully",
            entry: {
                ...updatedEntry,
                title: decrypt(updatedEntry.title),
                content: decrypt(updatedEntry.content),
                mood: decrypt(updatedEntry.mood),
                tags: decryptArray(updatedEntry.tags),
            }
        });
    } catch (error) {
        console.error("Update entry error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
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

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json(
                { message: "Entry ID is required" },
                { status: 400 }
            );
        }

        const entry = await getEntryById(id);
        if (!entry) {
            return NextResponse.json({ message: "Entry not found" }, { status: 404 });
        }

        // Check if the entry belongs to the authenticated user
        if (entry.email !== payload.email) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Decrypt fields before sending to client
        const decrypted = {
            ...entry,
            title: decrypt(entry.title),
            content: decrypt(entry.content),
            mood: decrypt(entry.mood),
            tags: decryptArray(entry.tags),
        };
        return NextResponse.json({ entry: decrypted });
    } catch (error) {
        console.error("Get single entry error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
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

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json(
                { message: "Entry ID is required" },
                { status: 400 }
            );
        }

        const existing = await getEntryById(id);
        if (!existing) {
            return NextResponse.json({ message: "Entry not found" }, { status: 404 });
        }
        if (existing.email !== payload.email) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const deleted = await deleteEntry(id);
        if (!deleted) {
            return NextResponse.json(
                { message: "Failed to delete entry" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Entry deleted successfully" });
    } catch (error) {
        console.error("Delete entry error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}