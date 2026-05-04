import cron from "node-cron";
import { db, electionsTable } from "@workspace/db";
import { eq, and, lte, gte, ne } from "drizzle-orm";
import { logger } from "./logger";
import { refreshElectionNews } from "./news-fetcher";

export async function syncElectionStatuses() {
  const now = new Date();
  let updated = 0;

  // upcoming → live: start date has passed, end date hasn't
  const toLive = await db
    .update(electionsTable)
    .set({ status: "live" })
    .where(
      and(
        eq(electionsTable.status, "upcoming"),
        lte(electionsTable.startDate, now.toISOString()),
        gte(electionsTable.endDate, now.toISOString()),
      ),
    )
    .returning({ id: electionsTable.id });
  updated += toLive.length;
  if (toLive.length > 0) logger.info({ ids: toLive.map(e => e.id) }, "Elections moved to LIVE");

  // live → completed: end date has passed
  const toCompleted = await db
    .update(electionsTable)
    .set({ status: "completed" })
    .where(
      and(
        ne(electionsTable.status, "completed"),
        lte(electionsTable.endDate, now.toISOString()),
      ),
    )
    .returning({ id: electionsTable.id });
  updated += toCompleted.length;
  if (toCompleted.length > 0) logger.info({ ids: toCompleted.map(e => e.id) }, "Elections moved to COMPLETED");

  logger.info({ updated }, "Election status sync complete");
  return { updated, toLive: toLive.length, toCompleted: toCompleted.length };
}

export function startScheduler() {
  // Run immediately on startup
  syncElectionStatuses().catch(err => logger.error(err, "Startup status sync failed"));
  refreshElectionNews().catch(err => logger.error(err, "Startup news fetch failed"));

  // Sync election statuses every hour
  cron.schedule("0 * * * *", () => {
    syncElectionStatuses().catch(err => logger.error(err, "Scheduled status sync failed"));
  });

  // Refresh news every 6 hours
  cron.schedule("0 */6 * * *", () => {
    refreshElectionNews().catch(err => logger.error(err, "Scheduled news refresh failed"));
  });

  logger.info("Scheduler started: status sync (hourly), news refresh (every 6h)");
}
