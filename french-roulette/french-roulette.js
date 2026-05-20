// French Roulette Calculator — pure math, no external dependency.
// 37-pocket wheel (0-36). House edge on most bets is 1/37 = 2.70%.
// La Partage / En Prison reduce the edge on even-money outside bets to 1.35%.

const BET_TYPES = {
  // payout ratio (win:1, profit per unit staked), numbers on the wheel
  "straight":   { payout: 35, numbers: 1,  label: "Straight up" },
  "split":      { payout: 17, numbers: 2,  label: "Split" },
  "street":     { payout: 11, numbers: 3,  label: "Street" },
  "corner":     { payout: 8,  numbers: 4,  label: "Corner" },
  "six-line":   { payout: 5,  numbers: 6,  label: "Six line" },
  "column":     { payout: 2,  numbers: 12, label: "Column" },
  "dozen":      { payout: 2,  numbers: 12, label: "Dozen" },
  "even-money": { payout: 1,  numbers: 18, label: "Even-money" },
};

const WHEEL_POCKETS = 37;

const root = document.querySelector(".pm-calc-french-roulette");
if (!root) console.warn("French Roulette: .pm-calc-french-roulette wrapper not found");

const betEl     = root?.querySelector("#pm-fr-bet");
const ruleEl    = root?.querySelector("#pm-fr-rule");
const stakeEl   = root?.querySelector("#pm-fr-stake");
const ruleNote  = root?.querySelector('[data-role="rule-note"]');
const errorEl   = root?.querySelector('[data-role="error"]');
const out = {
  winProb:   root?.querySelector('[data-role="win-prob"]'),
  payout:    root?.querySelector('[data-role="payout"]'),
  edge:      root?.querySelector('[data-role="edge"]'),
  evSpin:    root?.querySelector('[data-role="ev-spin"]'),
  ev100:     root?.querySelector('[data-role="ev-100"]'),
};

function fmtPct(v, digits = 2) {
  return `${v.toFixed(digits).replace(/\.?0+$/, "")}%`;
}

function fmtMoney(v) {
  return v.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Compute house edge as a fraction (e.g. 0.027 = 2.70%)
// EV per unit staked = win × p(win) + loss × p(lose)
// For even-money + La Partage/En Prison, loss on zero is -0.5 instead of -1.
function computeHouseEdge(betKey, rule) {
  const bet = BET_TYPES[betKey];
  const pWin = bet.numbers / WHEEL_POCKETS;
  const evWin = bet.payout * pWin;
  let evLose;
  if (betKey === "even-money" && (rule === "la-partage" || rule === "en-prison")) {
    // Probability of losing on a non-zero number that misses your side
    const pLoseNonZero = (WHEEL_POCKETS - 1 - bet.numbers) / WHEEL_POCKETS; // 18/37
    const pZero = 1 / WHEEL_POCKETS;
    evLose = -1 * pLoseNonZero + -0.5 * pZero;
  } else {
    const pLose = 1 - pWin;
    evLose = -1 * pLose;
  }
  const ev = evWin + evLose;
  return { houseEdge: -ev, pWin, pLose: 1 - pWin, payoutMultiplier: bet.payout };
}

function updateRuleNote() {
  const isEvenMoney = betEl.value === "even-money";
  if (!isEvenMoney) {
    ruleNote.textContent = "La Partage / En Prison only affect even-money outside bets.";
  } else if (ruleEl.value === "la-partage") {
    ruleNote.textContent = "Half stake returned when the ball lands on 0.";
  } else if (ruleEl.value === "en-prison") {
    ruleNote.textContent = "Bet held for the next spin when the ball lands on 0.";
  } else {
    ruleNote.textContent = "Full stake lost when the ball lands on 0.";
  }
}

function clear() {
  for (const el of Object.values(out)) if (el) el.textContent = "—";
  errorEl?.classList.remove("pm-visible");
}

function recompute() {
  const stakeRaw = stakeEl.value.trim();
  if (stakeRaw === "") { clear(); return; }

  try {
    const stake = Number(stakeRaw);
    if (!Number.isFinite(stake) || stake < 0) throw new Error("Stake must be a non-negative number");

    const result = computeHouseEdge(betEl.value, ruleEl.value);
    const payoutOnWin = stake * (1 + result.payoutMultiplier);
    const evPerSpin = -result.houseEdge * stake;

    out.winProb.textContent = fmtPct(result.pWin * 100, 2);
    out.payout.textContent  = fmtMoney(payoutOnWin);
    out.edge.textContent    = fmtPct(result.houseEdge * 100, 2);
    out.evSpin.textContent  = fmtMoney(evPerSpin);
    out.ev100.textContent   = fmtMoney(evPerSpin * 100);
    errorEl?.classList.remove("pm-visible");
  } catch (err) {
    for (const el of Object.values(out)) if (el) el.textContent = "—";
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.add("pm-visible");
    }
  }
}

betEl?.addEventListener("change", () => { updateRuleNote(); recompute(); });
ruleEl?.addEventListener("change", () => { updateRuleNote(); recompute(); });
stakeEl?.addEventListener("input", recompute);

updateRuleNote();
recompute();
