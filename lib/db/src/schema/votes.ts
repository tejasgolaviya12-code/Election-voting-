import { pgTable, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { electionsTable } from "./elections";
import { candidatesTable } from "./candidates";

export const votesTable = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  electionId: integer("election_id").notNull().references(() => electionsTable.id, { onDelete: "cascade" }),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }),
  votedAt: timestamp("voted_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserElection: unique("unique_user_election").on(table.userId, table.electionId),
}));

export const insertVoteSchema = createInsertSchema(votesTable).omit({ id: true, votedAt: true });
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votesTable.$inferSelect;
