import { describe, expect, it } from 'vitest';
import { LEVEL_COUNT } from '../constants';
import { type FakePath2D, listNames } from '../testing/fakeCanvas';
import getTerrainPaths from './getTerrainPaths';

const findCalls = (level: number) =>
  (getTerrainPaths()[level - 1] as unknown as FakePath2D).calls;

describe('getTerrainPaths', () => {
  it('층마다 경계 모양이 하나씩 있다', () => {
    expect(getTerrainPaths()).toHaveLength(LEVEL_COUNT);
  });

  it('통째로 찬 칸은 이어 붙인 사각형으로 그린다', () => {
    const rects = findCalls(1).filter((call) => call.name === 'rect');
    expect(rects.length).toBeGreaterThan(0);
    const [x, y, width, height] = rects[0].callArguments as number[];
    expect(width % 20).toBe(0);
    expect([x % 20, y % 20, height]).toEqual([0, 0, 20]);
  });

  it('걸친 칸은 다각형으로 자르고 다각형마다 닫는다', () => {
    const names = listNames(findCalls(1));
    const moves = names.filter((name) => name === 'moveTo').length;
    const closes = names.filter((name) => name === 'closePath').length;
    expect(moves).toBeGreaterThan(0);
    expect(closes).toBe(moves);
  });

  it('높은 층일수록 차지하는 곳이 줄어 사각형이 적다', () => {
    const count = (level: number) =>
      findCalls(level).filter((call) => call.name === 'rect').length;
    expect(count(1)).toBeGreaterThan(count(3));
  });
});
