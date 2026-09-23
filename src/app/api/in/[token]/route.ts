import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { donations, webhookEndpoints } from "@/lib/db/schema";
import { normalizeDonation } from "@/lib/providers";
import { eq } from "drizzle-orm";

// POST /api/in/:inboundToken — terima webhook provider apa pun.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const [endpoint] = await db
    .select()
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.inboundToken, token))
    .limit(1);

  if (!endpoint || !endpoint.isActive) {
    return NextResponse.json({ status: "failed" }, { status: 404 });
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }

  const normalized = normalizeDonation(endpoint.provider, body);
  if (!normalized || normalized.amount <= 0) {
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }

  try {
    await db.insert(donations).values({
      endpointId: endpoint.id,
      userId: endpoint.userId,
      externalId: normalized.externalId,
      donator: normalized.donator,
      amount: normalized.amount,
      currency: normalized.currency,
      message: normalized.message,
      rawJson: normalized.raw as Record<string, unknown>,
    });
  } catch (err) {
    // Duplikat (unique endpoint+externalId) = provider retry → tetap 200.
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json({ status: "success", duplicate: true });
    }
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "success" });
}
