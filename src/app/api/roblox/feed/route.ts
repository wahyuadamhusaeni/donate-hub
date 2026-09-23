import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { donations, robloxFeedTokens } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

// Kontrak kompatibel Apps Script:
// GET ?token=&unclaimed=1 -> [{id, donator, amount, message, row}]
// GET ?token=&claimRow=<id> -> klaim atomik (siapa cepat dia dapat)
// GET ?token=&unclaimRow=<id> -> kembalikan klaim (save gagal di Roblox)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const [feed] = await db
    .select()
    .from(robloxFeedTokens)
    .where(eq(robloxFeedTokens.token, token))
    .limit(1);

  if (!feed) {
    return NextResponse.json({ status: "failed" }, { status: 401 });
  }

  const claimRow = url.searchParams.get("claimRow");
  if (claimRow) {
    const updated = await db
      .update(donations)
      .set({ claimed: true, claimedAt: new Date() })
      .where(
        and(
          eq(donations.id, claimRow),
          eq(donations.userId, feed.userId),
          eq(donations.claimed, false),
        ),
      )
      .returning({ id: donations.id });
    if (updated.length > 0) {
      return NextResponse.json({ status: "success", row: claimRow });
    }
    return NextResponse.json({ status: "failed" });
  }

  const unclaimRow = url.searchParams.get("unclaimRow");
  if (unclaimRow) {
    const updated = await db
      .update(donations)
      .set({ claimed: false, claimedAt: null })
      .where(
        and(
          eq(donations.id, unclaimRow),
          eq(donations.userId, feed.userId),
        ),
      )
      .returning({ id: donations.id });
    if (updated.length > 0) {
      return NextResponse.json({ status: "success", row: unclaimRow });
    }
    return NextResponse.json({ status: "failed" });
  }

  const onlyUnclaimed = url.searchParams.get("unclaimed") === "1";
  const rows = await db
    .select({
      id: donations.id,
      donator: donations.donator,
      amount: donations.amount,
      message: donations.message,
    })
    .from(donations)
    .where(
      onlyUnclaimed
        ? and(eq(donations.userId, feed.userId), eq(donations.claimed, false))
        : eq(donations.userId, feed.userId),
    )
    .orderBy(asc(donations.createdAt))
    .limit(onlyUnclaimed ? 100 : 200);

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      donator: r.donator,
      amount: r.amount,
      message: r.message,
      row: r.id,
    })),
  );
}
