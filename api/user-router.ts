import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const userRouter = createRouter({
  // List all users (any authenticated user can see members)
  list: authedQuery.query(async () => {
    const db = getDb();
    return db.query.users.findMany({
      orderBy: [users.name],
    });
  }),

  // Get user by ID
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.id),
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "用户不存在",
        });
      }
      return user;
    }),

  // Update own profile
  updateProfile: authedQuery
    .input(
      z.object({
        displayName: z.string().min(1).max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({
          displayName: input.displayName || null,
        })
        .where(eq(users.id, ctx.user.id));

      return db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });
    }),

  // Admin: update any user's role
  updateRole: adminQuery
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });
    }),
});
