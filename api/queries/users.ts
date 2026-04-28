import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

// ── Local built-in accounts ──────────────────────────────

export type LocalAccount = {
  username: string;
  password: string;
  name: string;
  role: "admin" | "user";
};

export const LOCAL_ACCOUNTS: LocalAccount[] = [
  { username: "fengjunfeng", password: "fengjunfeng", name: "冯俊峰", role: "admin" },
  { username: "wengweiji", password: "wengweiji", name: "翁伟基", role: "user" },
  { username: "gaoyingwei", password: "gaoyingwei", name: "高颖伟", role: "user" },
];

export function getLocalUnionId(username: string): string {
  return `local_${username}`;
}

export function verifyLocalAccount(
  username: string,
  password: string,
): LocalAccount | null {
  const account = LOCAL_ACCOUNTS.find((a) => a.username === username);
  if (!account) return null;
  if (account.password !== password) return null;
  return account;
}

export async function seedLocalUsers() {
  const db = getDb();
  for (const account of LOCAL_ACCOUNTS) {
    const unionId = getLocalUnionId(account.username);
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.unionId, unionId),
    });

    if (!existing) {
      await db.insert(schema.users).values({
        unionId,
        name: account.name,
        displayName: account.name,
        role: account.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignInAt: new Date(),
      });
      console.log(`[seed] Created local user: ${account.name} (${account.username})`);
    } else {
      // Ensure role and name are correct
      await db
        .update(schema.users)
        .set({
          name: account.name,
          displayName: account.name,
          role: account.role,
        })
        .where(eq(schema.users.id, existing.id));
    }
  }
}
