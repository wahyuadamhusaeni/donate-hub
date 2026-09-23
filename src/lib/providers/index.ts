export type NormalizedDonation = {
  externalId: string | null;
  donator: string;
  amount: number; // integer, satuan terkecil
  currency: string;
  message: string;
};

// Tiap provider: body mentah -> bentuk normal. Return null = payload tak dikenal.
export type ProviderAdapter = (body: unknown) => NormalizedDonation | null;

const asRecord = (body: unknown): Record<string, unknown> =>
  typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

const str = (v: unknown, fallback = "") =>
  typeof v === "string" ? v : fallback;

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
};

export const saweriaAdapter: ProviderAdapter = (body) => {
  const b = asRecord(body);
  const donator =
    str(b.donator_name) || str(b.donator) || "Anonim";
  const amount = num(b.amount_raw ?? b.amount);
  if (!donator && amount <= 0) return null;
  const externalId =
    str(b.id) || str(b.transaction_id) || str(b.notif_id) || null;
  return {
    externalId:
      externalId && externalId !== "00000000-0000-0000-0000-000000000000"
        ? externalId
        : null,
    donator,
    amount,
    currency: "IDR",
    message: str(b.message),
  };
};

export const bagibagiAdapter: ProviderAdapter = (body) => {
  // TODO: petakan field BagiBagi setelah ada sample payload asli.
  const b = asRecord(body);
  const donator = str(b.username) || str(b.donator) || str(b.name);
  const amount = num(b.nominal ?? b.amount);
  if (!donator && amount <= 0) return null;
  return {
    externalId: str(b.trx_id) || str(b.id) || null,
    donator: donator || "Anonim",
    amount,
    currency: "IDR",
    message: str(b.message) || str(b.ucapan),
  };
};

export const genericAdapter: ProviderAdapter = (body) => {
  const b = asRecord(body);
  const amount = num(b.amount);
  if (amount <= 0) return null;
  return {
    externalId: str(b.id) || null,
    donator: str(b.donator) || "Anonim",
    amount,
    currency: str(b.currency) || "IDR",
    message: str(b.message),
  };
};

const adapters: Record<string, ProviderAdapter> = {
  saweria: saweriaAdapter,
  bagibagi: bagibagiAdapter,
  generic: genericAdapter,
};

export function normalizeDonation(
  provider: string,
  body: unknown,
): (NormalizedDonation & { raw: unknown }) | null {
  const adapter = adapters[provider] ?? genericAdapter;
  const result = adapter(body);
  if (!result) return null;
  return { ...result, raw: body };
}
