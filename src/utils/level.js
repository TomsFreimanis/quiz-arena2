// src/utils/level.js

// KURAI XP vajag katram level
export function getXpNeeded(level) {
  return level * 100;   // Level 1 = 100 XP, level 2 = 200 XP, utt
}

// Nolasa progress
export function getLevelProgress(xp, level) {
  const needed = getXpNeeded(level);
  const current = xp;
  const percent = Math.min(100, (current / needed) * 100);

  return { current, needed, percent };
}
