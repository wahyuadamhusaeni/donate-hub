import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className="hover:underline">
            Donasi
          </Link>
          <Link href="/dashboard/endpoints" className="hover:underline">
            Webhook
          </Link>
          <Link href="/dashboard/settings" className="hover:underline">
            Pengaturan
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span>{session.user.name ?? session.user.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="rounded border border-zinc-700 px-2 py-1">
              Keluar
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
