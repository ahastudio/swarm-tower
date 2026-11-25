import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_PELLETS } from '../constants';
import game from '../game';
import { nextRandom, randomState } from '../randomNumbers';
import { makeEnemy, makePellet } from '../testing/factories';
import { prepareFreshGame } from '../testing/freshGame';
import { dropCoins, updatePellets } from './coins';

beforeEach(prepareFreshGame);

describe('dropCoins', () => {
  it('센 적일수록 동전을 더 떨군다', () => {
    dropCoins(makeEnemy({ tier: 0 }));
    expect(game.pellets).toHaveLength(1);
    dropCoins(makeEnemy({ tier: 1 }));
    expect(game.pellets).toHaveLength(4);
    dropCoins(makeEnemy({ tier: 2 }));
    expect(game.pellets).toHaveLength(12);
  });

  it('난수를 정해진 순서로 써서 동전 값을 정한다', () => {
    randomState.seed = 7;
    dropCoins(makeEnemy({ x: 50, y: 60 }));
    randomState.seed = 7;
    const [firstRandom, secondRandom, thirdRandom, fourthRandom] = [
      nextRandom(),
      nextRandom(),
      nextRandom(),
      nextRandom(),
    ];
    expect(game.pellets[0]).toEqual({
      x: 50,
      y: 60,
      velocityX: (firstRandom - 0.5) * 90,
      velocityY: (secondRandom - 0.5) * 90,
      z: 6,
      velocityZ: 170 + thirdRandom * 80,
      phase: fourthRandom * 6.28,
      age: 0,
    });
  });

  it('동전이 너무 많으면 더 만들지 않고 난수도 쓰지 않는다', () => {
    game.pellets = Array.from({ length: MAX_PELLETS }, () => makePellet());
    randomState.seed = 7;
    dropCoins(makeEnemy({ tier: 2 }));
    expect(game.pellets).toHaveLength(MAX_PELLETS);
    expect(randomState.seed).toBe(7);
  });
});

describe('updatePellets', () => {
  it('날아가며 느려지고 시간이 흐른다', () => {
    game.worker.x = 5000;
    game.pellets.push(
      makePellet({
        x: 100,
        y: 100,
        velocityX: 50,
        velocityY: -50,
        z: 10,
        velocityZ: 0,
      }),
    );
    updatePellets(0.1);
    const [pellet] = game.pellets;
    expect(pellet.age).toBeCloseTo(1.1);
    expect(pellet.x).toBeCloseTo(105);
    expect(pellet.y).toBeCloseTo(95);
    expect(pellet.velocityX).toBeCloseTo(50 * 0.92);
    expect(pellet.velocityY).toBeCloseTo(-50 * 0.92);
  });

  it('중력으로 떨어지고 바닥에 닿으면 세게 부딪힐 때만 튄다', () => {
    game.worker.x = 5000;
    const fast = makePellet({ z: 1, velocityZ: -200 });
    game.pellets.push(fast);
    updatePellets(0.1);
    expect(fast.z).toBe(0);
    expect(fast.velocityZ).toBeCloseTo(264 * 0.45);
    const slow = makePellet({ z: 0.1, velocityZ: -10 });
    game.pellets = [slow];
    updatePellets(0.01);
    expect(slow.z).toBe(0);
    expect(slow.velocityZ).toBe(0);
  });

  it('공중에서는 바닥에 닿지 않아 그대로 오른다', () => {
    game.worker.x = 5000;
    const pellet = makePellet({ z: 50, velocityZ: 100 });
    game.pellets.push(pellet);
    updatePellets(0.1);
    expect(pellet.z).toBeGreaterThan(50);
  });

  it('주인공이 150 안에 있으면 빨려 든다', () => {
    game.worker.x = 800;
    game.worker.y = 800;
    const near = makePellet({ x: 700, y: 800 });
    const far = makePellet({ x: 400, y: 800 });
    game.pellets.push(near, far);
    updatePellets(0.05);
    expect(near.x).toBeGreaterThan(700);
    expect(far.x).toBe(400);
  });

  it('30 안에 들어오면 주인공이 동전을 얻는다', () => {
    game.worker.x = 800;
    game.worker.y = 800;
    game.pellets.push(
      makePellet({ x: 790, y: 800 }),
      makePellet({ x: 100, y: 100 }),
    );
    updatePellets(0.05);
    expect(game.coins).toBe(1);
    expect(game.pulse).toBe(1);
    expect(game.pellets).toHaveLength(1);
  });

  it('거리는 움직이기 전 위치로 잰다', () => {
    game.worker.x = 800;
    game.worker.y = 800;
    game.pellets.push(makePellet({ x: 775, y: 800, velocityX: -400 }));
    updatePellets(0.1);
    expect(game.coins).toBe(1);
  });
});
