import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { calculateHeading } from '../mathHelpers';
import { makeEnemy } from '../testing/factories';
import { prepareFreshGame } from '../testing/freshGame';
import house from '../world/house';
import attackWithWorker from './attackWithWorker';

beforeEach(() => {
  prepareFreshGame();
  Object.assign(game.worker, { x: 1000, y: 1000, cooldown: 0, swing: 0 });
});

afterEach(() => {
  house.level = 1;
});

describe('workerAttack 준비', () => {
  it('식는 시간과 휘두르는 시간이 줄어든다', () => {
    Object.assign(game.worker, { cooldown: 1, swing: 0.2 });
    attackWithWorker(0.05);
    expect(game.worker.cooldown).toBeCloseTo(0.95);
    expect(game.worker.swing).toBeCloseTo(0.15);
  });

  it('휘두르는 중이 아니면 0에서 더 줄지 않는다', () => {
    Object.assign(game.worker, { cooldown: 1, swing: 0 });
    attackWithWorker(0.05);
    expect(game.worker.swing).toBe(0);
  });

  it('아직 식지 않았으면 쏘지 않는다', () => {
    game.worker.cooldown = 1;
    game.enemies.push(makeEnemy({ x: 1100, y: 1000 }));
    attackWithWorker(0.05);
    expect(game.shots).toHaveLength(0);
  });

  it('적이 없으면 쏘지 않는다', () => {
    attackWithWorker(0.05);
    expect(game.shots).toHaveLength(0);
    expect(game.worker.cooldown).toBeCloseTo(-0.05);
  });

  it('닿는 거리 320 밖의 적은 쏘지 않는다', () => {
    game.enemies.push(makeEnemy({ x: 1400, y: 1000 }));
    attackWithWorker(0.05);
    expect(game.shots).toHaveLength(0);
  });
});

describe('workerAttack 사격', () => {
  it('가장 가까운 적에게 작은 탄을 쏜다', () => {
    const near = makeEnemy({ x: 1100, y: 1000, velocityX: 50, velocityY: 0 });
    game.enemies.push(makeEnemy({ x: 1200, y: 1000 }), near);
    attackWithWorker(0.05);
    expect(game.shots).toEqual([
      {
        x: 1000,
        y: 1000,
        targetX: 1116,
        targetY: 1000,
        elapsed: 0,
        duration: 0.32,
        radius: 40,
        isBig: false,
        damage: 1,
      },
    ]);
    expect(game.worker.cooldown).toBe(0.35);
    expect(game.worker.swing).toBe(0.3);
    expect(game.worker.heading).toBeCloseTo(calculateHeading(100, 0));
  });

  it('같은 거리면 먼저 나온 적이다', () => {
    game.enemies.push(
      makeEnemy({ x: 1100, y: 1000 }),
      makeEnemy({ x: 900, y: 1000 }),
    );
    attackWithWorker(0.05);
    expect(game.shots[0].targetX).toBe(1100);
  });

  it('본부 레벨이 오르면 더 세고 멀리 닿는다', () => {
    house.level = 3;
    game.enemies.push(makeEnemy({ x: 1340, y: 1000 }));
    attackWithWorker(0.05);
    expect(game.shots[0]).toMatchObject({ radius: 52, damage: 2 });
    expect(game.worker.cooldown).toBeCloseTo(0.35 * 0.92 ** 2);
  });
});
