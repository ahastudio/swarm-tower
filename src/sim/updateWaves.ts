import {
  BREAK_SECONDS,
  ENEMY_SPRITES,
  ISLAND,
  MAP_HEIGHT,
  MAP_WIDTH,
} from '../constants';
import { ENEMY_TIER, type EnemyTier } from '../enemyTiers';
import game from '../game';
import { clamp } from '../mathHelpers';
import { nextRandom } from '../randomNumbers';
import type { Enemy, Point, Seconds } from '../types';
import { findShorePoint } from '../world/islandShape';
import showBanner from './showBanner';

const FIRST_WAVE_ENEMIES = 30;
const ENEMIES_PER_WAVE = 22;
const SPAWNS_PER_SECOND = 7;
const SPAWNS_PER_WAVE_SECOND = 2;
const EDGE = 20;
// 바닷가에서 섬 안쪽으로 이만큼 들어온 곳에서 나온다
const SPAWN_INSET = 0.95;
const SPAWN_SPREAD = 40;
const ELITE_ROLL = 0.07;
const STRONG_ROLL = 0.27;
// 티어(0 약함, 1 셈, 2 아주 셈)별 크기 배율과 속도 배율
const TIER_SCALE = [1, 1.35, 1.8] as const;
const TIER_SPEED = [1, 0.88, 0.75] as const;
const HP_PER_WAVE = 0.4;
// 티어별 체력 배율은 기본값에 난수 폭을 더해 정한다
const WEAK_HP_BASE = 0.8;
const WEAK_HP_SPREAD = 0.6;
const STRONG_HP_BASE = 2;
const ELITE_HP_BASE = 5;
const ELITE_HP_SPREAD = 2;
const BASE_SPEED = 55;
const SPEED_PER_WAVE = 2;
const SPEED_SPREAD = 16;
const SCATTER = 0.6;
const BOB_PHASE = 6.28;

const isBreakOver = () => game.phase === 'break' && game.phaseTime <= 0;

function startWave() {
  game.wave++;
  game.phase = 'go';
  game.toSpawn = FIRST_WAVE_ENEMIES + ENEMIES_PER_WAVE * game.wave;
  game.spawnAccumulator = 0;
  showBanner(`웨이브 ${game.wave}`);
}

function pickSpawnPoint(): Point {
  const [shoreX, shoreY] = findShorePoint(nextRandom() * Math.PI * 2);
  return {
    x: ISLAND.centerX + (shoreX - ISLAND.centerX) * SPAWN_INSET,
    y: ISLAND.centerY + (shoreY - ISLAND.centerY) * SPAWN_INSET,
  };
}

// 대부분은 약하고, 일부는 세고, 아주 드물게 아주 센 적이 나온다
function rollTier(): EnemyTier {
  const roll = nextRandom();
  if (roll < ELITE_ROLL) {
    return ENEMY_TIER.elite;
  }
  return roll < STRONG_ROLL ? ENEMY_TIER.strong : ENEMY_TIER.weak;
}

// 난수는 티어와 상관없이 세 번 부른다. 호출 순서를 고정해야 웨이브가 매번 같다
function rollHp(tier: EnemyTier) {
  const base = 1 + Math.floor(game.wave * HP_PER_WAVE);
  const multipliers = [
    WEAK_HP_BASE + nextRandom() * WEAK_HP_SPREAD,
    STRONG_HP_BASE + nextRandom(),
    ELITE_HP_BASE + nextRandom() * ELITE_HP_SPREAD,
  ];
  return Math.max(1, Math.round(base * multipliers[tier]));
}

interface EnemySeed {
  start: Point;
  tier: EnemyTier;
  hp: number;
}

// 필드 순서가 난수를 부르는 순서다
function buildEnemy({ start, tier, hp }: EnemySeed): Enemy {
  return {
    hp,
    maxHp: hp,
    tier,
    scale: TIER_SCALE[tier],
    speed:
      (BASE_SPEED + game.wave * SPEED_PER_WAVE + nextRandom() * SPEED_SPREAD) *
      TIER_SPEED[tier],
    x: clamp(
      start.x + (nextRandom() - 0.5) * SPAWN_SPREAD,
      EDGE,
      MAP_WIDTH - EDGE,
    ),
    y: clamp(
      start.y + (nextRandom() - 0.5) * SPAWN_SPREAD,
      EDGE,
      MAP_HEIGHT - EDGE,
    ),
    velocityX: 0,
    velocityY: 0,
    heading: 0,
    jitter: (nextRandom() - 0.5) * SCATTER,
    spriteIndex: (nextRandom() * ENEMY_SPRITES.length) | 0,
    phase: nextRandom() * BOB_PHASE,
  };
}

function spawnEnemy() {
  const start = pickSpawnPoint();
  const tier = rollTier();
  const hp = rollHp(tier);
  game.enemies.push(buildEnemy({ start, tier, hp }));
}

function spawnNext() {
  game.spawnAccumulator -= 1;
  game.toSpawn--;
  spawnEnemy();
}

const canSpawn = () => game.spawnAccumulator >= 1 && game.toSpawn > 0;

// 적이 남아 있어도 다 나오면 쉬는 시간을 거쳐 다음 웨이브가 온다
function startBreak() {
  game.phase = 'break';
  game.phaseTime = BREAK_SECONDS;
}

function spawnWave(deltaSeconds: Seconds) {
  game.spawnAccumulator +=
    deltaSeconds * (SPAWNS_PER_SECOND + SPAWNS_PER_WAVE_SECOND * game.wave);
  while (canSpawn()) {
    spawnNext();
  }
  if (game.toSpawn === 0) {
    startBreak();
  }
}

export default function updateWaves(deltaSeconds: Seconds) {
  game.phaseTime -= deltaSeconds;
  if (isBreakOver()) {
    startWave();
  }
  if (game.phase === 'go') {
    spawnWave(deltaSeconds);
  }
}
