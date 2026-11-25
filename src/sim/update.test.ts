import { beforeEach, describe, expect, it, vi } from 'vitest';
import camera from '../camera/camera';
import game from '../game';
import { makeEffect, makeFly, makeSpot, makeTower } from '../testing/factories';
import { prepareFreshGame } from '../testing/freshGame';

const calls = vi.hoisted(() => [] as string[]);
const createPhaseMock = (name: string) => ({ default: () => calls.push(name) });
vi.mock('./moveWorker', () => createPhaseMock('moveWorker'));
vi.mock('./attackWithWorker', () => createPhaseMock('workerAttack'));
vi.mock('./buildSpots', () => createPhaseMock('buildSpots'));
vi.mock('./updateWaves', () => createPhaseMock('updateWaves'));
vi.mock('./moveEnemies', () => createPhaseMock('moveEnemies'));
vi.mock('./towers', () => ({
  attackWithTowers: () => calls.push('towerAttack'),
}));
vi.mock('./combat', () => ({ updateShots: () => calls.push('updateShots') }));
vi.mock('./coins', () => ({
  updatePellets: () => calls.push('updatePellets'),
}));
vi.mock('../ui/showGameOver', () => createPhaseMock('gameOver'));

const { default: update } = await import('./update');

beforeEach(() => {
  prepareFreshGame();
  game.hp = 100;
  calls.length = 0;
});

describe('update 순서', () => {
  it('이동, 웨이브, 적 이동, 공격, 탄, 동전, 판 짓기 순서로 부른다', () => {
    update(0.05);
    expect(calls).toEqual([
      'moveWorker',
      'updateWaves',
      'moveEnemies',
      'workerAttack',
      'towerAttack',
      'updateShots',
      'updatePellets',
      'buildSpots',
    ]);
  });

  it('시간이 흐르고 카메라 회전의 cos, sin이 맞춰진다', () => {
    camera.rotation = Math.PI;
    update(0.05);
    expect(game.time).toBeCloseTo(0.05);
    expect(camera.rotationCos).toBeCloseTo(-1);
    expect(camera.rotationSin).toBeCloseTo(0);
  });

  it('게임이 끝났으면 아무것도 하지 않는다', () => {
    game.over = true;
    update(0.05);
    expect(calls).toEqual([]);
    expect(game.time).toBe(0);
  });

  it('본부가 부서지면 게임 오버 화면을 띄우고 거기서 멈춘다', () => {
    game.hp = 0;
    update(0.05);
    expect(calls).toEqual([
      'moveWorker',
      'updateWaves',
      'moveEnemies',
      'gameOver',
    ]);
  });
});

describe('update 시간 값', () => {
  it('판은 나타난 시간이 늘고 반짝임이 줄어든다', () => {
    const spot = makeSpot({ born: 0.1, pulse: 1 });
    const settled = makeSpot({ pulse: 0 });
    game.spots.push(spot, settled);
    update(0.1);
    expect(spot.born).toBeCloseTo(0.2);
    expect(spot.pulse).toBeCloseTo(0.6);
    expect(settled.pulse).toBe(0);
  });

  it('본부와 타워의 나타난 시간이 늘어난다', () => {
    const tower = makeTower({ born: 0.2 });
    game.towers.push(tower);
    game.houseBorn = 0;
    update(0.1);
    expect(tower.born).toBeCloseTo(0.3);
    expect(game.houseBorn).toBeCloseTo(0.1);
  });

  it('알림은 보이는 동안만 줄어든다', () => {
    game.banner = 1;
    update(0.1);
    expect(game.banner).toBeCloseTo(0.9);
    game.banner = 0;
    update(0.1);
    expect(game.banner).toBe(0);
  });

  it('날아든 동전이 판에 닿으면 판이 반짝이고 고리 연출이 생긴다', () => {
    const spot = makeSpot({ x: 300, y: 400 });
    game.flies.push(
      makeFly(spot, { elapsed: 0.3, duration: 0.34 }),
      makeFly(spot, { elapsed: 0, duration: 0.34 }),
    );
    update(0.1);
    expect(spot.pulse).toBeGreaterThan(0.5);
    expect(game.flies).toHaveLength(1);
    expect(game.effects).toEqual([
      { x: 300, y: 400, age: 0.35, radius: 18, isBuildEffect: true },
    ]);
  });

  it('연출은 0.5초가 지나면 사라진다', () => {
    game.effects.push(makeEffect({ age: 0.45 }), makeEffect({ age: 0.1 }));
    update(0.1);
    expect(game.effects).toHaveLength(1);
    expect(game.effects[0].age).toBeCloseTo(0.2);
  });
});
