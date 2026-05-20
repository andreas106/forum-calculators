// Baccarat Calculator — pure math, no external dependency.
// Probabilities from an 8-deck shoe (casino standard).

// Wizard of Odds reference figures for 8-deck baccarat (10-digit precision)
const P_BANKER     = 0.4585974522;
const P_PLAYER     = 0.4462466235;
const P_TIE        = 0.0951559242;
// Pair on first two cards: 31/415 (after first card, 31 of the same rank
// remain among the 415 cards left in an 8-deck shoe).
const P_BANKER_PAIR = 31 / 415;
const P_PLAYER_PAIR = 31 / 415;

const BETS = {
  banker: {
    label: "Banker",
    payout: 0.95, // 1:1 minus 5% commission
    pWin: P_BANKER,
    pPush: P_TIE,
    pLose: P_PLAYER,
  },
  player: {
    label: "Player",
    payout: 1,
    pWin: P_PLAYER,
    pPush: P_TIE,
    pLose: P_BANKER,
  },
  "tie-8": {
    label: "Tie (8:1)",
    payout: 8,
    pWin: P_TIE,
    pPush: 0,
    pLose: 1 - P_TIE,
  },
  "tie-9": {
    label: "Tie (9:1)",
    payout: 9,
    pWin: P_TIE,
    pPush: 0,
    pLose: 1 - P_TIE,
  },
  "banker-pair": {
    label: "Banker Pair",
    payout: 11,
    pWin: P_BANKER_PAIR,
    pPush: 0,
    pLose: 1 - P_BANKER_PAIR,
  },
  "player-pair": {
    label: "Player Pair",
    payout: 11,
    pWin: P_PLAYER_PAIR,
    pPush: 0,
    pLose: 1 - P_PLAYER_PAIR,
  },
};

const root = document.querySelector(".pm-calc-baccarat");
if (!root) console.warn("Baccarat: .pm-calc-baccarat wrapper not found");

const betEl   = root?.querySelector("#pm-bac-bet");
const stakeEl = root?.querySelector("#pm-bac-stake");
const errorEl = root?.querySelector('[data-role="error"]');
const out = {
  winProb:  root?.querySelector('[data-role="win-prob"]'),
  pushProb: root?.querySelector('[data-role="push-prob"]'),
  loseProb: root?.querySelector('[data-role="lose-prob"]'),
  payout:   root?.querySelector('[data-role="payout"]'),
  edge:     root?.querySelector('[data-role="edge"]'),
  evHand:   root?.querySelector('[data-role="ev-hand"]'),
  ev100:    root?.querySelector('[data-role="ev-100"]'),
};

function fmtPct(v, digits = 2) {
  return `${v.toFixed(digits).replace(/\.?0+$/, "")}%`;
}

function fmtMoney(v) {
  return v.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// EV per unit staked for a baccarat bet:
//   EV = payout * P(win) + 0 * P(push) + (-1) * P(lose)
// House edge = -EV
function computeEdge(bet) {
  const ev = bet.payout * bet.pWin + 0 * bet.pPush + -1 * bet.pLose;
  return { ev, edge: -ev };
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

    const bet = BETS[betEl.value];
    const { edge } = computeEdge(bet);
    const payoutOnWin = stake * (1 + bet.payout);
    const evPerHand = -edge * stake;

    out.winProb.textContent  = fmtPct(bet.pWin * 100, 2);
    out.pushProb.textContent = bet.pPush > 0 ? fmtPct(bet.pPush * 100, 2) : "—";
    out.loseProb.textContent = fmtPct(bet.pLose * 100, 2);
    out.payout.textContent   = fmtMoney(payoutOnWin);
    out.edge.textContent     = fmtPct(edge * 100, 2);
    out.evHand.textContent   = fmtMoney(evPerHand);
    out.ev100.textContent    = fmtMoney(evPerHand * 100);
    errorEl?.classList.remove("pm-visible");
  } catch (err) {
    for (const el of Object.values(out)) if (el) el.textContent = "—";
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.add("pm-visible");
    }
  }
}

betEl?.addEventListener("change", recompute);
stakeEl?.addEventListener("input", recompute);

recompute();
