"use client";

import { useEffect, useState } from "react";

type Donation = {
  id: string;
  donator: string;
  amount: number;
  message: string;
  claimed: boolean;
  createdAt: string;
};

type Stats = {
  total: number;
  count: number;
  today: number;
  top: { donator: string; total: number }[];
};

const fmtRp = (n: number) => "Rp " + Number(n).toLocaleString("id-ID");

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const [s, d] = await Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch(`/api/donations?q=${encodeURIComponent(q)}`).then((r) => r.json()),
    ]);
    setStats(s);
    setDonations(d);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-800 p-4">
          <div className="text-xs text-zinc-500">Total masuk</div>
          <div className="text-xl font-bold">{stats ? fmtRp(stats.total) : "…"}</div>
        </div>
        <div className="rounded-lg border border-zinc-800 p-4">
          <div className="text-xs text-zinc-500">Hari ini</div>
          <div className="text-xl font-bold">{stats ? fmtRp(stats.today) : "…"}</div>
        </div>
        <div className="rounded-lg border border-zinc-800 p-4">
          <div className="text-xs text-zinc-500">Transaksi</div>
          <div className="text-xl font-bold">{stats ? stats.count : "…"}</div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 p-4">
        <div className="mb-2 text-sm font-medium">Top donatur</div>
        {stats?.top?.length ? (
          <ol className="flex flex-col gap-1 text-sm">
            {stats.top.map((t, i) => (
              <li key={t.donator} className="flex justify-between">
                <span>
                  #{i + 1} {t.donator}
                </span>
                <span className="text-zinc-400">{fmtRp(Number(t.total))}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-sm text-zinc-500">Belum ada data.</div>
        )}
      </div>

      <div>
        <div className="mb-2 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Cari nama / pesan…"
            className="w-full rounded-lg border border-zinc-800 bg-transparent px-3 py-2 text-sm"
          />
          <button
            onClick={load}
            className="rounded-lg border border-zinc-700 px-4 text-sm"
          >
            Cari
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {donations.map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-zinc-800 p-3 text-sm"
            >
              <div className="flex justify-between">
                <span className="font-medium">{d.donator}</span>
                <span className="font-bold">{fmtRp(d.amount)}</span>
              </div>
              {d.message && (
                <div className="mt-1 text-zinc-400">“{d.message}”</div>
              )}
              <div className="mt-1 text-xs text-zinc-600">
                {new Date(d.createdAt).toLocaleString("id-ID")}
                {d.claimed ? " • sudah dibaca Roblox" : ""}
              </div>
            </div>
          ))}
          {!donations.length && (
            <div className="text-sm text-zinc-500">Belum ada donasi.</div>
          )}
        </div>
      </div>
    </div>
  );
}
