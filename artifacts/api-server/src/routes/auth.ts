import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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

router.post("/auth/register", async (req, res) => {
  const { name, aadhaarNumber, voterIdNumber, mobileNumber, password, dateOfBirth, address, state, constituency } = req.body;

  if (!name || !aadhaarNumber || !voterIdNumber || !mobileNumber || !password || !dateOfBirth || !address || !state || !constituency) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  if (!/^\d{12}$/.test(aadhaarNumber)) {
    res.status(400).json({ error: "Aadhaar number must be 12 digits" });
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
    name,
    aadhaarNumber,
    voterIdNumber,
    mobileNumber,
    passwordHash: hashPassword(password),
    dateOfBirth,
    address,
    state,
    constituency,
    role: "voter",
  }).returning();

  (req.session as any).userId = user.id;
  res.status(201).json({ user: sanitizeUser(user), message: "Registration successful" });
});

router.post("/auth/login", async (req, res) => {
  const { aadhaarNumber, password } = req.body;

  if (!aadhaarNumber || !password) {
    res.status(400).json({ error: "Aadhaar number and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.aadhaarNumber, aadhaarNumber)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid Aadhaar number or password" });
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
