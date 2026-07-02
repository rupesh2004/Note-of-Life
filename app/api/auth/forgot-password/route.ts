import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";
import { otpStore } from "@/lib/otp-store";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const client = await clientPromise;
    const db = client.db("note-of-life");
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate 6‑digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in memory
  otpStore.set(email, { otp, expiresAt });
    // Build the email HTML – **Password Reset OTP**
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8f9fa;">

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); overflow: hidden;">

                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899); padding: 32px 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                        🔐 Note of Life
                      </h1>
                      <p style="margin: 6px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.85);">
                        Password Reset
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px; background: #ffffff;">
                      <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #1F2937;">
                        Hello ${user.name || "there"}! 👋
                      </h2>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4B5563;">
                        You requested to reset your password for your Note of Life account.
                        Enter the OTP below on the reset page to create a new password.
                      </p>

                      <!-- OTP Box -->
                      <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: #6B7280;">Your One‑Time Password</p>
                        <p style="margin: 8px 0 0 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1F2937; background: #ffffff; padding: 16px; border-radius: 8px; display: inline-block;">
                          ${otp}
                        </p>
                      </div>

                      <!-- Expiry Info -->
                      <p style="margin: 0 0 20px 0; font-size: 14px; color: #6B7280; text-align: center;">
                        This OTP is valid for <strong>10 minutes</strong>.
                      </p>

                      <!-- Action Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/forgot-password" 
                           style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #ffffff; padding: 14px 40px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                          Go to Reset Page
                        </a>
                      </div>

                      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />

                      <p style="margin: 0; font-size: 14px; color: #6B7280; text-align: center;">
                        If you didn't request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; background: #F9FAFB; text-align: center; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0; font-size: 13px; color: #9CA3AF;">
                        &copy; ${new Date().getFullYear()} Note of Life &bull; Every Memory Matters
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Small footer outside -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin-top: 20px;">
                  <tr>
                    <td align="center">
                      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                        This email was sent to <a href="mailto:${email}" style="color: #6B7280; text-decoration: none;">${email}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

        </body>
      </html>
    `;

    // Send email
    await resend.emails.send({
      from: "Note of Life <onboarding@resend.dev>",
      to: email,
      subject: "🔐 Reset Your Password – Note of Life",
      html,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}