import clientPromise from "@/lib/mongodb";

export interface User {
    _id?: string;
    name: string;
    email: string;
    password?: string;          // optional for OAuth users
    googleId?: string;          // new field
    createdAt: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("note-of-life");
    return db.collection<User>("users").findOne({ email });
}

export async function createUser(userData: Omit<User, "_id">): Promise<User> {
    const client = await clientPromise;
    const db = client.db("note-of-life");
    const result = await db.collection("users").insertOne(userData);
    return { _id: result.insertedId.toString(), ...userData };
}

export async function getUserByGoogleId(googleId: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("note-of-life");
    return db.collection<User>("users").findOne({ googleId });
}