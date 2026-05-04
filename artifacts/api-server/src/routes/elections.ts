import { Router, type IRouter } from "express";
import { db, electionsTable, candidatesTable, votesTable, usersTable } from "@workspace/db";
import { eq, and, count, sql } from "drizzle-orm";
import { getECIData } from "../lib/eci-data";

const router: IRouter = Router();

function formatElection(e: typeof electionsTable.$inferSelect) {
  return {
    ...e,
    startDate: e.startDate,
    endDate: e.endDate,
    createdAt: e.createdAt.toISOString(),
    description: e.description ?? undefined,
    constituency: e.constituency ?? undefined,
  };
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

router.get("/elections", async (req, res) => {
  const { status } = req.query;
  let rows;
  if (status && typeof status === "string") {
    rows = await db.select().from(electionsTable).where(eq(electionsTable.status, status as any));
  } else {
    rows = await db.select().from(electionsTable);
  }
  res.json(rows.map(formatElection));
});

router.get("/elections/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [election] = await db.select().from(electionsTable).where(eq(electionsTable.id, id)).limit(1);
  if (!election) { res.status(404).json({ error: "Election not found" }); return; }

  const candidates = await db.select().from(candidatesTable).where(eq(candidatesTable.electionId, id));

  res.json({ ...formatElection(election), candidates: candidates.map(formatCandidate) });
});

router.post("/elections/:id/vote", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const electionId = parseInt(req.params.id);
  const { candidateId } = req.body;

  if (isNaN(electionId) || !candidateId) {
    res.status(400).json({ error: "Invalid request" }); return;
  }

  const [election] = await db.select().from(electionsTable).where(eq(electionsTable.id, electionId)).limit(1);
  if (!election) { res.status(404).json({ error: "Election not found" }); return; }
  if (election.status !== "live") { res.status(400).json({ error: "Voting is only allowed for live elections" }); return; }

  const [candidate] = await db.select().from(candidatesTable)
    .where(and(eq(candidatesTable.id, candidateId), eq(candidatesTable.electionId, electionId))).limit(1);
  if (!candidate) { res.status(400).json({ error: "Candidate not found in this election" }); return; }

  const existingVote = await db.select().from(votesTable)
    .where(and(eq(votesTable.userId, userId), eq(votesTable.electionId, electionId))).limit(1);
  if (existingVote.length > 0) {
    res.status(400).json({ error: "You have already voted in this election" }); return;
  }

  await db.insert(votesTable).values({ userId, electionId, candidateId });

  res.status(201).json({ message: "Vote cast successfully" });
});

router.get("/elections/:id/my-vote", async (req, res) => {
  const userId = (req.session as any).userId;
  const electionId = parseInt(req.params.id);

  if (!userId) { res.json({ hasVoted: false }); return; }

  const [vote] = await db.select({
    vote: votesTable,
    candidate: candidatesTable,
  })
    .from(votesTable)
    .leftJoin(candidatesTable, eq(votesTable.candidateId, candidatesTable.id))
    .where(and(eq(votesTable.userId, userId), eq(votesTable.electionId, electionId)))
    .limit(1);

  if (!vote) { res.json({ hasVoted: false }); return; }

  res.json({
    hasVoted: true,
    candidateId: vote.vote.candidateId,
    candidateName: vote.candidate?.name,
    partyName: vote.candidate?.partyName,
    votedAt: vote.vote.votedAt.toISOString(),
  });
});

router.get("/elections/:id/results", async (req, res) => {
  const electionId = parseInt(req.params.id);
  if (isNaN(electionId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const results = await db
    .select({
      candidateId: candidatesTable.id,
      candidateName: candidatesTable.name,
      partyName: candidatesTable.partyName,
      partySymbol: candidatesTable.partySymbol,
      voteCount: count(votesTable.id),
    })
    .from(candidatesTable)
    .leftJoin(votesTable, and(eq(votesTable.candidateId, candidatesTable.id), eq(votesTable.electionId, electionId)))
    .where(eq(candidatesTable.electionId, electionId))
    .groupBy(candidatesTable.id, candidatesTable.name, candidatesTable.partyName, candidatesTable.partySymbol);

  res.json(results.map(r => ({ ...r, voteCount: Number(r.voteCount) })));
});

// Real ECI party-wise data for known elections
router.get("/elections/:id/eci-results", async (req, res) => {
  const electionId = parseInt(req.params.id);
  if (isNaN(electionId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [election] = await db.select().from(electionsTable).where(eq(electionsTable.id, electionId)).limit(1);
  if (!election) { res.status(404).json({ error: "Election not found" }); return; }

  const eciData = getECIData(election.title);
  if (!eciData) {
    res.status(404).json({ error: "No ECI data available for this election" });
    return;
  }
  res.json({ electionTitle: election.title, ...eciData });
});

export default router;
