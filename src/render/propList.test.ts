import { describe, expect, it, vi } from 'vitest';
import { HOUSE_X, HOUSE_Y, MAP_HEIGHT, MAP_WIDTH } from '../constants';
import { randomState } from '../randomNumbers';
import { isInsideIsland } from '../world/islandShape';
import propList from './propList';

const NAMES = ['tree', 'pine', 'bush', 'mush', 'redf', 'yelf', 'rock', 'stone'];

describe('propList', () => {
  it('꾸밈이 천 개 넘게 놓인다', () => {
    expect(propList.length).toBeGreaterThan(1000);
  });

  it('모두 알려진 이름이고 지도 안에 있다', () => {
    for (const [name, x, y] of propList) {
      expect(NAMES).toContain(name);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(MAP_WIDTH);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(MAP_HEIGHT);
    }
  });

  it('앞뒤 정렬을 위해 y 순서로 정렬되어 있다', () => {
    for (let index = 1; index < propList.length; index++) {
      expect(propList[index][2]).toBeGreaterThanOrEqual(propList[index - 1][2]);
    }
  });

  it('바닷가 숲, 꽃밭, 흩뿌린 꾸밈이 모두 있다', () => {
    const count = (names: string[]) =>
      propList.filter(([name]) => names.includes(name)).length;
    expect(count(['pine', 'tree'])).toBeGreaterThan(300);
    expect(count(['redf', 'yelf'])).toBeGreaterThan(100);
    expect(count(['rock', 'stone', 'bush', 'mush'])).toBeGreaterThan(50);
  });

  it('본부 둘레 150 안에는 흩뿌린 꾸밈이 없다', () => {
    const near = propList.filter(
      ([, x, y]) => Math.hypot(x - HOUSE_X, y - HOUSE_Y) < 150,
    );
    expect(near).toHaveLength(0);
  });

  it('섬 밖에는 놓이지 않는다', () => {
    const outside = propList.filter(([, x, y]) => !isInsideIsland(x, y, 0.97));
    expect(outside).toHaveLength(0);
  });

  it('시드가 같아 다시 만들어도 같고, 난수 시드는 원래대로 돌려 놓는다', async () => {
    const before = randomState.seed;
    vi.resetModules();
    const again = (await import('./propList')).default;
    expect(again).toEqual(propList);
    expect(randomState.seed).toBe(before);
  });
});
