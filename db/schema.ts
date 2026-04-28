import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  displayName: varchar("display_name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const publications = mysqlTable("publications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  pmid: varchar("pmid", { length: 20 }).notNull(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  journal: varchar("journal", { length: 500 }).notNull(),
  year: varchar("year", { length: 10 }).notNull(),
  volume: varchar("volume", { length: 50 }),
  issue: varchar("issue", { length: 50 }),
  pages: varchar("pages", { length: 100 }),
  doi: varchar("doi", { length: 300 }),
  nlmCitation: text("nlm_citation").notNull(),
  impactFactor: decimal("impact_factor", { precision: 6, scale: 3 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Publication = typeof publications.$inferSelect;
export type InsertPublication = typeof publications.$inferInsert;

export const journalImpactFactors = mysqlTable("journal_impact_factors", {
  id: serial("id").primaryKey(),
  journalName: varchar("journal_name", { length: 500 }).notNull().unique(),
  issn: varchar("issn", { length: 20 }),
  impactFactor: decimal("impact_factor", { precision: 6, scale: 3 }),
  year: varchar("year", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type JournalImpactFactor = typeof journalImpactFactors.$inferSelect;
export type InsertJournalImpactFactor = typeof journalImpactFactors.$inferInsert;
