import { NextRequest, NextResponse } from "next/server";
import { sendEmail, appBaseUrl } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const adminHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8f9fa;">

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); overflow: hidden;">

                  <tr>
                    <td style="background: linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899); padding: 32px 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                        ✨ New Contact Message
                      </h1>
                      <p style="margin: 6px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.85);">
                        From Note of Life
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px 30px; background: #ffffff;">
                      <p style="font-size: 16px; color: #1F2937;">
                        You have received a new message from the contact form.
                      </p>

                      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                          <td style="padding: 8px 12px; font-weight: 600; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Name</td>
                          <td style="padding: 8px 12px; color: #1F2937; border-bottom: 1px solid #E5E7EB;">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 12px; font-weight: 600; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Email</td>
                          <td style="padding: 8px 12px; color: #1F2937; border-bottom: 1px solid #E5E7EB;">
                            <a href="mailto:${email}" style="color: #4F46E5; text-decoration: none;">${email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 12px; font-weight: 600; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Subject</td>
                          <td style="padding: 8px 12px; color: #1F2937; border-bottom: 1px solid #E5E7EB;">${subject || "No subject"}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 12px; font-weight: 600; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Message</td>
                          <td style="padding: 8px 12px; color: #1F2937; border-bottom: 1px solid #E5E7EB;">${message.replace(/\n/g, '<br>')}</td>
                        </tr>
                      </table>

                      <p style="margin-top: 30px; font-size: 14px; color: #6B7280; text-align: center;">
                        This email was sent from your Note of Life contact form.
                      </p>

                      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
                      <p style="margin: 0; font-size: 13px; color: #9CA3AF; text-align: center;">
                        &copy; ${new Date().getFullYear()} Note of Life &bull; Every Memory Matters
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

    await sendEmail({
      to: "noteoflife52@gmail.com",
      subject: `📬 New Contact Message from ${name}`,
      html: adminHtml,
    });

    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}