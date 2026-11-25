import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { calculateHeading } from '../mathHelpers';
import { makeEnemy, makeTower } from '../testing/factories';
import { prepareFreshGame } from '../testing/freshGame';
import { attackWithTowers, createTower, powerUp } from './towers';

beforeEach(prepareFreshGame);

afterEach(() => {
  game.enemies = [];
});

describe('newTower', () => {
  it('대포 레벨 1 타워를 세운다', () => {
    expect(createTower(10, 20)).toEqual({
      x: 10,
      y: 20,
      cooldown: 0.3,
      rate: 1,
      range: 420,
      blast: 64,
      recoil: 0,
      heading: 0,
      born: 0,
      level: 1,
      damage: 1,
      powerUpPaid: 0,
    });
  });
});

describe('powerUp', () => {
  it('레벨이 오르고 낸 동전이 0이 되고 능력이 세진다', () => {
    const tower = makeTower({ level: 1, powerUpPaid: 20 });
    powerUp(tower);
    expect(tower).toMatchObject({
      level: 2,
      powerUpPaid: 0,
      blast: 74,
      damage: 1,
      born: 0.3,
    });
    expect(tower.rate).toBeCloseTo(0.85);
    expect(tower.range).toBe(450);
  });

  it('고리 연출이 생긴다', () => {
    powerUp(makeTower({ x: 7, y: 8 }));
    expect(game.effects).toEqual([
      { x: 7, y: 8, age: 0, radius: 60, isBuildEffect: true },
    ]);
  });
});

describe('towerAttack 준비', () => {
  it('식는 시간이 줄고 반동이 줄어든다', () => {
    const tower = makeTower({ cooldown: 1, recoil: 0.1 });
    game.towers.push(tower);
    attackWithTowers(0.05);
    expect(tower.cooldown).toBeCloseTo(0.95);
    expect(tower.recoil).toBeCloseTo(0.05);
  });

  it('반동이 없으면 그대로 0이다', () => {
    const tower = makeTower({ cooldown: 1, recoil: 0 });
    game.towers.push(tower);
    attackWithTowers(0.05);
    expect(tower.recoil).toBe(0);
  });

  it('아직 식지 않았으면 쏘지 않는다', () => {
    game.towers.push(makeTower({ cooldown: 1 }));
    game.enemies.push(makeEnemy({ x: 520, y: 500 }));
    attackWithTowers(0.05);
    expect(game.shots).toHaveLength(0);
  });

  it('적이 없으면 쏘지 않는다', () => {
    game.towers.push(makeTower({ cooldown: 0 }));
    attackWithTowers(0.05);
    expect(game.shots).toHaveLength(0);
  });

  it('닿는 거리 안에 적이 없으면 쏘지 않고 식는 시간도 그대로다', () => {
    const tower = makeTower({ cooldown: 0, range: 100 });
    game.towers.push(tower);
    game.enemies.push(makeEnemy({ x: 900, y: 500 }));
    attackWithTowers(0.05);
    expect(game.shots).toHaveLength(0);
    expect(tower.cooldown).toBeCloseTo(-0.05);
  });
});

describe('towerAttack 사격', () => {
  it('적을 향해 큰 탄을 쏘고 다시 식는다', () => {
    const tower = makeTower({
      x: 500,
      y: 500,
      cooldown: 0,
      rate: 0.9,
      blast: 70,
      damage: 2,
    });
    game.towers.push(tower);
    game.enemies.push(
      makeEnemy({ x: 600, y: 500, velocityX: 20, velocityY: 0 }),
    );
    attackWithTowers(0.01);
    expect(tower.cooldown).toBe(0.9);
    expect(tower.recoil).toBe(0.15);
    expect(tower.heading).toBeCloseTo(calculateHeading(100, 0));
    expect(game.shots).toEqual([
      {
        x: 500,
        y: 500,
        targetX: 611,
        targetY: 500,
        elapsed: 0,
        duration: 0.55,
        radius: 70,
        isBig: true,
        damage: 2,
      },
    ]);
  });

  it('폭발이 가장 많이 닿는 무리 쪽을 고른다', () => {
    game.towers.push(makeTower({ x: 500, y: 500, cooldown: 0, blast: 40 }));
    const crowd = Array.from({ length: 12 }, (_, index) =>
      makeEnemy({ x: 700 + (index % 3), y: 500 + Math.floor(index / 3) }),
    );
    game.enemies.push(...crowd, makeEnemy({ x: 300, y: 500 }));
    attackWithTowers(0.01);
    expect(game.shots[0].targetX).toBeGreaterThan(690);
  });

  it('타워 여럿이 각자 쏜다', () => {
    game.towers.push(makeTower({ cooldown: 0 }), makeTower({ cooldown: 0 }));
    game.enemies.push(makeEnemy({ x: 520, y: 500 }));
    attackWithTowers(0.01);
    expect(game.shots).toHaveLength(2);
  });
});
