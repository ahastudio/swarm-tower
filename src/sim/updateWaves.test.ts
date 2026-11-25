import { beforeEach, describe, expect, it } from 'vitest';
import { BREAK_SECONDS, ENEMY_SPRITES, ISLAND } from '../constants';
import game from '../game';
import { nextRandom, randomState } from '../randomNumbers';
import { prepareFreshGame } from '../testing/freshGame';
import { findShorePoint } from '../world/islandShape';
import updateWaves from './updateWaves';

beforeEach(prepareFreshGame);

describe('updateWaves 쉬는 시간', () => {
  it('쉬는 시간이 남아 있으면 시간만 흐른다', () => {
    game.phaseTime = 5;
    updateWaves(1);
    expect(game.phaseTime).toBe(4);
    expect(game.phase).toBe('break');
    expect(game.wave).toBe(0);
  });

  it('쉬는 시간이 끝나면 웨이브가 시작되고 알림이 뜬다', () => {
    game.phaseTime = 0.05;
    updateWaves(0.1);
    expect(game.wave).toBe(1);
    expect(game.phase).toBe('go');
    expect(game.toSpawn).toBe(52);
    expect(game.bannerText).toBe('웨이브 1');
    expect(game.banner).toBe(2.4);
  });

  it('웨이브가 오를수록 적이 더 나온다', () => {
    game.wave = 2;
    game.phaseTime = 0;
    updateWaves(0.001);
    expect(game.toSpawn).toBe(30 + 22 * 3);
  });
});

describe('updateWaves 몰려옴', () => {
  const startWave = () => {
    game.phase = 'go';
    game.wave = 1;
    game.toSpawn = 40;
    game.spawnAccumulator = 0;
    game.phaseTime = 99;
  };

  it('초당 (7 + 2 x 웨이브)마리씩 나온다', () => {
    startWave();
    updateWaves(1);
    expect(game.enemies).toHaveLength(9);
    expect(game.toSpawn).toBe(31);
  });

  it('1마리가 안 되는 시간은 모아 두었다가 나온다', () => {
    startWave();
    updateWaves(0.05);
    expect(game.enemies).toHaveLength(0);
    expect(game.spawnAccumulator).toBeCloseTo(0.45);
    updateWaves(0.1);
    expect(game.enemies).toHaveLength(1);
  });

  it('다 나오면 쉬는 시간이 되고, 남은 적이 있어도 다음 웨이브가 온다', () => {
    startWave();
    game.toSpawn = 3;
    updateWaves(1);
    expect(game.enemies).toHaveLength(3);
    expect(game.phase).toBe('break');
    expect(game.phaseTime).toBe(BREAK_SECONDS);
  });

  it('난수를 정해진 순서로 써서 첫 적의 값을 정한다', () => {
    startWave();
    randomState.seed = 7;
    updateWaves(0.12);
    randomState.seed = 7;
    const randoms = Array.from({ length: 11 }, () => nextRandom());
    const [shoreX, shoreY] = findShorePoint(randoms[0] * Math.PI * 2);
    const roll = randoms[1];
    const tier = roll < 0.07 ? 2 : roll < 0.27 ? 1 : 0;
    const multipliers = [
      0.8 + randoms[2] * 0.6,
      2 + randoms[3],
      5 + randoms[4] * 2,
    ];
    const hp = Math.max(1, Math.round(1 * multipliers[tier]));
    const speed = [1, 0.88, 0.75][tier];
    const [enemy] = game.enemies;
    expect(enemy).toEqual({
      hp,
      maxHp: hp,
      tier,
      scale: [1, 1.35, 1.8][tier],
      speed: (55 + 2 + randoms[5] * 16) * speed,
      x:
        ISLAND.centerX +
        (shoreX - ISLAND.centerX) * 0.95 +
        (randoms[6] - 0.5) * 40,
      y:
        ISLAND.centerY +
        (shoreY - ISLAND.centerY) * 0.95 +
        (randoms[7] - 0.5) * 40,
      velocityX: 0,
      velocityY: 0,
      heading: 0,
      jitter: (randoms[8] - 0.5) * 0.6,
      spriteIndex: Math.floor(randoms[9] * ENEMY_SPRITES.length),
      phase: randoms[10] * 6.28,
    });
  });

  it('적은 약한 쪽이 대부분이고 센 적과 아주 센 적이 섞인다', () => {
    startWave();
    game.toSpawn = 3000;
    game.spawnAccumulator = 3000;
    updateWaves(0);
    const count = (tier: number) =>
      game.enemies.filter((enemy) => enemy.tier === tier).length;
    expect(count(0) + count(1) + count(2)).toBe(3000);
    expect(count(2)).toBeGreaterThan(100);
    expect(count(1)).toBeGreaterThan(count(2));
    expect(count(0)).toBeGreaterThan(count(1));
  });

  it('체력은 웨이브가 오를수록 늘고 센 적일수록 높다', () => {
    startWave();
    game.wave = 10;
    game.toSpawn = 500;
    game.spawnAccumulator = 500;
    updateWaves(0);
    const collectHpByTier = (tier: number) =>
      game.enemies
        .filter((enemy) => enemy.tier === tier)
        .map((enemy) => enemy.maxHp);
    expect(Math.min(...collectHpByTier(0))).toBeGreaterThanOrEqual(4);
    expect(Math.min(...collectHpByTier(2))).toBeGreaterThan(
      Math.max(...collectHpByTier(0)),
    );
  });

  it('지도 가장자리 안쪽에서 나온다', () => {
    startWave();
    game.toSpawn = 500;
    game.spawnAccumulator = 500;
    updateWaves(0);
    for (const enemy of game.enemies) {
      expect(enemy.x).toBeGreaterThanOrEqual(20);
      expect(enemy.x).toBeLessThanOrEqual(4480);
      expect(enemy.y).toBeGreaterThanOrEqual(20);
      expect(enemy.y).toBeLessThanOrEqual(2780);
    }
  });
});
