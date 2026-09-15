const CITY_ZONE: Record<string, number> = {
  jakarta: 0,
  tangerang: 2000,
  depok: 2000,
  bekasi: 2500,
  bogor: 3000,
  bandung: 5000,
  semarang: 7000,
  yogyakarta: 8000,
  surabaya: 9000,
  malang: 10000,
  denpasar: 14000,
  medan: 16000,
  makassar: 17000,
};

const COURIER: Record<string, { label: string; multiplier: number; eta: string; perKg: number }> = {
  JNE: { label: "JNE Regular", multiplier: 1, eta: "2-4 hari", perKg: 6000 },
  JNT: { label: "J&T Express", multiplier: 0.9, eta: "2-3 hari", perKg: 5000 },
  SICEPAT: { label: "SiCepat REG", multiplier: 1.15, eta: "1-3 hari", perKg: 7000 },
};

export function citySurcharge(city: string) {
  const key = city.trim().toLowerCase();
  const hit = Object.entries(CITY_ZONE).find(([k]) => key.includes(k));
  return hit ? hit[1] : 12000;
}

export function quoteShipping(opts: { city: string; courier: string; itemCount?: number; totalWeightGram?: number; baseFee?: number }) {
  const base = opts.baseFee && opts.baseFee > 0 ? opts.baseFee : 15000;
  const kg = Math.max(1, Math.ceil((opts.totalWeightGram ?? (opts.itemCount ?? 1) * 600) / 1000));
  const itemExtra = Math.max(0, (opts.itemCount ?? 1) - 1) * 1000;
  const zone = citySurcharge(opts.city);
  const courier = COURIER[opts.courier] ?? COURIER.JNE;
  const fee = Math.round((base + courier.perKg * (kg - 1) + itemExtra + zone) * courier.multiplier);
  return { fee, eta: courier.eta, label: courier.label, courier: opts.courier, kg };
}

export function allQuotes(opts: { city: string; itemCount?: number; totalWeightGram?: number; baseFee?: number }) {
  return Object.keys(COURIER).map((courier) => quoteShipping({ ...opts, courier }));
}
