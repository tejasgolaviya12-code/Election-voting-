import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["voter", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  aadhaarNumber: text("aadhaar_number").notNull().unique(),
  voterIdNumber: text("voter_id_number").notNull().unique(),
  mobileNumber: text("mobile_number").notNull(),
  passwordHash: text("password_hash").notNull(),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  state: text("state"),
  constituency: text("constituency"),
  role: roleEnum("role").notNull().default("voter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
