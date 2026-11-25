import { HOUSE_HIT_RANGE } from '../constants';
import game from '../game';
import { calculateHeading, swapRemove } from '../mathHelpers';
import type { Enemy, Point, Seconds } from '../types';
import { blocked, flowX, flowY, getCellIndex } from '../world/flow';
import house from '../world/house';

const reachesHouse = (enemy: Enemy) =>
  Math.hypot(enemy.x - house.x, enemy.y - house.y) < HOUSE_HIT_RANGE;

const isBlockedAt = (x: number, y: number) => blocked[getCellIndex(x, y)] === 1;

// 흐름 방향을 조금씩 틀어 흩어져 몰려오게 한다
function scatterDirection(direction: Point, jitter: number): Point {
  const scatterX = direction.x - direction.y * jitter;
  const scatterY = direction.y + direction.x * jitter;
  const length = Math.hypot(scatterX, scatterY) || 1;
  return { x: scatterX / length, y: scatterY / length };
}

function steer(enemy: Enemy) {
  const cell = getCellIndex(enemy.x, enemy.y);
  const flow = { x: flowX[cell], y: flowY[cell] };
  const direction = scatterDirection(flow, enemy.jitter);
  enemy.velocityX = direction.x * enemy.speed;
  enemy.velocityY = direction.y * enemy.speed;
}

function slideAround(enemy: Enemy, deltaSeconds: Seconds): Point {
  const x = enemy.x + enemy.velocityX * deltaSeconds;
  const y = enemy.y + enemy.velocityY * deltaSeconds;
  const candidates = [
    { x, y },
    { x, y: enemy.y },
    { x: enemy.x, y },
  ];
  const open = candidates.find(
    (candidate) => !isBlockedAt(candidate.x, candidate.y),
  );
  return open ?? { x: enemy.x, y: enemy.y };
}

function walk(enemy: Enemy, deltaSeconds: Seconds) {
  steer(enemy);
  const next = slideAround(enemy, deltaSeconds);
  enemy.x = next.x;
  enemy.y = next.y;
  enemy.heading = calculateHeading(enemy.velocityX, enemy.velocityY);
}

function damageHouse(index: number) {
  game.hp -= 1;
  swapRemove(game.enemies, index);
}

function stepEnemy(index: number, deltaSeconds: Seconds) {
  const enemy = game.enemies[index];
  if (reachesHouse(enemy)) {
    damageHouse(index);
    return;
  }
  walk(enemy, deltaSeconds);
}

export default function moveEnemies(deltaSeconds: Seconds) {
  for (let index = game.enemies.length - 1; index >= 0; index--) {
    stepEnemy(index, deltaSeconds);
  }
}
