import { beforeEach, describe, expect, it, vi } from 'vitest';

const order = vi.hoisted(() => [] as string[]);
const environment = vi.hoisted(() => ({ id: 'env' }));
const step = (name: string) => ({
  default: (argument?: unknown) =>
    order.push(argument === environment ? `${name}(env)` : name),
});

vi.mock('./drawGround', () => step('ground'));
vi.mock('./addFences', () => step('fences'));
vi.mock('./addProps', () => step('props'));
vi.mock('./addHouse', () => step('house'));
vi.mock('./addTowers', () => step('towers'));
vi.mock('./addWorker', () => step('worker'));
vi.mock('./addEnemies', () => step('enemies'));
vi.mock('./addCoins', () => step('coins'));
vi.mock('./addSpotPrices', () => step('prices'));
vi.mock('./drawEffects', () => step('effects'));
vi.mock('./drawOverlay', () => step('overlay'));
vi.mock('../ui/updateStatusDisplay', () => step('statusDisplay'));
vi.mock('./scene', () => ({
  beginScene: () => {
    order.push('begin');
    return environment;
  },
  flushScene: () => order.push('flush'),
}));

const { budget } = await import('../sprites/drawSprite');
const { default: draw } = await import('./draw');

beforeEach(() => {
  order.length = 0;
  budget.count = 5;
});

describe('draw', () => {
  it('프레임마다 새로 합칠 수 있는 그림 수를 다시 센다', () => {
    draw();
    expect(budget.count).toBe(0);
  });

  it('바닥, 서 있는 물체, 연출, 알림, 화면 위 글자 순서로 그린다', () => {
    draw();
    expect(order).toEqual([
      'ground',
      'begin',
      'fences(env)',
      'props(env)',
      'house(env)',
      'towers(env)',
      'worker(env)',
      'enemies(env)',
      'coins(env)',
      'prices(env)',
      'flush',
      'effects(env)',
      'overlay(env)',
      'statusDisplay',
    ]);
  });
});
