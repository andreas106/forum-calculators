import { convertOdds, decimalToAmerican, payout, profit } from "../odds-math.js";

const MIN_LEGS = 2;
const MAX_LEGS = 20;

const root = document.querySelector(".pm-calc-parlay");
if (!root) console.warn("Parlay Calculator: .pm-calc-parlay wrapper not found");

const stakeEl    = root?.querySelector("#pm-parlay-stake");
const formatEl   = root?.querySelector("#pm-parlay-format");
const legsEl     = root?.querySelector('[data-role="legs"]');
const addBtn     = root?.querySelector('[data-role="add-leg"]');
const errorEl    = root?.querySelector('[data-role="error"]');
const out = {
  decimal:  root?.querySelector('[data-role="combined-decimal"]'),
  american: root?.querySelector('[data-role="combined-american"]'),
  payout:   root?.querySelector('[data-role="payout"]'),
  profit:   root?.querySelector('[data-role="profit"]'),
  implied:  root?.querySelector('[data-role="implied"]'),
};

const PLACEHOLDERS = {
  american: "-110", decimal: "1.91", fractional: "10/11",
  hongkong: "0.91", indonesian: "-1.10", malay: "0.91", implied: "52.38",
};

function fmtMoney(v) {
  return v.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtNum(v, digits = 4) {
  return v.toFixed(digits).replace(/\.?0+$/, "");
}

function legPlaceholder() {
  return PLACEHOLDERS[formatEl?.value] ?? "";
}

function makeLegRow(index) {
  const row = document.createElement("div");
  row.className = "pm-leg-row";
  row.innerHTML = `
    <span class="pm-leg-label">Leg ${index + 1}</span>
    <input type="text" data-role="leg" placeholder="${legPlaceholder()}" />
    <button type="button" class="pm-leg-remove" data-role="remove" title="Remove leg">×</button>
  `;
  row.querySelector('[data-role="leg"]').addEventListener("input", recompute);
  row.querySelector('[data-role="remove"]').addEventListener("click", () => removeLeg(row));
  return row;
}

function addLeg() {
  if (legsEl.children.length >= MAX_LEGS) return;
  const row = makeLegRow(legsEl.children.length);
  legsEl.appendChild(row);
  refreshLegState();
  recompute();
}

function removeLeg(row) {
  if (legsEl.children.length <= MIN_LEGS) return;
  row.remove();
  // Relabel
  Array.from(legsEl.children).forEach((child, i) => {
    child.querySelector(".pm-leg-label").textContent = `Leg ${i + 1}`;
  });
  refreshLegState();
  recompute();
}

function refreshLegState() {
  const count = legsEl.children.length;
  Array.from(legsEl.children).forEach((row) => {
    row.querySelector('[data-role="remove"]').disabled = count <= MIN_LEGS;
  });
  if (addBtn) addBtn.disabled = count >= MAX_LEGS;
}

function refreshPlaceholders() {
  const ph = legPlaceholder();
  legsEl.querySelectorAll('input[data-role="leg"]').forEach((el) => { el.placeholder = ph; });
}

function readLegOdds(raw, format) {
  if (raw === "") return null;
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
  const format = formatEl.value;
  const legInputs = Array.from(legsEl.querySelectorAll('input[data-role="leg"]'));
  const legRaws = legInputs.map((el) => el.value.trim());

  // Need stake + at least 2 filled legs to display anything meaningful
  const filledLegs = legRaws.filter((v) => v !== "");
  if (stakeRaw === "" || filledLegs.length < 2) { clear(); return; }

  try {
    const stake = Number(stakeRaw);
    if (!Number.isFinite(stake) || stake < 0) throw new Error("Stake must be a non-negative number");

    let combined = 1;
    let combinedImplied = 1;
    for (const raw of filledLegs) {
      const value = readLegOdds(raw, format);
      const all = convertOdds(value, format);
      combined *= all.decimal;
      combinedImplied *= all.implied;
    }

    out.decimal.textContent  = fmtNum(combined, 4);
    out.american.textContent = combined > 1
      ? (() => { const a = decimalToAmerican(combined); return a > 0 ? `+${a}` : `${a}`; })()
      : "—";
    out.payout.textContent   = fmtMoney(payout(stake, combined));
    out.profit.textContent   = fmtMoney(profit(stake, combined));
    out.implied.textContent  = `${(combinedImplied * 100).toFixed(combinedImplied < 0.01 ? 4 : 2).replace(/\.?0+$/, "")}%`;
    errorEl?.classList.remove("pm-visible");
  } catch (err) {
    for (const el of Object.values(out)) if (el) el.textContent = "—";
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.add("pm-visible");
    }
  }
}

// Initial setup
for (let i = 0; i < MIN_LEGS; i++) legsEl.appendChild(makeLegRow(i));
refreshLegState();

stakeEl?.addEventListener("input", recompute);
formatEl?.addEventListener("change", () => {
  refreshPlaceholders();
  recompute();
});
addBtn?.addEventListener("click", addLeg);
