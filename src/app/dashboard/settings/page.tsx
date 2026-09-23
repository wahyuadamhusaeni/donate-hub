"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [msg, setMsg] = useState("");

  const regenerate = async () => {
    if (
      !confirm(
        "Token lama langsung mati. Update WEBHOOK_URL di semua server Roblox. Lanjut?",
      )
    )
      return;
    const r = await fetch("/api/feed-token", { method: "POST" }).then((res) =>
      res.json(),
    );
    setMsg(r?.token ? `Token baru: ${r.token}` : "Gagal.");
  };

  return (
    <div className="rounded-lg border border-zinc-800 p-4">
      <div className="mb-1 text-sm font-medium">Token feed Roblox</div>
      <p className="mb-3 text-sm text-zinc-500">
        Token ini seperti password link feed kamu. Regenerate bila bocor.
      </p>
      <button
        onClick={regenerate}
        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white"
      >
        Regenerate token
      </button>
      {msg && <div className="mt-2 break-all font-mono text-xs">{msg}</div>}
    </div>
  );
}
