import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { webhookEndpoints } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const PROVIDERS = ["saweria", "bagibagi", "generic"] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.userId, session.user.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    provider?: string;
    name?: string;
  } | null;
  const provider = body?.provider ?? "generic";
  if (!(PROVIDERS as readonly string[]).includes(provider)) {
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }
  const name = (body?.name ?? "Default").slice(0, 60) || "Default";
  try {
    const [created] = await db
      .insert(webhookEndpoints)
      .values({
        userId: session.user.id,
        provider,
        name,
        inboundToken: randomBytes(24).toString("hex"),
      })
      .returning();
    return NextResponse.json(created);
  } catch {
    return NextResponse.json(
      { status: "failed", error: "nama+provider sudah dipakai" },
      { status: 409 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  await db
    .delete(webhookEndpoints)
    .where(
      and(
        eq(webhookEndpoints.id, id),
        eq(webhookEndpoints.userId, session.user.id),
      ),
    );
  return NextResponse.json({ status: "success" });
}
