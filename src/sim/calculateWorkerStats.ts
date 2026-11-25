import { WORKER_BLAST, WORKER_RANGE, WORKER_RATE } from '../constants';
import house from '../world/house';

const DAMAGE_BY_LEVEL = [1, 2, 2, 3, 4];
const BLAST_PER_LEVEL = 6;
const RATE_FACTOR = 0.92;
const RANGE_PER_LEVEL = 25;

// 본부 레벨이 오르면 주인공의 공격도 세진다: 피해, 폭발 범위, 쏘는 속도, 닿는 거리
export default function calculateWorkerStats() {
  const levelUps = house.level - 1;
  return {
    damage: DAMAGE_BY_LEVEL[levelUps],
    blast: WORKER_BLAST + BLAST_PER_LEVEL * levelUps,
    rate: WORKER_RATE * RATE_FACTOR ** levelUps,
    range: WORKER_RANGE + RANGE_PER_LEVEL * levelUps,
  };
}
