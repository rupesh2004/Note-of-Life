import jwt from "jsonwebtoken"

export interface JWTPayload {
    email: string,
    password?: string,  // make optional – not needed for tokens
    name: string
}

export function generateToken(payload: JWTPayload): string {
    const secretKey = process.env.JWT_SECRET || "default_secret_key";
    return jwt.sign(payload, secretKey, { expiresIn: "24h" });
}

// ─── Alias for consistency ──────────────────────────────────────
export const signToken = generateToken;

export function verifyToken(token: string): JWTPayload | null {
    const secretKey = process.env.JWT_SECRET || "default_secret_key";
    try {
        const decoded = jwt.verify(token, secretKey) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}