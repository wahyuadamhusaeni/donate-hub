import { signIn } from "@/lib/auth";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">DonateHub</h1>
      <p className="text-zinc-400">
        Satu link webhook per sumber (Saweria, BagiBagi, dll) untuk semua user.
        Roblox ambil donasi dari 1 link feed per user — tanpa spreadsheet.
      </p>
      <div className="flex gap-3">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button className="rounded-lg bg-white px-5 py-2.5 font-medium text-black">
            Masuk dengan Google
          </button>
        </form>
        <form
          action={async () => {
            "use server";
            await signIn("discord", { redirectTo: "/dashboard" });
          }}
        >
          <button className="rounded-lg bg-[#5865F2] px-5 py-2.5 font-medium text-white">
            Masuk dengan Discord
          </button>
        </form>
      </div>
    </main>
  );
}
