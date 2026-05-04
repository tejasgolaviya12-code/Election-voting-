const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

interface OTPEntry {
  otp: string;
  expiry: number;
  attempts: number;
}

const store = new Map<string, OTPEntry>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(mobile: string, otp: string): void {
  store.set(mobile, { otp, expiry: Date.now() + OTP_EXPIRY_MS, attempts: 0 });
}

export function verifyOTP(mobile: string, otp: string): { valid: boolean; reason?: string } {
  const entry = store.get(mobile);
  if (!entry) return { valid: false, reason: "OTP not found. Please request a new OTP." };
  if (Date.now() > entry.expiry) {
    store.delete(mobile);
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }
  entry.attempts++;
  if (entry.attempts > MAX_ATTEMPTS) {
    store.delete(mobile);
    return { valid: false, reason: "Too many incorrect attempts. Please request a new OTP." };
  }
  if (entry.otp !== otp) {
    return { valid: false, reason: `Incorrect OTP. ${MAX_ATTEMPTS - entry.attempts + 1} attempts remaining.` };
  }
  store.delete(mobile);
  return { valid: true };
}

export function isOTPPending(mobile: string): boolean {
  const entry = store.get(mobile);
  return !!entry && Date.now() < entry.expiry;
}

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiry) store.delete(key);
  }
}, 5 * 60 * 1000);
