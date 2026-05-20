import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decimalToAmerican,
  americanToDecimal,
  decimalToFractional,
  fractionalToDecimal,
  decimalToImplied,
  impliedToDecimal,
  decimalToHongKong,
  hongKongToDecimal,
  decimalToIndonesian,
  indonesianToDecimal,
  decimalToMalay,
  malayToDecimal,
  convertOdds,
  payout,
  profit,
} from "../odds-math.js";

const approx = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test("decimal ↔ american — favourite", () => {
  assert.equal(decimalToAmerican(1.5), -200);
  assert.ok(approx(americanToDecimal(-200), 1.5));
});

test("decimal ↔ american — underdog", () => {
  assert.equal(decimalToAmerican(2.5), 150);
  assert.ok(approx(americanToDecimal(150), 2.5));
});

test("decimal ↔ american — even money", () => {
  assert.equal(decimalToAmerican(2.0), 100);
  assert.ok(approx(americanToDecimal(100), 2.0));
});

test("fractional ↔ decimal", () => {
  assert.ok(approx(fractionalToDecimal("3/2"), 2.5));
  assert.ok(approx(fractionalToDecimal("1/1"), 2.0));
  assert.ok(approx(fractionalToDecimal("5/4"), 2.25));
  assert.equal(decimalToFractional(2.5), "3/2");
  assert.equal(decimalToFractional(2.0), "1/1");
});

test("implied probability", () => {
  assert.ok(approx(decimalToImplied(2.0), 0.5));
  assert.ok(approx(decimalToImplied(4.0), 0.25));
  assert.ok(approx(impliedToDecimal(0.5), 2.0));
});

test("hong kong", () => {
  assert.ok(approx(decimalToHongKong(2.5), 1.5));
  assert.ok(approx(hongKongToDecimal(1.5), 2.5));
});

test("indonesian", () => {
  assert.ok(approx(decimalToIndonesian(2.5), 1.5));
  assert.ok(approx(decimalToIndonesian(1.5), -2.0));
  assert.ok(approx(indonesianToDecimal(1.5), 2.5));
  assert.ok(approx(indonesianToDecimal(-2.0), 1.5));
});

test("malay", () => {
  assert.ok(approx(decimalToMalay(1.5), 0.5));     // underdog
  assert.ok(approx(decimalToMalay(2.5), -1 / 1.5)); // favourite (net > 1)
  assert.ok(approx(malayToDecimal(0.5), 1.5));
});

test("convertOdds: decimal → all", () => {
  const r = convertOdds(2.5, "decimal");
  assert.ok(approx(r.decimal, 2.5));
  assert.equal(r.american, 150);
  assert.equal(r.fractional, "3/2");
  assert.ok(approx(r.implied, 0.4));
  assert.ok(approx(r.hongkong, 1.5));
});

test("convertOdds: american → all", () => {
  const r = convertOdds(-200, "american");
  assert.ok(approx(r.decimal, 1.5));
  assert.equal(r.fractional, "1/2");
  assert.ok(approx(r.implied, 1 / 1.5));
});

test("convertOdds rejects unknown format", () => {
  assert.throws(() => convertOdds(2.5, "wat"));
});

test("payout / profit", () => {
  assert.ok(approx(payout(100, 2.5), 250));
  assert.ok(approx(profit(100, 2.5), 150));
});

test("invalid inputs throw", () => {
  assert.throws(() => decimalToAmerican(1.0));
  assert.throws(() => americanToDecimal(0));
  assert.throws(() => fractionalToDecimal("3/0"));
  assert.throws(() => impliedToDecimal(0));
  assert.throws(() => impliedToDecimal(1));
});
