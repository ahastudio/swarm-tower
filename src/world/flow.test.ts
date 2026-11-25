import { afterEach, describe, expect, it } from 'vitest';
import {
  FLOW_CELL,
  FLOW_COLUMNS,
  FLOW_ROWS,
  HOUSE_X,
  HOUSE_Y,
} from '../constants';
import {
  blocked,
  buildFlow,
  distance,
  flowX,
  flowY,
  getCellIndex,
} from './flow';
import house from './house';
import { buildFencePieces, rebuildFences } from './yard';

afterEach(() => {
  house.level = 1;
  rebuildFences();
  buildFencePieces();
  buildFlow();
});

const cellAt = (x: number, y: number) => getCellIndex(x, y);

describe('cellOf', () => {
  it('좌표가 속한 칸의 번호를 돌려준다', () => {
    expect(getCellIndex(0, 0)).toBe(0);
    expect(getCellIndex(FLOW_CELL * 3 + 1, FLOW_CELL * 2 + 1)).toBe(
      2 * FLOW_COLUMNS + 3,
    );
  });

  it('지도 밖은 가장자리 칸으로 맞춘다', () => {
    expect(getCellIndex(-100, -100)).toBe(0);
    expect(getCellIndex(1e6, 1e6)).toBe(FLOW_COLUMNS * FLOW_ROWS - 1);
  });
});

describe('buildFlow', () => {
  it('바다는 막힌 칸이고 길이 없다', () => {
    const sea = cellAt(10, 10);
    expect(blocked[sea]).toBe(1);
    expect(distance[sea]).toBe(1e9);
    expect([flowX[sea], flowY[sea]]).toEqual([0, 0]);
  });

  it('본부 바로 옆 칸이 목표라서 거리가 0이다', () => {
    expect(distance[cellAt(HOUSE_X + 40, HOUSE_Y)]).toBe(0);
  });

  it('울타리는 막힌 칸이다', () => {
    const fenceTop = cellAt(HOUSE_X, HOUSE_Y - 180);
    expect(blocked[fenceTop]).toBe(1);
  });

  it('문 앞은 열려 있어 마당 밖에서도 본부까지 거리가 구해진다', () => {
    const outside = cellAt(HOUSE_X, HOUSE_Y + 400);
    expect(blocked[outside]).toBe(0);
    expect(distance[outside]).toBeLessThan(1e8);
    expect(distance[outside]).toBeGreaterThan(300 / FLOW_CELL);
  });

  it('열린 칸의 흐름 벡터는 단위 길이이고 거리가 줄어드는 쪽을 가리킨다', () => {
    const start = cellAt(HOUSE_X, HOUSE_Y + 400);
    expect(Math.hypot(flowX[start], flowY[start])).toBeCloseTo(1, 5);
    const column = start % FLOW_COLUMNS;
    const row = (start / FLOW_COLUMNS) | 0;
    const next = (row + Math.sign(flowY[start])) * FLOW_COLUMNS + column;
    expect(distance[next]).toBeLessThanOrEqual(distance[start]);
  });

  it('흐름을 따라가면 목표에 닿는다', () => {
    let x = HOUSE_X;
    let y = HOUSE_Y + 600;
    for (let step = 0; step < 400; step++) {
      const cell = getCellIndex(x, y);
      x += flowX[cell] * FLOW_CELL * 0.5;
      y += flowY[cell] * FLOW_CELL * 0.5;
    }
    expect(Math.hypot(x - HOUSE_X, y - HOUSE_Y)).toBeLessThan(200);
  });

  it('다시 만들어도 같은 결과다', () => {
    const before = [...distance];
    buildFlow();
    expect([...distance]).toEqual(before);
  });

  it('마당이 넓어지면 울타리 자리가 달라져 막힌 칸이 바뀐다', () => {
    const oldFence = cellAt(HOUSE_X, HOUSE_Y - 180);
    house.level = 3;
    rebuildFences();
    buildFlow();
    expect(blocked[oldFence]).toBe(0);
    expect(blocked[cellAt(HOUSE_X, HOUSE_Y - 260)]).toBe(1);
  });
});
