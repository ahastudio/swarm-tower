import { WORKER_FLIGHT } from '../constants';
import game from '../game';
import { calculateHeading } from '../mathHelpers';
import type { Enemy, Point, Seconds } from '../types';
import calculateLeadPoint from './calculateLeadPoint';
import calculateWorkerStats from './calculateWorkerStats';
import { type ShotRequest, shoot } from './combat';

const SWING_SECONDS = 0.3;

interface Nearest {
  enemy: Enemy | null;
  distance: number;
}

function pickCloser(best: Nearest, enemy: Enemy): Nearest {
  const distance = Math.hypot(enemy.x - game.worker.x, enemy.y - game.worker.y);
  return distance < best.distance ? { enemy, distance } : best;
}

const findNearestEnemy = (range: number) =>
  game.enemies.reduce(pickCloser, { enemy: null, distance: range }).enemy;

function startSwing(target: Enemy, rate: number) {
  game.worker.cooldown = rate;
  game.worker.swing = SWING_SECONDS;
  game.worker.heading = calculateHeading(
    target.x - game.worker.x,
    target.y - game.worker.y,
  );
}

function createWorkerShot(
  aim: Point,
  stats: ReturnType<typeof calculateWorkerStats>,
): ShotRequest {
  const { x, y } = game.worker;
  const flight = { duration: WORKER_FLIGHT, isBig: false };
  return {
    x,
    y,
    targetX: aim.x,
    targetY: aim.y,
    radius: stats.blast,
    damage: stats.damage,
    ...flight,
  };
}

function throwAt(target: Enemy) {
  const stats = calculateWorkerStats();
  startSwing(target, stats.rate);
  shoot(createWorkerShot(calculateLeadPoint(target, WORKER_FLIGHT), stats));
}

function fireAtNearest() {
  const target = findNearestEnemy(calculateWorkerStats().range);
  if (target) {
    throwAt(target);
  }
}

export default function attackWithWorker(deltaSeconds: Seconds) {
  game.worker.cooldown -= deltaSeconds;
  if (game.worker.swing > 0) {
    game.worker.swing -= deltaSeconds;
  }
  if (game.worker.cooldown <= 0) {
    fireAtNearest();
  }
}
