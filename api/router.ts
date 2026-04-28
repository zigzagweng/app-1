import { authRouter } from "./auth-router";
import { publicationRouter } from "./publication-router";
import { journalRouter } from "./journal-router";
import { userRouter } from "./user-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  publication: publicationRouter,
  journal: journalRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
