import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { electionsTable } from "./elections";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  electionId: integer("election_id").notNull().references(() => electionsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  partyName: text("party_name").notNull(),
  partySymbol: text("party_symbol"),
  constituency: text("constituency"),
  state: text("state").notNull(),
  age: integer("age"),
  education: text("education"),
  bio: text("bio"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;
