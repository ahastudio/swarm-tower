import game from '../game';
import { calculateHeading } from '../mathHelpers';
import { nextRandom } from '../randomNumbers';
import type { Enemy, Point, Seconds, Tower } from '../types';
import buildRing from './buildRing';
import calculateLeadPoint from './calculateLeadPoint';
import calculateTowerStats from './calculateTowerStats';
import { type ShotRequest, shoot } from './combat';

const SAMPLE_COUNT = 14;
const COUNT_STRIDE = 3;
const TOWER_FLIGHT = 0.55;
const TOWER_RECOIL = 0.15;
const START_COOLDOWN = 0.3;
const POWER_UP_BORN = 0.3;
const POWER_UP_RING = 60;

export function createTower(x: number, y: number): Tower {
  return {
    x,
    y,
    cooldown: START_COOLDOWN,
    recoil: 0,
    heading: 0,
    born: 0,
    level: 1,
    powerUpPaid: 0,
    ...calculateTowerStats(1),
  };
}

export function powerUp(tower: Tower) {
  tower.level++;
  tower.powerUpPaid = 0;
  Object.assign(tower, calculateTowerStats(tower.level));
  tower.born = POWER_UP_BORN;
  game.effects.push(buildRing(tower, POWER_UP_RING));
}

const countWithin = (pool: Enemy[], center: Enemy, blast: number) =>
  pool.filter(
    (enemy) => Math.hypot(enemy.x - center.x, enemy.y - center.y) < blast,
  ).length;

// 같은 수면 먼저 뽑힌 적이 이긴다. 세 마리에 한 마리만 세어 본다
function bestByCoverage(candidates: Enemy[], blast: number) {
  const pool = game.enemies.filter(
    (_, otherIndex) => otherIndex % COUNT_STRIDE === 0,
  );
  const counts = candidates.map((candidate) =>
    countWithin(pool, candidate, blast),
  );
  return candidates[counts.indexOf(Math.max(...counts))] ?? null;
}

const pickRandomEnemy = () =>
  game.enemies[(nextRandom() * game.enemies.length) | 0];

// 적을 무작위로 열네 번 뽑아 닿는 거리 안에서 폭발이 가장 많이 닿는 적을 고른다
function pickTarget(tower: Tower) {
  const sampled = Array.from({ length: SAMPLE_COUNT }, pickRandomEnemy);
  const inRange = sampled.filter(
    (enemy) => Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= tower.range,
  );
  return bestByCoverage(inRange, tower.blast);
}

function createTowerShot(tower: Tower, aim: Point): ShotRequest {
  const { x, y, blast, damage } = tower;
  const flight = { duration: TOWER_FLIGHT, isBig: true };
  return {
    x,
    y,
    targetX: aim.x,
    targetY: aim.y,
    radius: blast,
    damage,
    ...flight,
  };
}

function fireAt(tower: Tower, target: Enemy) {
  tower.cooldown = tower.rate;
  tower.recoil = TOWER_RECOIL;
  tower.heading = calculateHeading(target.x - tower.x, target.y - tower.y);
  const aim = calculateLeadPoint(target, TOWER_FLIGHT);
  shoot(createTowerShot(tower, aim));
}

function coolDown(tower: Tower, deltaSeconds: Seconds) {
  tower.cooldown -= deltaSeconds;
  if (tower.recoil > 0) {
    tower.recoil -= deltaSeconds;
  }
}

const isReady = (tower: Tower) =>
  tower.cooldown <= 0 && game.enemies.length > 0;

function attack(tower: Tower) {
  const target = pickTarget(tower);
  if (target) {
    fireAt(tower, target);
  }
}

export function attackWithTowers(deltaSeconds: Seconds) {
  for (const tower of game.towers) {
    coolDown(tower, deltaSeconds);
    if (isReady(tower)) {
      attack(tower);
    }
  }
}
