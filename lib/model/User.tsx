import clientPromise from "../mongodb";

export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const client = await clientPromise; // ✅ Await the promise to get the MongoClient
    const db = client.db("note-of-life");
    const user = await db.collection("users").findOne({ email });
    return user as User | null;
}

export async function createUser(userData: Omit<User, "_id">): Promise<User> {
    const client = await clientPromise;
    const db = client.db("note-of-life");
    const result = await db.collection("users").insertOne(userData);
    return { _id: result.insertedId.toString(), ...userData };
}