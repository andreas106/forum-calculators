// Casino Bonus Playthrough Calculator — pure math, no external dependency.
//
// Wagering required = wagerMultiplier × (bonus or deposit + bonus)
// Actual wagering to clear = wagering required / (contribution % / 100)
// Expected loss = actual wagering × (game edge % / 100)
// Net EV = bonus − expected loss

const root = document.querySelector(".pm-calc-casino-bonus");
if (!root) console.warn("Casino Bonus: .pm-calc-casino-bonus wrapper not found");

const depositEl = root?.querySelector("#pm-bonus-deposit");
const bonusEl   = root?.querySelector("#pm-bonus-amount");
const wagerEl   = root?.querySelector("#pm-bonus-wager");
const basisEl   = root?.querySelector("#pm-bonus-basis");
const edgeEl    = root?.querySelector("#pm-bonus-edge");
const contribEl = root?.querySelector("#pm-bonus-contrib");
const errorEl   = root?.querySelector('[data-role="error"]');
const out = {
  wagerReq:    root?.querySelector('[data-role="wager-req"]'),
  wagerActual: root?.querySelector('[data-role="wager-actual"]'),
  expLoss:     root?.querySelector('[data-role="exp-loss"]'),
  netEv:       root?.querySelector('[data-role="net-ev"]'),
  netEvPct:    root?.querySelector('[data-role="net-ev-pct"]'),
  beEdge:      root?.querySelector('[data-role="be-edge"]'),
};

function fmtMoney(v) {
  const sign = v >= 0 ? "+" : "−";
  return `${sign}${Math.abs(v).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtMoneyPlain(v) {
  return v.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v, digits = 2) {
  return `${v.toFixed(digits).replace(/\.?0+$/, "")}%`;
}

function readNum(el, label, { min = 0 } = {}) {
  const raw = el.value.trim();
  if (raw === "") throw new Error(`${label} is required`);
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`${label} must be a number`);
  if (n < min) throw new Error(`${label} must be ≥ ${min}`);
  return n;
}

function clear() {
  for (const el of Object.values(out)) if (el) {
    el.textContent = "—";
    el.classList.remove("pm-good", "pm-bad");
  }
  errorEl?.classList.remove("pm-visible");
}

function recompute() {
  // Treat any empty required field as "not ready yet"
  if (!depositEl.value.trim() || !bonusEl.value.trim() || !wagerEl.value.trim() ||
      !edgeEl.value.trim() || !contribEl.value.trim()) {
    clear();
    return;
  }

  try {
    const deposit  = readNum(depositEl, "Deposit");
    const bonus    = readNum(bonusEl,   "Bonus amount");
    const wagerX   = readNum(wagerEl,   "Wagering multiplier");
    const edgePct  = readNum(edgeEl,    "Game house edge");
    const contribP = readNum(contribEl, "Game contribution", { min: 0.01 });

    const basis = basisEl.value === "dpb" ? (deposit + bonus) : bonus;
    const wagerRequired = wagerX * basis;
    const wagerActual = wagerRequired / (contribP / 100);
    const expLoss = wagerActual * (edgePct / 100);
    const netEv = bonus - expLoss;
    const netEvPct = deposit > 0 ? (netEv / deposit) * 100 : 0;
    // Break-even edge: edge where bonus = wagering * edge → edge = bonus / wagerActual
    const beEdgePct = wagerActual > 0 ? (bonus / wagerActual) * 100 : 0;

    out.wagerReq.textContent    = fmtMoneyPlain(wagerRequired);
    out.wagerActual.textContent = fmtMoneyPlain(wagerActual);
    out.expLoss.textContent     = fmtMoneyPlain(expLoss);
    out.netEv.textContent       = fmtMoney(netEv);
    out.netEvPct.textContent    = `${netEv >= 0 ? "+" : "−"}${Math.abs(netEvPct).toFixed(2).replace(/\.?0+$/, "")}%`;
    out.beEdge.textContent      = fmtPct(beEdgePct, 2);

    // Colour net EV based on sign
    out.netEv.classList.toggle("pm-good", netEv >= 0);
    out.netEv.classList.toggle("pm-bad", netEv < 0);
    out.netEvPct.classList.toggle("pm-good", netEv >= 0);
    out.netEvPct.classList.toggle("pm-bad", netEv < 0);

    errorEl?.classList.remove("pm-visible");
  } catch (err) {
    for (const el of Object.values(out)) if (el) el.textContent = "—";
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.add("pm-visible");
    }
  }
}

depositEl?.addEventListener("input", recompute);
bonusEl?.addEventListener("input", recompute);
wagerEl?.addEventListener("input", recompute);
basisEl?.addEventListener("change", recompute);
edgeEl?.addEventListener("input", recompute);
contribEl?.addEventListener("input", recompute);

recompute();
