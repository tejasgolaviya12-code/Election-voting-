import { Router, type IRouter } from "express";
import { db, electionsTable, candidatesTable, votesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { count } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  const role = (req as any).userRole;
  if (role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

function formatUser(u: typeof usersTable.$inferSelect) {
  const { passwordHash, ...rest } = u;
  return { ...rest, createdAt: u.createdAt.toISOString() };
}

function formatElection(e: typeof electionsTable.$inferSelect) {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
    description: e.description ?? undefined,
    constituency: e.constituency ?? undefined,
  };
}

router.post("/elections", requireAdmin, async (req, res) => {
  const { title, description, electionType, status, startDate, endDate, state, constituency } = req.body;
  if (!title || !electionType || !status || !startDate || !endDate || !state) {
    res.status(400).json({ error: "Required fields missing" }); return;
  }
  const [election] = await db.insert(electionsTable).values({
    title, description, electionType, status, startDate, endDate, state, constituency,
  }).returning();
  res.status(201).json(formatElection(election));
});

router.put("/elections/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { title, description, electionType, status, startDate, endDate, state, constituency } = req.body;
  const [election] = await db.update(electionsTable).set({
    title, description, electionType, status, startDate, endDate, state, constituency,
  }).where(eq(electionsTable.id, id)).returning();
  if (!election) { res.status(404).json({ error: "Election not found" }); return; }
  res.json(formatElection(election));
});

router.delete("/elections/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(electionsTable).where(eq(electionsTable.id, id));
  res.json({ message: "Election deleted" });
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(formatUser));
});

router.put("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { role } = req.body;
  if (!role || !["voter", "admin"].includes(role)) {
    res.status(400).json({ error: "Invalid role" }); return;
  }
  const [user] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "User deleted" });
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
  const [totalElectionsResult] = await db.select({ count: count() }).from(electionsTable);
  const [liveElectionsResult] = await db.select({ count: count() }).from(electionsTable).where(eq(electionsTable.status, "live"));
  const [upcomingElectionsResult] = await db.select({ count: count() }).from(electionsTable).where(eq(electionsTable.status, "upcoming"));
  const [completedElectionsResult] = await db.select({ count: count() }).from(electionsTable).where(eq(electionsTable.status, "completed"));
  const [totalCandidatesResult] = await db.select({ count: count() }).from(candidatesTable);
  const [totalVotesResult] = await db.select({ count: count() }).from(votesTable);

  res.json({
    totalUsers: Number(totalUsersResult.count),
    totalElections: Number(totalElectionsResult.count),
    liveElections: Number(liveElectionsResult.count),
    upcomingElections: Number(upcomingElectionsResult.count),
    completedElections: Number(completedElectionsResult.count),
    totalCandidates: Number(totalCandidatesResult.count),
    totalVotesCast: Number(totalVotesResult.count),
  });
});

export default router;
