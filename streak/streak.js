import { convertOdds } from "../odds-math.js";

const root = document.querySelector(".pm-calc-streak");
if (!root) console.warn("Streak Calculator: .pm-calc-streak wrapper not found");

const oddsEl   = root?.querySelector("#pm-streak-odds");
const formatEl = root?.querySelector("#pm-streak-format");
const nEl      = root?.querySelector("#pm-streak-n");
const mEl      = root?.querySelector("#pm-streak-m");
const errorEl  = root?.querySelector('[data-role="error"]');
const out = {
  p:        root?.querySelector('[data-role="p"]'),
  straight: root?.querySelector('[data-role="straight"]'),
  atleast:  root?.querySelector('[data-role="atleast"]'),
  none:     root?.querySelector('[data-role="none"]'),
};

function fmtPct(v, digits = 2) {
  if (!Number.isFinite(v)) return "—";
  return `${v.toFixed(digits).replace(/\.?0+$/, "")}%`;
}

function readOdds(raw, format) {
  if (format === "implied") {
    const pct = Number(raw);
    if (!Number.isFinite(pct)) throw new Error("Implied % must be a number");
    return pct / 100;
  }
  if (format === "fractional") return raw;
  const n = Number(String(raw).replace(/^\+/, ""));
  if (!Number.isFinite(n)) throw new Error(`${format} odds must be a number`);
  return n;
}

// P(no streak of N consecutive wins in M independent trials),
// each trial winning with probability p.
// Markov walk over the "current run of wins" state, 0..N-1.
// Hitting state N is absorbed as "streak achieved" — those probability mass
// is dropped from s, so sum(s) at the end is P(no N-streak).
function probNoStreak(p, N, M) {
  if (N <= 0) return 0;
  if (M < N) return 1;
  const q = 1 - p;
  let s = new Array(N).fill(0);
  s[0] = 1;
  for (let t = 0; t < M; t++) {
    const next = new Array(N).fill(0);
    for (let k = 0; k < N; k++) {
      if (s[k] === 0) continue;
      // Win: k → k+1 (absorbed if k+1 = N)
      if (k + 1 < N) next[k + 1] += s[k] * p;
      // Loss: k → 0
      next[0] += s[k] * q;
    }
    s = next;
  }
  return s.reduce((a, b) => a + b, 0);
}

function clear() {
  for (const el of Object.values(out)) if (el) el.textContent = "—";
  errorEl?.classList.remove("pm-visible");
}

function recompute() {
  const oddsRaw = oddsEl.value.trim();
  const format = formatEl.value;
  const N = parseInt(nEl.value, 10);
  const M = parseInt(mEl.value, 10);

  if (oddsRaw === "" || !Number.isFinite(N) || !Number.isFinite(M)) { clear(); return; }

  try {
    if (N < 1) throw new Error("Streak length must be at least 1");
    if (M < 1) throw new Error("Series length must be at least 1");
    if (N > M) throw new Error("Streak length cannot exceed series length");

    const oddsValue = readOdds(oddsRaw, format);
    const all = convertOdds(oddsValue, format);
    const p = all.implied;

    const pStraight = Math.pow(p, N);
    const pNone = probNoStreak(p, N, M);
    const pAtLeast = 1 - pNone;

    out.p.textContent        = fmtPct(p * 100, 2);
    out.straight.textContent = fmtPct(pStraight * 100, pStraight < 0.0001 ? 6 : 2);
    out.atleast.textContent  = fmtPct(pAtLeast * 100, pAtLeast < 0.001 ? 4 : 2);
    out.none.textContent     = fmtPct(pNone * 100, 2);
    errorEl?.classList.remove("pm-visible");
  } catch (err) {
    for (const el of Object.values(out)) if (el) el.textContent = "—";
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.add("pm-visible");
    }
  }
}

function updateOddsPlaceholder() {
  const placeholders = {
    american:   "-110",
    decimal:    "1.91",
    fractional: "10/11",
    hongkong:   "0.91",
    indonesian: "-1.10",
    malay:      "0.91",
    implied:    "52.38",
  };
  oddsEl.placeholder = placeholders[formatEl.value] || "";
  oddsEl.inputMode = formatEl.value === "fractional" ? "text" : "decimal";
}

oddsEl?.addEventListener("input", recompute);
nEl?.addEventListener("input", recompute);
mEl?.addEventListener("input", recompute);
formatEl?.addEventListener("change", () => {
  updateOddsPlaceholder();
  recompute();
});

updateOddsPlaceholder();
recompute();
