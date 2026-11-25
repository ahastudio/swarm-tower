import { beforeEach, describe, expect, it, vi } from 'vitest';
import camera from './camera/camera';
import game from './game';
import { spriteAssets } from './sprites/assets';
import { installFakeAssets } from './testing/fakeAssets';
import { prepareFreshGame } from './testing/freshGame';
import house from './world/house';
import { YARD } from './world/yard';

const calls = vi.hoisted(() => [] as string[]);
vi.mock('./sim/update', () => ({
  default: (deltaSeconds: number) => calls.push(`update(${deltaSeconds})`),
}));
vi.mock('./render/draw', () => ({ default: () => calls.push('draw') }));

const { default: installDebugHooks } = await import('./installDebugHooks');
const { budget } = await import('./sprites/drawSprite');

type Hooks = Record<string, (...callArguments: number[]) => unknown> &
  Record<string, unknown>;
const readHooks = () => (window as unknown as { __game: Hooks }).__game;

beforeEach(() => {
  prepareFreshGame();
  installFakeAssets();
  calls.length = 0;
  installDebugHooks();
});

describe('installDebugHooks 읽기', () => {
  it('상태를 읽는 디버그 훅이 모두 있다', () => {
    expect(Object.keys(readHooks()).sort()).toEqual(
      [
        'spriteAssets',
        'isBlocked',
        'budgetCount',
        'camera',
        'canStand',
        'damage',
        'enemies',
        'pellets',
        'fencePreview',
        'give',
        'heightAt',
        'house',
        'levelAt',
        'measureFrameTime',
        'project',
        'props',
        'simulate',
        'skip',
        'spots',
        'state',
        'towers',
        'worker',
        'yard',
      ].sort(),
    );
  });

  it('state는 읽을 때마다 지금 값을 돌려준다', () => {
    game.coins = 7;
    expect(readHooks().state).toEqual({
      coins: 7,
      towers: 0,
      enemies: 0,
      hp: game.hp,
      wave: 0,
      phase: 'break',
      zoom: camera.zoom,
      rotation: camera.rotation,
    });
    game.coins = 9;
    expect((readHooks().state as unknown as { coins: number }).coins).toBe(9);
  });

  it('본부와 층 그림은 같은 객체를 그대로 보여 준다', () => {
    expect(readHooks().house).toBe(house);
    expect(readHooks().spriteAssets).toBe(spriteAssets);
  });

  it('yard, 주인공, 타워, 판, 적, 카메라는 지금 객체를 그대로 보여 준다', () => {
    const hooks = readHooks();
    expect(hooks.yard).toBe(YARD);
    expect(hooks.worker()).toBe(game.worker);
    expect(hooks.towers()).toBe(game.towers);
    expect(hooks.spots()).toBe(game.spots);
    expect(hooks.enemies()).toBe(game.enemies);
    expect(hooks.pellets()).toBe(game.pellets);
    expect(hooks.camera).toBe(camera);
  });

  it('이번 프레임에 합친 그림 수를 읽는다', () => {
    budget.count = 3;
    expect(readHooks().budgetCount()).toBe(3);
  });

  it('울타리 조각은 앞의 다섯 개만 보인다', () => {
    expect(readHooks().fencePreview()).toHaveLength(5);
  });

  it('project는 월드 좌표를 화면 좌표로 바꿔 돌려준다', () => {
    const point = readHooks().project(2200, 1400) as { x: number; y: number };
    expect(Object.keys(point).sort()).toEqual(['x', 'y']);
    expect(Number.isFinite(point.x)).toBe(true);
  });

  it('땅 높이와 설 수 있는지를 읽는다', () => {
    expect(readHooks().levelAt(2200, 1400)).toBe(0);
    expect(readHooks().heightAt(2200, 1400)).toBe(0);
    expect(readHooks().canStand(2200, 1400, 16)).toBe(true);
  });

  it('isBlocked는 한 걸음을 못 걷는지 알려 준다', () => {
    expect(readHooks().isBlocked(2200, 2000, 2205, 2000)).toBe(false);
    expect(readHooks().isBlocked(2200, 2000, 0, 0)).toBe(true);
  });
});

describe('installDebugHooks 조작', () => {
  it('damage는 본부 체력을 깎는다', () => {
    const before = game.hp;
    readHooks().damage(30);
    expect(game.hp).toBe(before - 30);
  });

  it('give는 동전을 더하고 새 동전 수를 돌려준다', () => {
    game.coins = 5;
    expect(readHooks().give(10)).toBe(15);
    expect(game.coins).toBe(15);
  });

  it('skip은 쉬는 시간을 건너뛴다', () => {
    game.phaseTime = 12;
    readHooks().skip();
    expect(game.phaseTime).toBe(0);
  });

  it('simulate는 0.05초씩 n번 갱신한다', () => {
    readHooks().simulate(3);
    expect(calls).toEqual(['update(0.05)', 'update(0.05)', 'update(0.05)']);
  });

  it('measureFrameTime은 갱신과 그리기를 n번 하고 한 프레임당 걸린 시간을 돌려준다', () => {
    const elapsed = readHooks().measureFrameTime(2) as number;
    expect(calls).toEqual([
      'update(0.016666666666666666)',
      'draw',
      'update(0.016666666666666666)',
      'draw',
    ]);
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });
});
