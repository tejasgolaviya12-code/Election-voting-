import { Router, type IRouter } from "express";
import { db, candidatesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  const role = (req as any).userRole;
  if (role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

function formatCandidate(c: typeof candidatesTable.$inferSelect) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    partySymbol: c.partySymbol ?? undefined,
    constituency: c.constituency ?? undefined,
    age: c.age ?? undefined,
    education: c.education ?? undefined,
    bio: c.bio ?? undefined,
    imageUrl: c.imageUrl ?? undefined,
  };
}

router.get("/candidates", async (req, res) => {
  const { electionId } = req.query;
  let rows;
  if (electionId) {
    rows = await db.select().from(candidatesTable).where(eq(candidatesTable.electionId, Number(electionId)));
  } else {
    rows = await db.select().from(candidatesTable);
  }
  res.json(rows.map(formatCandidate));
});

router.post("/candidates", requireAdmin, async (req, res) => {
  const { electionId, name, partyName, partySymbol, constituency, state, age, education, bio, imageUrl } = req.body;
  if (!electionId || !name || !partyName || !state) {
    res.status(400).json({ error: "electionId, name, partyName, and state are required" });
    return;
  }
  const [candidate] = await db.insert(candidatesTable).values({
    electionId: Number(electionId), name, partyName, partySymbol, constituency, state,
    age: age ? Number(age) : undefined, education, bio, imageUrl,
  }).returning();
  res.status(201).json(formatCandidate(candidate));
});

router.put("/candidates/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { electionId, name, partyName, partySymbol, constituency, state, age, education, bio, imageUrl } = req.body;
  const [candidate] = await db.update(candidatesTable).set({
    electionId: electionId ? Number(electionId) : undefined,
    name, partyName, partySymbol, constituency, state,
    age: age ? Number(age) : undefined, education, bio, imageUrl,
  }).where(eq(candidatesTable.id, id)).returning();
  if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }
  res.json(formatCandidate(candidate));
});

router.delete("/candidates/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(candidatesTable).where(eq(candidatesTable.id, id));
  res.json({ message: "Candidate deleted" });
});

export default router;
