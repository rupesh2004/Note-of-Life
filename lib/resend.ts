import { Resend } from "resend";

export function getResendClient() {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error(
      "Missing environment variable RESEND_API_KEY. Set this in your deployment environment."
    );
  }

  return new Resend(resendApiKey);
}

export const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "Note of Life <onboarding@resend.dev>";
export const appBaseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
