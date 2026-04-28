import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { publications, journalImpactFactors } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { fetchPubMedArticle } from "./pubmed";
import { TRPCError } from "@trpc/server";

export const publicationRouter = createRouter({
  // List all publications (everyone authenticated can view)
  list: authedQuery.query(async () => {
    const db = getDb();
    const results = await db.query.publications.findMany({
      with: { author: true },
      orderBy: [desc(publications.year)],
    });
    return results;
  }),

  // List publications by user ID
  listByUser: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.query.publications.findMany({
        where: eq(publications.userId, input.userId),
        with: { author: true },
        orderBy: [desc(publications.year)],
      });
      return results;
    }),

  // Fetch from PubMed by PMID
  fetchFromPubMed: authedQuery
    .input(z.object({ pmid: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const article = await fetchPubMedArticle(input.pmid.trim());
      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "无法在 PubMed 找到该 PMID 对应的文章",
        });
      }

      // Try to find impact factor
      const db = getDb();
      const journalIf = await db.query.journalImpactFactors.findFirst({
        where: eq(journalImpactFactors.journalName, article.journal),
      });

      return {
        ...article,
        impactFactor: journalIf?.impactFactor ? String(journalIf.impactFactor) : null,
      };
    }),

  // Create publication
  create: authedQuery
    .input(
      z.object({
        userId: z.number(),
        pmid: z.string().min(1),
        title: z.string().min(1),
        authors: z.string().min(1),
        journal: z.string().min(1),
        year: z.string().min(1),
        volume: z.string().optional(),
        issue: z.string().optional(),
        pages: z.string().optional(),
        doi: z.string().optional(),
        nlmCitation: z.string().min(1),
        impactFactor: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.user;

      // Members can only add to their own account
      if (currentUser.role !== "admin" && currentUser.id !== input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "只能为自己添加论文",
        });
      }

      const db = getDb();
     const result = await db
  .insert(publications)
  .values({
    userId: input.userId,
    pmid: input.pmid,
    title: input.title,
    authors: input.authors,
    journal: input.journal,
    year: input.year,
    volume: input.volume || null,
    issue: input.issue || null,
    pages: input.pages || null,
    doi: input.doi || null,
    nlmCitation: input.nlmCitation,
    impactFactor: input.impactFactor ? input.impactFactor : null,
  })
  .returning({ id: publications.id });

const id = result[0]?.id;

      const newPub = await db.query.publications.findFirst({
        where: eq(publications.id, id),
        with: { author: true },
      });

      return newPub;
    }),

  // Update publication
  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        userId: z.number(),
        pmid: z.string().min(1),
        title: z.string().min(1),
        authors: z.string().min(1),
        journal: z.string().min(1),
        year: z.string().min(1),
        volume: z.string().optional(),
        issue: z.string().optional(),
        pages: z.string().optional(),
        doi: z.string().optional(),
        nlmCitation: z.string().min(1),
        impactFactor: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.user;
      const db = getDb();

      const existing = await db.query.publications.findFirst({
        where: eq(publications.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "论文不存在",
        });
      }

      // Members can only update their own publications
      if (currentUser.role !== "admin" && existing.userId !== currentUser.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "只能修改自己的论文",
        });
      }

      // Members cannot change the owner
      if (currentUser.role !== "admin" && input.userId !== existing.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "不能更改论文所属成员",
        });
      }

      await db
        .update(publications)
        .set({
          userId: input.userId,
          pmid: input.pmid,
          title: input.title,
          authors: input.authors,
          journal: input.journal,
          year: input.year,
          volume: input.volume || null,
          issue: input.issue || null,
          pages: input.pages || null,
          doi: input.doi || null,
          nlmCitation: input.nlmCitation,
          impactFactor: input.impactFactor ? input.impactFactor : null,
        })
        .where(eq(publications.id, input.id));

      const updated = await db.query.publications.findFirst({
        where: eq(publications.id, input.id),
        with: { author: true },
      });

      return updated;
    }),

  // Delete publication
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.user;
      const db = getDb();

      const existing = await db.query.publications.findFirst({
        where: eq(publications.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "论文不存在",
        });
      }

      // Members can only delete their own publications
      if (currentUser.role !== "admin" && existing.userId !== currentUser.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "只能删除自己的论文",
        });
      }

      await db.delete(publications).where(eq(publications.id, input.id));

      return { success: true };
    }),
});
