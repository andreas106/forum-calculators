// odds-math.js — shared math library for all calculators.
// Pure functions, no DOM, no side effects. Decimal odds are the canonical
// internal format; every other format converts via decimal.
//
// Format reference:
//   Decimal      2.50         total return per 1 unit staked (includes stake)
//   American     +150 / -200  US sportsbook standard
//   Fractional   "3/2"        UK / horse racing standard
//   Implied      0.40         probability in [0, 1]
//   Hong Kong    1.50         net profit per 1 unit staked (excludes stake)
//   Indonesian   1.50 / -2.00 same as American divided by 100
//   Malay        0.50 / -0.67 capped at [-1, 1]; positive = underdog, negative = favourite

// ---------- decimal ↔ american ----------

export function decimalToAmerican(decimal) {
  if (decimal <= 1) throw new Error("Decimal odds must be > 1");
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

export function americanToDecimal(american) {
  const a = Number(american);
  if (!Number.isFinite(a) || a === 0) throw new Error("Invalid American odds");
  if (a > 0) return 1 + a / 100;
  return 1 + 100 / -a;
}

// ---------- decimal ↔ fractional ----------

export function decimalToFractional(decimal) {
  if (decimal <= 1) throw new Error("Decimal odds must be > 1");
  const net = decimal - 1;
  // Approximate net as a fraction with denominator ≤ 1000 via continued fractions.
  let h1 = 1, h0 = 0, k1 = 0, k0 = 1;
  let b = net;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > 1000) break;
    h0 = h1; h1 = h2;
    k0 = k1; k1 = k2;
    if (b - a < 1e-9) break;
    b = 1 / (b - a);
  }
  return `${h1}/${k1}`;
}

export function fractionalToDecimal(fractional) {
  const s = String(fractional).trim();
  const m = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (!m) throw new Error("Fractional odds must look like '3/2'");
  const num = Number(m[1]);
  const den = Number(m[2]);
  if (den === 0) throw new Error("Fractional denominator cannot be 0");
  return 1 + num / den;
}

// ---------- decimal ↔ implied probability ----------

export function decimalToImplied(decimal) {
  if (decimal <= 1) throw new Error("Decimal odds must be > 1");
  return 1 / decimal;
}

export function impliedToDecimal(prob) {
  if (prob <= 0 || prob >= 1) throw new Error("Probability must be in (0, 1)");
  return 1 / prob;
}

// ---------- decimal ↔ hong kong ----------

export function decimalToHongKong(decimal) {
  if (decimal <= 1) throw new Error("Decimal odds must be > 1");
  return decimal - 1;
}

export function hongKongToDecimal(hk) {
  const h = Number(hk);
  if (!Number.isFinite(h) || h <= 0) throw new Error("Hong Kong odds must be > 0");
  return 1 + h;
}

// ---------- decimal ↔ indonesian ----------

export function decimalToIndonesian(decimal) {
  if (decimal <= 1) throw new Error("Decimal odds must be > 1");
  if (decimal >= 2) return decimal - 1;
  return -1 / (decimal - 1);
}

export function indonesianToDecimal(indo) {
  const i = Number(indo);
  if (!Number.isFinite(i) || i === 0) throw new Error("Invalid Indonesian odds");
  if (i >= 1) return 1 + i;
  if (i <= -1) return 1 + 1 / -i;
  throw new Error("Indonesian odds must be ≥ 1 or ≤ -1");
}

// ---------- decimal ↔ malay ----------

export function decimalToMalay(decimal) {
  if (decimal <= 1) throw new Error("Decimal odds must be > 1");
  const net = decimal - 1;
  if (net <= 1) return net;       // underdog: positive, ≤ 1
  return -1 / net;                // favourite: negative, ≥ -1
}

export function malayToDecimal(malay) {
  const m = Number(malay);
  if (!Number.isFinite(m) || m === 0) throw new Error("Invalid Malay odds");
  if (m > 0 && m <= 1) return 1 + m;
  if (m < 0 && m >= -1) return 1 + 1 / -m;
  throw new Error("Malay odds must be in [-1, 0) or (0, 1]");
}

// ---------- convenience: any → all ----------

const FORMATS = ["decimal", "american", "fractional", "implied", "hongkong", "indonesian", "malay"];

const TO_DECIMAL = {
  decimal: (v) => Number(v),
  american: americanToDecimal,
  fractional: fractionalToDecimal,
  implied: impliedToDecimal,
  hongkong: hongKongToDecimal,
  indonesian: indonesianToDecimal,
  malay: malayToDecimal,
};

const FROM_DECIMAL = {
  decimal: (d) => d,
  american: decimalToAmerican,
  fractional: decimalToFractional,
  implied: decimalToImplied,
  hongkong: decimalToHongKong,
  indonesian: decimalToIndonesian,
  malay: decimalToMalay,
};

export function convertOdds(value, fromFormat) {
  const from = String(fromFormat).toLowerCase();
  if (!TO_DECIMAL[from]) throw new Error(`Unknown format: ${fromFormat}`);
  const decimal = TO_DECIMAL[from](value);
  if (!(decimal > 1)) throw new Error("Resulting decimal odds must be > 1");
  const out = {};
  for (const f of FORMATS) out[f] = FROM_DECIMAL[f](decimal);
  return out;
}

// ---------- payout helpers ----------

export function payout(stake, decimalOdds) {
  if (stake < 0) throw new Error("Stake must be ≥ 0");
  if (decimalOdds <= 1) throw new Error("Decimal odds must be > 1");
  return stake * decimalOdds;
}

export function profit(stake, decimalOdds) {
  return payout(stake, decimalOdds) - stake;
}
