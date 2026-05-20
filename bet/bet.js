import { convertOdds, payout, profit } from "../odds-math.js";

const root = document.querySelector(".pm-calc-bet");
if (!root) console.warn("Bet Calculator: .pm-calc-bet wrapper not found");

const stakeEl   = root?.querySelector("#pm-bet-stake");
const oddsEl    = root?.querySelector("#pm-bet-odds");
const formatEl  = root?.querySelector("#pm-bet-format");
const errorEl   = root?.querySelector('[data-role="error"]');
const out = {
  payout:   root?.querySelector('[data-role="payout"]'),
  profit:   root?.querySelector('[data-role="profit"]'),
  implied:  root?.querySelector('[data-role="implied"]'),
  decimal:  root?.querySelector('[data-role="decimal"]'),
};

function fmtMoney(v) {
  return v.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtNum(v, digits = 4) {
  const s = v.toFixed(digits);
  return s.replace(/\.?0+$/, "");
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

function clear() {
  for (const el of Object.values(out)) if (el) el.textContent = "—";
  errorEl?.classList.remove("pm-visible");
}

function recompute() {
  const stakeRaw = stakeEl.value.trim();
  const oddsRaw = oddsEl.value.trim();
  const format = formatEl.value;

  if (stakeRaw === "" || oddsRaw === "") { clear(); return; }

  try {
    const stake = Number(stakeRaw);
    if (!Number.isFinite(stake) || stake < 0) throw new Error("Stake must be a non-negative number");

    const oddsValue = readOdds(oddsRaw, format);
    const all = convertOdds(oddsValue, format);
    const decimal = all.decimal;

    out.payout.textContent  = fmtMoney(payout(stake, decimal));
    out.profit.textContent  = fmtMoney(profit(stake, decimal));
    out.implied.textContent = `${fmtNum(all.implied * 100, 2)}%`;
    out.decimal.textContent = fmtNum(decimal, 4);
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
    american:   "+150",
    decimal:    "2.50",
    fractional: "3/2",
    hongkong:   "1.50",
    indonesian: "1.50",
    malay:      "-0.67",
    implied:    "40",
  };
  oddsEl.placeholder = placeholders[formatEl.value] || "";
  oddsEl.inputMode = formatEl.value === "fractional" ? "text" : "decimal";
}

stakeEl?.addEventListener("input", recompute);
oddsEl?.addEventListener("input", recompute);
formatEl?.addEventListener("change", () => {
  updateOddsPlaceholder();
  recompute();
});

updateOddsPlaceholder();
