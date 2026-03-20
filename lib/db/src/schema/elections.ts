import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const electionTypeEnum = pgEnum("election_type", ["general", "state", "local", "bypolls"]);
export const electionStatusEnum = pgEnum("election_status", ["live", "upcoming", "completed"]);

export const electionsTable = pgTable("elections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  electionType: electionTypeEnum("election_type").notNull(),
  status: electionStatusEnum("status").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  state: text("state").notNull(),
  constituency: text("constituency"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertElectionSchema = createInsertSchema(electionsTable).omit({ id: true, createdAt: true });
export type InsertElection = z.infer<typeof insertElectionSchema>;
export type Election = typeof electionsTable.$inferSelect;
