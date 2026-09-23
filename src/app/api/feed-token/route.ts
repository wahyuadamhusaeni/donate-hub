import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { robloxFeedTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET -> token Roblox user (buat bila belum ada). POST -> regenerate.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }
  let [row] = await db
    .select()
    .from(robloxFeedTokens)
    .where(eq(robloxFeedTokens.userId, session.user.id))
    .limit(1);
  if (!row) {
    [row] = await db
      .insert(robloxFeedTokens)
      .values({
        userId: session.user.id,
        token: randomBytes(32).toString("hex"),
      })
      .returning();
  }
  return NextResponse.json(row);
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }
  const token = randomBytes(32).toString("hex");
  await db
    .insert(robloxFeedTokens)
    .values({ userId: session.user.id, token })
    .onConflictDoUpdate({
      target: robloxFeedTokens.userId,
      set: { token },
    });
  return NextResponse.json({ status: "success", token });
}
