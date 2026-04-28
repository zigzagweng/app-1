import { relations } from "drizzle-orm";
import { users, publications } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  publications: many(publications),
}));

export const publicationsRelations = relations(publications, ({ one }) => ({
  author: one(users, {
    fields: [publications.userId],
    references: [users.id],
  }),
}));
