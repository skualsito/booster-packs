import { randomInt } from "node:crypto";

export const UPGRADER_RTP = 0.9;
export const UPGRADER_MAX_CHANCE = 80;

// Probabilities are stored as DECIMAL(10,3), so thousandths keep them exact.
const PROBABILITY_SCALE = 1000;

export function upgraderChance(stakeValue, targetValue) {
  if (stakeValue <= 0 || targetValue <= stakeValue) {
    return 0;
  }

  return Math.min(
    UPGRADER_MAX_CHANCE,
    Number(((stakeValue / targetValue) * 100 * UPGRADER_RTP).toFixed(6)),
  );
}

// Returns a percentage in [0, 100) with six decimals of precision.
export function rollPercent(rng = randomInt) {
  return rng(0, 100_000_000) / 1_000_000;
}

export function weightedPick(items, rng = randomInt) {
  const weights = items.map((item) =>
    Math.max(0, Math.round(Number(item.probability ?? 0) * PROBABILITY_SCALE)),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) {
    return items[0];
  }

  let roll = rng(0, total);

  for (let index = 0; index < items.length; index += 1) {
    if (roll < weights[index]) {
      return items[index];
    }

    roll -= weights[index];
  }

  return items[items.length - 1];
}
