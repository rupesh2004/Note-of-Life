import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY || "re_W8skM4wr_NsYfCmnEtzeDHhguytcXCCNV");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body || {};

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Missing or invalid email" }, { status: 400 });
    }

    // ─── Build the email HTML ─────────────────────────────────
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Daily Journal Reminder</title>
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
                      <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                        ✨ Note of Life
                      </h1>
                      <p style="margin: 6px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.85);">
                        Every Memory Matters
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px; background: #ffffff;">
                      <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #1F2937;">
                        Hello ${name || "there"}! 👋
                      </h2>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4B5563;">
                        It's a beautiful day to write. 🌿 Take a few minutes to reflect, 
                        capture your thoughts, and preserve today's memory.
                      </p>

                      <!-- Quote Block -->
                      <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                        <p style="margin: 0; font-size: 18px; font-style: italic; color: #1F2937;">
                          “Every page tells a story. Every story becomes a memory.”
                        </p>
                      </div>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/write" 
                           style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #ffffff; padding: 14px 40px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                          ✍️ Write Now
                        </a>
                      </div>

                      <!-- Divider -->
                      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />

                      <!-- Reminder Info -->
                      <p style="margin: 0; font-size: 14px; color: #6B7280; text-align: center;">
                        You're receiving this because you enabled daily reminders in your settings.
                      </p>
                      <p style="margin: 6px 0 0 0; font-size: 14px; color: #6B7280; text-align: center;">
                        To disable, go to <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/settings" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Settings</a>.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; background: #F9FAFB; text-align: center; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0; font-size: 13px; color: #9CA3AF;">
                        &copy; ${new Date().getFullYear()} Note of Life &bull; Made with ❤️ for journaling lovers
                      </p>
                    </td>
                  </tr>
                </table>
                <!-- End Main Container -->

                <!-- Small footer outside the card -->
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

    // ─── Send the email ──────────────────────────────────────
    await resend.emails.send({
      from: "Note of Life <onboarding@resend.dev>",
      to: email,
      subject: "🌅 Your Daily Journal Reminder",
      html,
    });

    return NextResponse.json({ message: "Reminder email sent" });
  } catch (error) {
    console.error("Daily reminder send error:", error);
    return NextResponse.json({ message: "Failed to send reminder email" }, { status: 500 });
  }
}