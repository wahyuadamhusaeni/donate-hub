import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy: jangan throw saat build (DATABASE_URL belum ada saat collect page).
// Error baru muncul saat query pertama bila env memang kosong.
const connectionString = process.env.DATABASE_URL ?? "";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: any = (globalThis as any).__donatehub_db;
if (!cached) {
  const client = postgres(connectionString, { prepare: false });
  cached = drizzle(client, { schema });
  (globalThis as any).__donatehub_db = cached;
}
export const db = cached as ReturnType<typeof drizzle<typeof schema>>;
