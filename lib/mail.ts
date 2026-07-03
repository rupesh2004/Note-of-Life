import nodemailer, { type SendMailOptions } from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const defaultFromEmail =
  process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL ||
  "Note of Life <no-reply@note-of-life.app>";

export const appBaseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

let transport: nodemailer.Transporter | null = null;

async function createTransport() {
  if (transport) {
    return transport;
  }

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  } else if (process.env.NODE_ENV !== "production") {
    const testAccount = await nodemailer.createTestAccount();
    transport = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.warn(
      "SMTP configuration is missing. Using Ethereal test account for local email delivery."
    );
  } else {
    throw new Error(
      "Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL."
    );
  }

  return transport;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const mailer = await createTransport();

  const message: SendMailOptions = {
    from: defaultFromEmail,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  const result = await mailer.sendMail(message);

  if (process.env.NODE_ENV !== "production" && typeof nodemailer.getTestMessageUrl === "function") {
    const previewUrl = nodemailer.getTestMessageUrl(result);
    if (previewUrl) {
      console.info("Preview URL:", previewUrl);
    }
  }

  return result;
}
