import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createUser, getUserByEmail, getUserByGoogleId } from "../../../../../lib/model/User";
import { generateToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=no_code", req.url));
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        });

        const { access_token, id_token } = tokenResponse.data;

        // Get user info with the access token
        const userInfoResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const { email, name, sub: googleId } = userInfoResponse.data;

        if (!email) {
            return NextResponse.redirect(new URL("/login?error=no_email", req.url));
        }

        // Check if user already exists
        let user = await getUserByEmail(email);

        if (!user) {
            // Create a new user
            user = await createUser({
                name: name || email.split("@")[0],
                email,
                googleId,
                createdAt: new Date().toISOString(),
                // password is not set for OAuth users
            });
        } else {
            // If user exists but doesn't have googleId, update it (link accounts)
            if (!user.googleId) {
                const client = await clientPromise;
                const db = client.db("note-of-life");
                await db.collection("users").updateOne(
                    { _id: new ObjectId(user._id) },
                    { $set: { googleId } }
                );
                // refresh user object
                user = await getUserByEmail(email);
            }
        }

        // Generate JWT token
        const token = generateToken({
            email: user!.email, name: user!.name,
            password: ""
        });

        // Redirect to the home page with the token (or store in cookie/localStorage)
        // We'll send the token as a query parameter, or we can store it in a cookie.
        // For simplicity, we'll redirect to the login page with token in URL, and the login page will read it.
        // Better: store in httpOnly cookie? But we can keep it simple for now.
        // We'll pass token in URL and then the login page's useEffect will store it and redirect.
        const redirectUrl = new URL("/login", req.url);
        redirectUrl.searchParams.set("token", token);
        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error("Google OAuth error:", error);
        return NextResponse.redirect(new URL("/login?error=server", req.url));
    }
}