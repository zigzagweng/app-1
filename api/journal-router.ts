import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { journalImpactFactors } from "@db/schema";
import { eq, like } from "drizzle-orm";

export const journalRouter = createRouter({
  // Search journal by name (any authenticated user)
  search: authedQuery
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(journalImpactFactors)
        .where(like(journalImpactFactors.journalName, `%${input.query}%`))
        .limit(20);
      return results;
    }),

  // List all journals (admin only)
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.query.journalImpactFactors.findMany({
      orderBy: [journalImpactFactors.journalName],
    });
  }),

  // Get journal by exact name
  getByName: authedQuery
    .input(z.object({ name: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.query.journalImpactFactors.findFirst({
        where: eq(journalImpactFactors.journalName, input.name),
      });
      return result ?? null;
    }),

  // Create or update journal IF (admin only)
  upsert: adminQuery
    .input(
      z.object({
        journalName: z.string().min(1),
        issn: z.string().optional(),
        impactFactor: z.string().optional(),
        year: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.journalImpactFactors.findFirst({
        where: eq(journalImpactFactors.journalName, input.journalName),
      });

      if (existing) {
        await db
          .update(journalImpactFactors)
          .set({
            issn: input.issn || existing.issn,
            impactFactor: input.impactFactor ? input.impactFactor : existing.impactFactor,
            year: input.year || existing.year,
          })
          .where(eq(journalImpactFactors.id, existing.id));

        return db.query.journalImpactFactors.findFirst({
          where: eq(journalImpactFactors.id, existing.id),
        });
      } else {
        const [{ id }] = await db
          .insert(journalImpactFactors)
          .values({
            journalName: input.journalName,
            issn: input.issn || null,
            impactFactor: input.impactFactor ? input.impactFactor : null,
            year: input.year || null,
          })
          .returning({ id: journalImpactFactors.id });

        return db.query.journalImpactFactors.findFirst({
          where: eq(journalImpactFactors.id, id),
        });
      }
    }),

  // Delete journal entry (admin only)
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(journalImpactFactors).where(eq(journalImpactFactors.id, input.id));
      return { success: true };
    }),
});
