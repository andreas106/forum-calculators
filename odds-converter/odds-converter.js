import { convertOdds } from "../odds-math.js";

// Scope everything inside the calc wrapper so multiple calcs can coexist on
// the same page without colliding.
const root = document.querySelector(".pm-calc-odds-converter");
if (!root) {
  console.warn("Odds Converter: .pm-calc-odds-converter wrapper not found");
}

const inputs = root ? Array.from(root.querySelectorAll("input[data-format]")) : [];
const errorEl = root ? root.querySelector('[data-role="error"]') : null;

const FORMATTERS = {
  decimal:     (v) => v.toFixed(3).replace(/\.?0+$/, "") || v.toFixed(2),
  american:    (v) => (v > 0 ? `+${v}` : `${v}`),
  fractional:  (v) => v,
  implied:     (v) => (v * 100).toFixed(2).replace(/\.?0+$/, ""),
  hongkong:    (v) => v.toFixed(3).replace(/\.?0+$/, ""),
  indonesian:  (v) => v.toFixed(3).replace(/\.?0+$/, ""),
  malay:       (v) => v.toFixed(3).replace(/\.?0+$/, ""),
};

function readValue(format, raw) {
  if (format === "implied") {
    const pct = Number(raw);
    if (!Number.isFinite(pct)) throw new Error("Implied % must be a number");
    return pct / 100;
  }
  if (format === "american" || format === "indonesian" || format === "malay" ||
      format === "decimal" || format === "hongkong") {
    const n = Number(String(raw).replace(/^\+/, ""));
    if (!Number.isFinite(n)) throw new Error(`${format} must be a number`);
    return n;
  }
  return raw; // fractional stays as a string
}

function recompute(sourceEl) {
  const raw = sourceEl.value.trim();
  if (raw === "") {
    inputs.forEach((el) => { if (el !== sourceEl) el.value = ""; });
    errorEl?.classList.remove("pm-visible");
    return;
  }
  try {
    const value = readValue(sourceEl.dataset.format, raw);
    const all = convertOdds(value, sourceEl.dataset.format);
    for (const el of inputs) {
      if (el === sourceEl) continue;
      const fmt = el.dataset.format;
      el.value = FORMATTERS[fmt](all[fmt]);
    }
    errorEl?.classList.remove("pm-visible");
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.add("pm-visible");
    }
  }
}

for (const el of inputs) {
  el.addEventListener("input", () => {
    inputs.forEach((other) => { if (other !== el) other.classList.remove("pm-dirty"); });
    el.classList.add("pm-dirty");
    recompute(el);
  });
  el.addEventListener("blur", () => el.classList.remove("pm-dirty"));
}
