import { MAX_PELLETS } from '../constants';
import game from '../game';
import { swapRemove } from '../mathHelpers';
import { nextRandom } from '../randomNumbers';
import type { Enemy, Pellet, Seconds } from '../types';

// 센 적일수록 동전을 더 떨군다
const COINS_PER_TIER = [1, 3, 8] as const;
const PULL_RANGE = 150;
const PICKUP_RANGE = 30;
const PULL_SPEED = 7;
const DRAG = 0.92;
const GRAVITY = 640;
const BOUNCE_LOSS = 0.45;
const MIN_BOUNCE_SPEED = 60;
const SCATTER_SPEED = 90;
const POP_SPEED = 170;
const POP_SPREAD = 80;
const SPIN_PHASE = 6.28;
const START_HEIGHT = 6;

const createPellet = (enemy: Enemy): Pellet => ({
  x: enemy.x,
  y: enemy.y,
  velocityX: (nextRandom() - 0.5) * SCATTER_SPEED,
  velocityY: (nextRandom() - 0.5) * SCATTER_SPEED,
  z: START_HEIGHT,
  velocityZ: POP_SPEED + nextRandom() * POP_SPREAD,
  phase: nextRandom() * SPIN_PHASE,
  age: 0,
});

function dropCoin(enemy: Enemy) {
  if (game.pellets.length < MAX_PELLETS) {
    game.pellets.push(createPellet(enemy));
  }
}

export function dropCoins(enemy: Enemy) {
  for (let index = 0; index < COINS_PER_TIER[enemy.tier]; index++) {
    dropCoin(enemy);
  }
}

function driftPellet(pellet: Pellet, deltaSeconds: Seconds) {
  pellet.age += deltaSeconds;
  pellet.x += pellet.velocityX * deltaSeconds;
  pellet.y += pellet.velocityY * deltaSeconds;
  pellet.velocityX *= DRAG;
  pellet.velocityY *= DRAG;
}

function bounceOnFloor(pellet: Pellet) {
  pellet.z = 0;
  const fast = Math.abs(pellet.velocityZ) > MIN_BOUNCE_SPEED;
  pellet.velocityZ = fast ? -pellet.velocityZ * BOUNCE_LOSS : 0;
}

function fallPellet(pellet: Pellet, deltaSeconds: Seconds) {
  pellet.velocityZ -= GRAVITY * deltaSeconds;
  pellet.z += pellet.velocityZ * deltaSeconds;
  if (pellet.z < 0) {
    bounceOnFloor(pellet);
  }
}

function pullPellet(pellet: Pellet, deltaSeconds: Seconds) {
  const pullFraction = Math.min(1, PULL_SPEED * deltaSeconds);
  pellet.x += (game.worker.x - pellet.x) * pullFraction;
  pellet.y += (game.worker.y - pellet.y) * pullFraction;
}

function advancePellet(pellet: Pellet, deltaSeconds: Seconds) {
  driftPellet(pellet, deltaSeconds);
  fallPellet(pellet, deltaSeconds);
}

// 한 번 움직이고, 움직이기 전 주인공과의 거리를 돌려준다
function stepPellet(pellet: Pellet, deltaSeconds: Seconds) {
  const distance = Math.hypot(
    game.worker.x - pellet.x,
    game.worker.y - pellet.y,
  );
  advancePellet(pellet, deltaSeconds);
  if (distance < PULL_RANGE) {
    pullPellet(pellet, deltaSeconds);
  }
  return distance;
}

function collectPellet(index: number) {
  game.coins++;
  game.pulse = 1;
  swapRemove(game.pellets, index);
}

export function updatePellets(deltaSeconds: Seconds) {
  for (let index = game.pellets.length - 1; index >= 0; index--) {
    if (stepPellet(game.pellets[index], deltaSeconds) < PICKUP_RANGE) {
      collectPellet(index);
    }
  }
}
