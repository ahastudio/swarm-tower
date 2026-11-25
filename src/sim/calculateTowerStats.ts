const BLAST = 64;
const BLAST_PER_LEVEL = 10;
const RATE_FACTOR = 0.85;
const RANGE = 420;
const RANGE_PER_LEVEL = 30;
const DAMAGE_BY_LEVEL = [1, 1, 2, 2, 3];

// 타워 레벨이 오르면 폭발이 넓어지고, 더 빨리 쏘고, 더 멀리 닿고, 더 세게 때린다
export default function calculateTowerStats(level: number) {
  return {
    blast: BLAST + BLAST_PER_LEVEL * (level - 1),
    rate: RATE_FACTOR ** (level - 1),
    range: RANGE + RANGE_PER_LEVEL * (level - 1),
    damage: DAMAGE_BY_LEVEL[level - 1],
  };
}
