// In-memory store: email -> { otp, expiresAt }
export const otpStore = new Map<string, { otp: string; expiresAt: number }>();