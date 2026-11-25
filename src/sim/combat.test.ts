import { beforeEach, describe, expect, it } from 'vitest';
import game from '../game';
import { makeEnemy, makeShot } from '../testing/factories';
import { prepareFreshGame } from '../testing/freshGame';
import { shoot, updateShots } from './combat';

beforeEach(prepareFreshGame);

describe('shoot', () => {
  it('탄을 하나 더하고 시간은 0에서 시작한다', () => {
    shoot({
      x: 1,
      y: 2,
      targetX: 3,
      targetY: 4,
      radius: 40,
      duration: 0.5,
      isBig: true,
      damage: 2,
    });
    expect(game.shots).toEqual([
      {
        x: 1,
        y: 2,
        targetX: 3,
        targetY: 4,
        radius: 40,
        duration: 0.5,
        isBig: true,
        damage: 2,
        elapsed: 0,
      },
    ]);
  });
});

describe('updateShots', () => {
  it('아직 닿지 않은 탄은 시간만 흐른다', () => {
    game.shots.push(makeShot({ duration: 1 }));
    updateShots(0.4);
    expect(game.shots[0].elapsed).toBeCloseTo(0.4);
    expect(game.effects).toHaveLength(0);
  });

  it('닿으면 폭발 연출을 남기고 탄이 사라진다', () => {
    game.shots.push(
      makeShot({ targetX: 300, targetY: 400, radius: 70, duration: 1 }),
    );
    updateShots(1);
    expect(game.shots).toHaveLength(0);
    expect(game.effects).toEqual([{ x: 300, y: 400, age: 0, radius: 70 }]);
  });

  it('폭발 안의 적만 체력이 깎인다', () => {
    const inside = makeEnemy({ x: 310, y: 400, hp: 3 });
    const outside = makeEnemy({ x: 400, y: 400, hp: 3 });
    game.enemies.push(inside, outside);
    game.shots.push(
      makeShot({
        targetX: 300,
        targetY: 400,
        radius: 70,
        duration: 1,
        damage: 2,
      }),
    );
    updateShots(1);
    expect(inside.hp).toBe(1);
    expect(outside.hp).toBe(3);
  });

  it('체력이 다한 적은 죽어서 사라지고 동전을 떨군다', () => {
    const weak = makeEnemy({ x: 300, y: 400, hp: 1, tier: 1 });
    const strong = makeEnemy({ x: 305, y: 400, hp: 9 });
    game.enemies.push(weak, strong);
    game.shots.push(
      makeShot({
        targetX: 300,
        targetY: 400,
        radius: 70,
        duration: 1,
        damage: 1,
      }),
    );
    updateShots(1);
    expect(game.enemies).toEqual([strong]);
    expect(game.pellets).toHaveLength(3);
  });

  it('폭발이 닿은 적이 여럿 죽어도 모두 지운다', () => {
    game.enemies.push(
      makeEnemy({ x: 300, y: 400, hp: 1 }),
      makeEnemy({ x: 301, y: 400, hp: 1 }),
      makeEnemy({ x: 302, y: 400, hp: 1 }),
    );
    game.shots.push(
      makeShot({ targetX: 300, targetY: 400, radius: 70, duration: 1 }),
    );
    updateShots(1);
    expect(game.enemies).toHaveLength(0);
    expect(game.pellets).toHaveLength(3);
  });

  it('탄이 여럿 동시에 닿아도 모두 처리한다', () => {
    game.shots.push(makeShot({ duration: 1 }), makeShot({ duration: 1 }));
    updateShots(1);
    expect(game.shots).toHaveLength(0);
    expect(game.effects).toHaveLength(2);
  });
});
