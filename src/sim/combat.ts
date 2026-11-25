import game from '../game';
import { swapRemove } from '../mathHelpers';
import type { Enemy, Seconds, Shot } from '../types';
import { dropCoins } from './coins';

export type ShotRequest = Omit<Shot, 'elapsed'>;

function kill(index: number) {
  dropCoins(game.enemies[index]);
  swapRemove(game.enemies, index);
}

export const shoot = (spec: ShotRequest) =>
  game.shots.push({ ...spec, elapsed: 0 });

const isInBlast = (enemy: Enemy, shot: Shot) =>
  Math.hypot(enemy.x - shot.targetX, enemy.y - shot.targetY) < shot.radius;

// 웨이브가 오를수록 적의 체력이 늘어 한 번에 안 죽는다
function damageEnemy(shot: Shot, index: number) {
  const enemy = game.enemies[index];
  enemy.hp -= shot.damage;
  if (enemy.hp <= 0) {
    kill(index);
  }
}

function hitEnemy(shot: Shot, index: number) {
  if (isInBlast(game.enemies[index], shot)) {
    damageEnemy(shot, index);
  }
}

function land(shot: Shot, index: number) {
  game.effects.push({
    x: shot.targetX,
    y: shot.targetY,
    age: 0,
    radius: shot.radius,
  });
  for (
    let enemyIndex = game.enemies.length - 1;
    enemyIndex >= 0;
    enemyIndex--
  ) {
    hitEnemy(shot, enemyIndex);
  }
  swapRemove(game.shots, index);
}

export function updateShots(deltaSeconds: Seconds) {
  for (let index = game.shots.length - 1; index >= 0; index--) {
    const shot = game.shots[index];
    shot.elapsed += deltaSeconds;
    if (shot.elapsed >= shot.duration) {
      land(shot, index);
    }
  }
}
