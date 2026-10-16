import { HIT_PROBABILITY_THRESHOLD } from "./constants";
import type { BoosterPack, PackItem, RouletteCard } from "./types";

export const packProbabilityTotal = (pack: Pick<BoosterPack, "items">) =>
  pack.items.reduce((total, item) => total + Math.max(0, item.probability), 0);

export const normalizedProbability = (
  item: PackItem,
  pack: Pick<BoosterPack, "items">,
) => {
  const total = packProbabilityTotal(pack);
  return total > 0 ? (Math.max(0, item.probability) / total) * 100 : 0;
};

export const packExpectedValue = (pack: Pick<BoosterPack, "items">) => {
  const total = packProbabilityTotal(pack);
  if (!total) {
    return 0;
  }

  return pack.items.reduce((ev, item) => {
    const price = item.card.priceUsd ?? 0;
    return ev + price * (Math.max(0, item.probability) / total);
  }, 0);
};

export const packHitChance = (pack: BoosterPack) =>
  pack.items.reduce((total, item) => {
    const price = item.card.priceUsd ?? 0;
    return price >= pack.price ? total + normalizedProbability(item, pack) : total;
  }, 0);

export const topItem = (pack: BoosterPack) =>
  [...pack.items].sort((a, b) => (b.card.priceUsd ?? 0) - (a.card.priceUsd ?? 0))[0];

export const TARGET_PAYOUT_RATE = 0.7;
export const MIN_PRICE_WEIGHT_EXPONENT = 0.35;
export const MAX_PRICE_WEIGHT_EXPONENT = 8;
export const MINIMUM_ITEM_PROBABILITY = 0.01;
export const CHEAPEST_ITEM_WEIGHTS = [4, 3, 2.2];

export const weightedPick = (items: PackItem[]) => {
  const total = items.reduce(
    (sum, item) => sum + Math.max(0, item.probability),
    0,
  );

  if (total <= 0) {
    return items[0];
  }

  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(0, item.probability);
    if (roll <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
};

// Builds a fresh roulette strip for one spin: weighted filler, an optional
// rare "showcase" hit near the target, and the winner at targetIndex.
// Impure on purpose (time and randomness), so only call it from handlers.
export const buildRouletteStrip = (
  pack: Pick<BoosterPack, "items">,
  winner: PackItem,
  targetIndex: number,
) => {
  const runId = Date.now();
  const strip: RouletteCard[] = Array.from({ length: 42 }, (_, index) => ({
    ...weightedPick(pack.items),
    spinKey: `${runId}-${index}-${crypto.randomUUID()}`,
  }));
  const showcaseHitCandidates = pack.items.filter(
    (item) =>
      item.slotId !== winner.slotId &&
      normalizedProbability(item, pack) < HIT_PROBABILITY_THRESHOLD,
  );
  const showcaseHit = showcaseHitCandidates.length
    ? showcaseHitCandidates[
        Math.floor(Math.random() * showcaseHitCandidates.length)
      ]
    : undefined;

  if (showcaseHit) {
    const showcaseOffsets = [-4, -3, -2, 2, 3, 4];
    const showcaseOffset =
      showcaseOffsets[Math.floor(Math.random() * showcaseOffsets.length)];
    const showcaseIndex = targetIndex + showcaseOffset;
    strip[showcaseIndex] = {
      ...showcaseHit,
      spinKey: `${runId}-showcase-hit-${crypto.randomUUID()}`,
    };
  }

  strip[targetIndex] = {
    ...winner,
    spinKey: `${runId}-winner-${crypto.randomUUID()}`,
  };

  return { runId, strip };
};

export const roundProbabilities = (probabilities: number[]) => {
  if (!probabilities.length) {
    return probabilities;
  }

  const minimum = Math.min(
    MINIMUM_ITEM_PROBABILITY,
    Number((100 / probabilities.length).toFixed(3)),
  );
  const rounded = probabilities.map((probability) =>
    Math.max(minimum, Number(Math.max(0, probability).toFixed(3))),
  );
  let adjustment = Number(
    (100 - rounded.reduce((sum, probability) => sum + probability, 0)).toFixed(
      3,
    ),
  );

  if (adjustment > 0) {
    const targetIndex = rounded.reduce(
      (bestIndex, probability, index) =>
        probability > rounded[bestIndex] ? index : bestIndex,
      0,
    );
    rounded[targetIndex] = Number(
      (rounded[targetIndex] + adjustment).toFixed(3),
    );
    adjustment = 0;
  }

  if (adjustment < 0) {
    const indexesByProbability = rounded
      .map((probability, index) => ({ index, probability }))
      .sort((a, b) => b.probability - a.probability);

    for (const { index } of indexesByProbability) {
      const removable = Number((rounded[index] - minimum).toFixed(3));
      const amount = Math.min(removable, Math.abs(adjustment));

      if (amount > 0) {
        rounded[index] = Number((rounded[index] - amount).toFixed(3));
        adjustment = Number((adjustment + amount).toFixed(3));
      }

      if (adjustment === 0) {
        break;
      }
    }
  }

  return rounded;
};

export const priceWeightedProbabilities = (
  items: PackItem[],
  exponent = 0,
) => {
  const pricedItems = items
    .map((item, index) => ({
      index,
      price: Math.max(item.card.priceUsd ?? 0, 0.05),
    }))
    .sort((a, b) => a.price - b.price);

  const cheapRank = new Map(
    pricedItems
      .slice(0, 3)
      .map((item, index) => [item.index, index]),
  );
  const weights = pricedItems.map((item) => {
    const rank = cheapRank.get(item.index);
    const tierWeight = rank === undefined ? 1 : CHEAPEST_ITEM_WEIGHTS[rank];
    return tierWeight / Math.pow(item.price, exponent);
  });
  const weightTotal = weights.reduce((total, weight) => total + weight, 0);
  const probabilities = Array.from({ length: items.length }, () => 0);

  pricedItems.forEach((item, index) => {
    probabilities[item.index] =
      weightTotal > 0
        ? ((weights[index] ?? 0) / weightTotal) * 100
        : 100 / items.length;
  });

  return probabilities;
};

export const expectedValueFromProbabilities = (
  items: PackItem[],
  probabilities: number[],
) =>
  items.reduce(
    (ev, item, index) =>
      ev + (item.card.priceUsd ?? 0) * ((probabilities[index] ?? 0) / 100),
    0,
  );

export const normalizeItems = (items: PackItem[], packPrice = 0) => {
  if (!items.length) {
    return items;
  }

  const targetEv = Math.max(0, packPrice) * TARGET_PAYOUT_RATE;

  if (!targetEv) {
    const probabilities = roundProbabilities(
      priceWeightedProbabilities(items, MIN_PRICE_WEIGHT_EXPONENT),
    );

    return items.map((item, index) => ({
      ...item,
      probability: probabilities[index] ?? 0,
    }));
  }

  let bestProbabilities = priceWeightedProbabilities(
    items,
    MIN_PRICE_WEIGHT_EXPONENT,
  );

  if (expectedValueFromProbabilities(items, bestProbabilities) > targetEv) {
    let low = MIN_PRICE_WEIGHT_EXPONENT;
    let high = MAX_PRICE_WEIGHT_EXPONENT;
    bestProbabilities = priceWeightedProbabilities(items, high);

    for (let attempt = 0; attempt < 28; attempt += 1) {
      const exponent = (low + high) / 2;
      const probabilities = priceWeightedProbabilities(items, exponent);
      const ev = expectedValueFromProbabilities(items, probabilities);

      if (ev > targetEv) {
        low = exponent;
      } else {
        high = exponent;
        bestProbabilities = probabilities;
      }
    }
  }

  const probabilities = roundProbabilities(bestProbabilities);

  return items.map((item, index) => ({
    ...item,
    probability: probabilities[index] ?? 0,
  }));
};
