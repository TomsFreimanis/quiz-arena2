// src/utils/levelRewards.js

export const LEVEL_REWARDS = {
  2: { coins: 20 },
  3: { coins: 30 },
  5: { avatar: "rare1" },
  10: { coins: 100 },
  15: { avatar: "epic1" },
  20: { avatar: "legendary1" },
};

// Helper – return reward object or null
export function getLevelReward(lv) {
  return LEVEL_REWARDS[lv] || null;
}
