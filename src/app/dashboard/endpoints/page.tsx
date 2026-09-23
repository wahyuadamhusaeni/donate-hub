"use client";

import { useEffect, useState } from "react";

type Endpoint = {
  id: string;
  provider: string;
  name: string;
  inboundToken: string;
};

export default function EndpointsPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [provider, setProvider] = useState("saweria");
  const [name, setName] = useState("");
  const [feedUrl, setFeedUrl] = useState("");

  const load = async () => {
    const [eps, feed] = await Promise.all([
      fetch("/api/endpoints").then((r) => r.json()),
      fetch("/api/feed-token").then((r) => r.json()),
    ]);
    setEndpoints(eps);
    if (feed?.token) {
      setFeedUrl(
        `${window.location.origin}/api/roblox/feed?token=${feed.token}`,
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch("/api/endpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, name: name || "Default" }),
    });
    setName("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus endpoint ini? Donasi lama tetap tersimpan.")) return;
    await fetch(`/api/endpoints?id=${id}`, { method: "DELETE" });
    load();
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-zinc-800 p-4">
        <div className="mb-1 text-sm font-medium">Link Roblox kamu (1 link)</div>
        <div className="break-all font-mono text-xs text-zinc-300">
          {feedUrl || "…"}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => copy(feedUrl)}
            className="rounded border border-zinc-700 px-3 py-1 text-sm"
          >
            Copy
          </button>
          <span className="text-xs text-zinc-500">
            Pasang sebagai WEBHOOK_URL di SaweriaConfig. Tambahkan
            ?unclaimed=1 / ?claimRow= / ?unclaimRow= otomatis oleh Roblox.
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 p-4">
        <div className="mb-2 text-sm font-medium">Buat webhook baru</div>
        <div className="flex gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
          >
            <option value="saweria">Saweria</option>
            <option value="bagibagi">BagiBagi</option>
            <option value="generic">Generic</option>
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama mis. Saweria Live"
            className="w-full rounded-lg border border-zinc-800 bg-transparent px-3 py-2 text-sm"
          />
          <button
            onClick={create}
            className="rounded-lg bg-white px-4 text-sm font-medium text-black"
          >
            Buat
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {endpoints.map((e) => {
          const url = `${typeof window !== "undefined" ? window.location.origin : ""}/api/in/${e.inboundToken}`;
          return (
            <div
              key={e.id}
              className="rounded-lg border border-zinc-800 p-3 text-sm"
            >
              <div className="flex justify-between">
                <span className="font-medium">
                  {e.name} <span className="text-zinc-500">({e.provider})</span>
                </span>
                <button
                  onClick={() => remove(e.id)}
                  className="text-red-400 hover:underline"
                >
                  Hapus
                </button>
              </div>
              <div className="mt-1 break-all font-mono text-xs text-zinc-400">
                {url}
              </div>
              <button
                onClick={() => copy(url)}
                className="mt-2 rounded border border-zinc-700 px-3 py-1 text-xs"
              >
                Copy webhook URL
              </button>
            </div>
          );
        })}
        {!endpoints.length && (
          <div className="text-sm text-zinc-500">Belum ada endpoint.</div>
        )}
      </div>
    </div>
  );
}
