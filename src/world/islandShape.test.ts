import { describe, expect, it } from 'vitest';
import { ISLAND, PONDS } from '../constants';
import {
  calculateIslandRadius,
  findShorePoint,
  isInPond,
  isInsideIsland,
} from './islandShape';

describe('islandR', () => {
  it('섬 한가운데는 0이다', () => {
    expect(calculateIslandRadius(ISLAND.centerX, ISLAND.centerY)).toBe(0);
  });

  it('바닷가 점은 1이다', () => {
    for (const angle of [0, 1, 2.5, 4]) {
      const [x, y] = findShorePoint(angle);
      expect(calculateIslandRadius(x, y)).toBeCloseTo(1, 10);
    }
  });
});

describe('inside', () => {
  it('바닷가보다 안쪽만 섬 안이다', () => {
    const [x, y] = findShorePoint(1);
    const calculateCenter = (scale: number) => [
      ISLAND.centerX + (x - ISLAND.centerX) * scale,
      ISLAND.centerY + (y - ISLAND.centerY) * scale,
    ];
    expect(
      isInsideIsland(calculateCenter(0.9)[0], calculateCenter(0.9)[1]),
    ).toBe(true);
    expect(
      isInsideIsland(calculateCenter(1.1)[0], calculateCenter(1.1)[1]),
    ).toBe(false);
  });

  it('기준 k를 줄이면 더 안쪽만 안이다', () => {
    const [x, y] = findShorePoint(1);
    const near = [
      ISLAND.centerX + (x - ISLAND.centerX) * 0.95,
      ISLAND.centerY + (y - ISLAND.centerY) * 0.95,
    ];
    expect(isInsideIsland(near[0], near[1], 0.9)).toBe(false);
    expect(isInsideIsland(near[0], near[1], 0.98)).toBe(true);
  });
});

describe('inPond', () => {
  const [panX, panY, radiusX, radiusY] = PONDS[0];

  it('연못 중심은 연못 안이다', () => {
    expect(isInPond(panX, panY)).toBe(true);
  });

  it('가장자리 밖은 margin만큼 넓힌 곳까지만 연못이다', () => {
    expect(isInPond(panX + radiusX + 5, panY)).toBe(true);
    expect(isInPond(panX + radiusX + 20, panY)).toBe(false);
    expect(isInPond(panX + radiusX + 20, panY, 30)).toBe(true);
    expect(isInPond(panX, panY + radiusY + 20)).toBe(false);
  });
});
