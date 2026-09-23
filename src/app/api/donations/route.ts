import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { donations } from "@/lib/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";

// GET /api/donations?endpoint=&q=&page= (20 per halaman)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const endpointId = searchParams.get("endpoint") ?? "";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = 20;

  const conditions = [eq(donations.userId, session.user.id)];
  if (endpointId) conditions.push(eq(donations.endpointId, endpointId));
  if (q) {
    conditions.push(
      or(
        ilike(donations.donator, `%${q}%`),
        ilike(donations.message, `%${q}%`),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(donations)
    .where(and(...conditions))
    .orderBy(desc(donations.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
  return NextResponse.json(rows);
}
