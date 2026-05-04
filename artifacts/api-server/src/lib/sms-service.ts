import { logger } from "./logger";

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || "";
const MSG91_SENDER = process.env.MSG91_SENDER || "ELECTN";

export async function sendOTP(mobile: string, otp: string): Promise<{ success: boolean; devMode: boolean; error?: string }> {
  // Always log OTP in dev for testing
  logger.info({ mobile: `+91${mobile.slice(-4).padStart(mobile.length, "*")}`, otp }, "OTP generated");

  if (!MSG91_AUTH_KEY) {
    // Dev mode — show OTP in response (never do this in production)
    logger.warn("MSG91_AUTH_KEY not set — running in DEV mode, OTP will be returned in response");
    return { success: true, devMode: true };
  }

  try {
    const payload = {
      template_id: MSG91_TEMPLATE_ID,
      mobile: `91${mobile}`,
      authkey: MSG91_AUTH_KEY,
      otp,
      sender: MSG91_SENDER,
    };

    const res = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json", "authkey": MSG91_AUTH_KEY },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as any;

    if (data.type === "success" || res.ok) {
      logger.info({ mobile: `+91${mobile.slice(-4).padStart(mobile.length, "*")}` }, "OTP SMS sent successfully");
      return { success: true, devMode: false };
    } else {
      logger.error({ error: data.message || data }, "MSG91 OTP send failed");
      return { success: false, devMode: false, error: data.message || "SMS service error" };
    }
  } catch (err: any) {
    logger.error({ error: err.message }, "SMS service network error");
    return { success: false, devMode: false, error: "Could not reach SMS service" };
  }
}
