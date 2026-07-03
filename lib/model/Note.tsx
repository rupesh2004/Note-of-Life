import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface Entry {
    _id?: string;          // ✅ lowercase 'string'
    email: string;         // ✅ lowercase 'string'
    title: string;         // ✅ lowercase 'string'
    content: string;       // ✅ lowercase 'string'
    mood: string;          // ✅ lowercase 'string'
    tags: string[];        // ✅ lowercase 'string'
    date: string;          // ✅ lowercase 'string'
    createdAt: string;     // ✅ lowercase 'string'
    updatedAt?: string;    // ✅ lowercase 'string'
}

// ─── Create entry ──────────────────────────────────────────────
export async function createEntry(entryData: Omit<Entry, "_id" | "createdAt" | "updatedAt">): Promise<Entry> {
    const client = await clientPromise;
    const db = client.db("note-of-life");

    const now = new Date().toISOString();
    const newEntry = {
        ...entryData,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db.collection("entries").insertOne(newEntry);
    return { _id: result.insertedId.toString(), ...newEntry };
}

// ─── Get entries by user ──────────────────────────────────────
export async function getEntriesByUser(email: string): Promise<Entry[]> {
    const client = await clientPromise;
    const db = client.db("note-of-life");

    const entries = await db
        .collection("entries")
        .find({ email })
        .sort({ date: -1 })
        .toArray();

    return entries.map((entry) => ({
        _id: entry._id.toString(),
        email: entry.email,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || [],
        date: entry.date,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
    }));
}

// ─── Get single entry by ID ──────────────────────────────────
export async function getEntryById(id: string): Promise<Entry | null> {
    const client = await clientPromise;
    const db = client.db("note-of-life");

    const entry = await db.collection("entries").findOne({ _id: new ObjectId(id) });
    if (!entry) return null;

    return {
        _id: entry._id.toString(),
        email: entry.email,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || [],
        date: entry.date,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
    };
}

// ─── Update entry ─────────────────────────────────────────────
export async function updateEntry(
    id: string,
    updateData: Partial<Omit<Entry, "_id" | "email" | "createdAt" | "updatedAt">>
): Promise<Entry | null> {
    const client = await clientPromise;
    const db = client.db("note-of-life");

    const result = await db.collection("entries").updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) return null;
    return getEntryById(id);
}

// ─── Delete entry ─────────────────────────────────────────────
export async function deleteEntry(id: string): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db("note-of-life");

    const result = await db.collection("entries").deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
}

// ─── Delete all entries for a user ──────────────────────────
export async function deleteEntriesByUser(email: string): Promise<number> {
    const client = await clientPromise;
    const db = client.db("note-of-life");

    const result = await db.collection("entries").deleteMany({ email });
    return result.deletedCount;
}

// ─── Get stats ─────────────────────────────────────────────────
export async function getEntryStats(email: string): Promise<{
    totalEntries: number;
    totalMoods: number;
    topMood: string;
}> {
    const client = await clientPromise;
    const db = client.db("note-of-life");

    const totalEntries = await db.collection("entries").countDocuments({ email });

    const moods = await db.collection("entries").distinct("mood", { email });
    const totalMoods = moods.length;

    const topMoodAgg = await db
        .collection("entries")
        .aggregate([
            { $match: { email } },
            { $group: { _id: "$mood", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
        ])
        .toArray();

    const topMood = topMoodAgg.length > 0 ? topMoodAgg[0]._id : "neutral";

    return { totalEntries, totalMoods, topMood };
}