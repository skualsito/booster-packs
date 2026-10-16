export const ROULETTE_CARD_WIDTH = 164;
export const ROULETTE_GAP = 10;
export const ROULETTE_STRIDE = ROULETTE_CARD_WIDTH + ROULETTE_GAP;
export const HIT_PROBABILITY_THRESHOLD = 10;
export const UPGRADER_LANDING_INSET = 0.2;
export const HIT_CELEBRATION_PIECES = Array.from({ length: 28 }, (_, index) => ({
  color: ["#ffcf4a", "#73e4d7", "#ff7897", "#8dde72"][index % 4],
  delay: `${(index % 7) * 55}ms`,
  left: `${4 + ((index * 37) % 92)}%`,
  rotation: `${(index * 47) % 180}deg`,
}));

export const safeUpgraderLandingPercent = (
  roll: number,
  chance: number,
  won: boolean,
) => {
  const safeChance = Math.min(100, Math.max(0, chance));

  if (won) {
    const normalizedRoll = safeChance > 0 ? Math.min(1, roll / safeChance) : 0.5;
    return (
      safeChance *
      (UPGRADER_LANDING_INSET +
        normalizedRoll * (1 - UPGRADER_LANDING_INSET * 2))
    );
  }

  const lossSize = Math.max(0, 100 - safeChance);
  const normalizedRoll =
    lossSize > 0 ? Math.min(1, Math.max(0, (roll - safeChance) / lossSize)) : 0.5;
  return (
    safeChance +
    lossSize *
      (UPGRADER_LANDING_INSET +
        normalizedRoll * (1 - UPGRADER_LANDING_INSET * 2))
  );
};
