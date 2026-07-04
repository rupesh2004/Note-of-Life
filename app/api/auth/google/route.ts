import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
    const scope = "openid email profile";

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    return NextResponse.redirect(url);
}