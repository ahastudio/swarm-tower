import { describe, expect, it, vi } from 'vitest';
import { FLOW_COLUMNS, FLOW_ROWS, HOUSE_X, HOUSE_Y } from '../constants';

// 섬 가장자리까지 모두 걸을 수 있는 열린 들판으로 만들어 지도 끝 칸의 흐름을 본다
vi.mock('./islandShape', () => ({
  isInsideIsland: () => true,
  isInPond: () => false,
}));
vi.mock('./terrainQueries', () => ({ canStand: () => true }));

const {
  blocked,
  getCellIndex: cellOf,
  distance,
  flowX,
  flowY,
} = await import('./flow');

describe('열린 들판의 흐름장', () => {
  it('지도 네 모서리 칸에서도 본부까지 거리가 구해진다', () => {
    for (const cell of [
      0,
      FLOW_COLUMNS - 1,
      FLOW_COLUMNS * (FLOW_ROWS - 1),
      FLOW_COLUMNS * FLOW_ROWS - 1,
    ]) {
      expect(blocked[cell]).toBe(0);
      expect(distance[cell]).toBeLessThan(1e8);
    }
  });

  it('모서리 칸의 흐름은 본부 쪽 안쪽을 향한다', () => {
    const topLeft = cellOf(0, 0);
    expect(flowX[topLeft]).toBeGreaterThan(0);
    expect(flowY[topLeft]).toBeGreaterThan(0);
    const bottomRight = FLOW_COLUMNS * FLOW_ROWS - 1;
    expect(flowX[bottomRight]).toBeLessThan(0);
    expect(flowY[bottomRight]).toBeLessThan(0);
  });

  it('본부 칸 바로 옆이 목표다', () => {
    expect(distance[cellOf(HOUSE_X + 40, HOUSE_Y)]).toBe(0);
  });
});
