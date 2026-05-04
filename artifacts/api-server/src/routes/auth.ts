import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { generateOTP, storeOTP, verifyOTP } from "../lib/otp-store";
import { sendOTP } from "../lib/sms-service";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "india_election_salt_2024").digest("hex");
}

function sanitizeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash, ...rest } = user;
  return {
    ...rest,
    aadhaarNumber: user.aadhaarNumber,
    voterIdNumber: user.voterIdNumber,
    mobileNumber: user.mobileNumber,
    dateOfBirth: user.dateOfBirth ?? undefined,
    address: user.address ?? undefined,
    state: user.state ?? undefined,
    constituency: user.constituency ?? undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

// Send OTP to a mobile number (used for registration)
router.post("/auth/send-otp", async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
    res.status(400).json({ error: "Valid 10-digit mobile number is required" });
    return;
  }

  const otp = generateOTP();
  storeOTP(mobileNumber, otp);
  const result = await sendOTP(mobileNumber, otp);

  if (!result.success && !result.devMode) {
    res.status(503).json({ error: result.error || "Failed to send OTP. Please try again." });
    return;
  }

  res.json({
    message: `OTP sent to +91-XXXXXX${mobileNumber.slice(-4)}`,
    devMode: result.devMode,
    // Only expose OTP in dev mode (no SMS configured)
    ...(result.devMode ? { otp } : {}),
  });
});

// Send OTP for login — looks up user's mobile from Aadhaar
router.post("/auth/send-login-otp", async (req, res) => {
  const { aadhaarNumber } = req.body;
  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    res.status(400).json({ error: "Valid 12-digit Aadhaar number is required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.aadhaarNumber, aadhaarNumber)).limit(1);
  if (!user) {
    res.status(404).json({ error: "No voter registered with this Aadhaar number" });
    return;
  }

  const otp = generateOTP();
  storeOTP(user.mobileNumber, otp);
  const result = await sendOTP(user.mobileNumber, otp);

  if (!result.success && !result.devMode) {
    res.status(503).json({ error: result.error || "Failed to send OTP. Please try again." });
    return;
  }

  // Return masked mobile so frontend can display it
  const masked = `+91-XXXXXX${user.mobileNumber.slice(-4)}`;

  res.json({
    message: `OTP sent to ${masked}`,
    maskedMobile: masked,
    devMode: result.devMode,
    ...(result.devMode ? { otp } : {}),
  });
});

// Register with OTP verification
router.post("/auth/register", async (req, res) => {
  const { name, aadhaarNumber, voterIdNumber, mobileNumber, password, dateOfBirth, address, state, constituency, otp } = req.body;

  if (!name || !aadhaarNumber || !voterIdNumber || !mobileNumber || !password || !dateOfBirth || !address || !state || !constituency) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  if (!/^\d{12}$/.test(aadhaarNumber)) {
    res.status(400).json({ error: "Aadhaar number must be 12 digits" });
    return;
  }
  if (!otp) {
    res.status(400).json({ error: "OTP verification is required. Please verify your mobile number." });
    return;
  }

  // Verify OTP
  const otpCheck = verifyOTP(mobileNumber, otp);
  if (!otpCheck.valid) {
    res.status(400).json({ error: otpCheck.reason });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.aadhaarNumber, aadhaarNumber)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "A voter with this Aadhaar number is already registered" });
    return;
  }

  const existingVoterId = await db.select().from(usersTable).where(eq(usersTable.voterIdNumber, voterIdNumber)).limit(1);
  if (existingVoterId.length > 0) {
    res.status(400).json({ error: "A voter with this Voter ID is already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name, aadhaarNumber, voterIdNumber, mobileNumber,
    passwordHash: hashPassword(password),
    dateOfBirth, address, state, constituency, role: "voter",
  }).returning();

  (req.session as any).userId = user.id;
  res.status(201).json({ user: sanitizeUser(user), message: "Registration successful" });
});

// Login with OTP
router.post("/auth/login", async (req, res) => {
  const { aadhaarNumber, otp } = req.body;

  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    res.status(400).json({ error: "Valid 12-digit Aadhaar number is required" });
    return;
  }
  if (!otp) {
    res.status(400).json({ error: "OTP is required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.aadhaarNumber, aadhaarNumber)).limit(1);
  if (!user) {
    res.status(401).json({ error: "No voter registered with this Aadhaar number" });
    return;
  }

  const otpCheck = verifyOTP(user.mobileNumber, otp);
  if (!otpCheck.valid) {
    res.status(401).json({ error: otpCheck.reason });
    return;
  }

  (req.session as any).userId = user.id;
  res.json({ user: sanitizeUser(user), message: "Login successful" });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/auth/me", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }
  res.json(sanitizeUser(user));
});

export default router;
