import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  displayName: varchar("display_name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }).notNull(),
  pmid: varchar("pmid", { length: 20 }).notNull(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  journal: varchar("journal", { length: 500 }).notNull(),
  year: varchar("year", { length: 10 }).notNull(),
  volume: varchar("volume", { length: 50 }),
  issue: varchar("issue", { length: 50 }),
  pages: varchar("pages", { length: 100 }),
  doi: varchar("doi", { length: 300 }),
  nlmCitation: text("nlm_citation"),
  impactFactor: decimal("impact_factor", { precision: 6, scale: 3 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const journalImpactFactors = pgTable("journal_impact_factors", {
  id: serial("id").primaryKey(),
  journalName: varchar("journal_name", { length: 500 }).notNull().unique(),
  issn: varchar("issn", { length: 20 }),
  impactFactor: decimal("impact_factor", { precision: 6, scale: 3 }),
  year: varchar("year", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Publication = typeof publications.$inferSelect;
export type InsertPublication = typeof publications.$inferInsert;
export type JournalImpactFactor = typeof journalImpactFactors.$inferSelect;
export type InsertJournalImpactFactor = typeof journalImpactFactors.$inferInsert;