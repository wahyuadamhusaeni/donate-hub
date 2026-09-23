import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { donations } from "@/lib/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";

// GET /api/stats -> {total, today, count, top:[{donator, total}]}
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }
  const uid = session.user.id;
  const [totals] = await db
    .select({
      total: sql<number>`coalesce(sum(${donations.amount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(donations)
    .where(eq(donations.userId, uid));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [today] = await db
    .select({ total: sql<number>`coalesce(sum(${donations.amount}), 0)` })
    .from(donations)
    .where(
      and(eq(donations.userId, uid), gte(donations.createdAt, todayStart)),
    );

  const top = await db
    .select({
      donator: donations.donator,
      total: sql<number>`sum(${donations.amount})`,
    })
    .from(donations)
    .where(eq(donations.userId, uid))
    .groupBy(donations.donator)
    .orderBy(desc(sql`sum(${donations.amount})`))
    .limit(10);

  return NextResponse.json({
    total: Number(totals?.total ?? 0),
    count: Number(totals?.count ?? 0),
    today: Number(today?.total ?? 0),
    top,
  });
}
