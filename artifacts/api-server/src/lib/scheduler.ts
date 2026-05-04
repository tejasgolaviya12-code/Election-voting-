import cron from "node-cron";
import { db, electionsTable } from "@workspace/db";
import { and, eq, lte, ne } from "drizzle-orm";
import { logger } from "./logger";
import { refreshElectionNews } from "./news-fetcher";
import { seedRealElections } from "./seed-real-elections";

export async function syncElectionStatuses() {
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  let updated = 0;

  // upcoming → live: startDate <= today AND endDate >= today (election is ongoing)
  const toLive = await db
    .update(electionsTable)
    .set({ status: "live" })
    .where(
      and(
        eq(electionsTable.status, "upcoming"),
        lte(electionsTable.startDate, today),
        // endDate is still today or later
      ),
    )
    .returning({ id: electionsTable.id, title: electionsTable.title });

  updated += toLive.length;
  if (toLive.length > 0) logger.info({ ids: toLive.map(e => e.id) }, "Elections moved to LIVE");

  // live/upcoming → completed: endDate < today (election has ended)
  const toCompleted = await db
    .update(electionsTable)
    .set({ status: "completed" })
    .where(
      and(
        ne(electionsTable.status, "completed"),
        lte(electionsTable.endDate, today),
      ),
    )
    .returning({ id: electionsTable.id, title: electionsTable.title });

  updated += toCompleted.length;
  if (toCompleted.length > 0) logger.info({ ids: toCompleted.map(e => e.id) }, "Elections moved to COMPLETED");

  logger.info({ updated }, "Election status sync complete");
  return { updated, toLive: toLive.length, toCompleted: toCompleted.length };
}

export function startScheduler() {
  // Seed real election data first
  seedRealElections().catch(err => logger.error(err, "Real election seeding failed"));

  // Run status sync on startup
  syncElectionStatuses().catch(err => logger.error(err, "Startup status sync failed"));

  // Fetch news on startup
  refreshElectionNews().catch(err => logger.error(err, "Startup news fetch failed"));

  // Sync election statuses every 30 minutes
  cron.schedule("*/30 * * * *", () => {
    syncElectionStatuses().catch(err => logger.error(err, "Scheduled status sync failed"));
  });

  // Refresh news every 2 hours
  cron.schedule("0 */2 * * *", () => {
    refreshElectionNews().catch(err => logger.error(err, "Scheduled news refresh failed"));
  });

  logger.info("Scheduler started: status sync (every 30m), news refresh (every 2h)");
}
