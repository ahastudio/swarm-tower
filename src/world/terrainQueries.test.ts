import { describe, expect, it } from 'vitest';
import {
  HEIGHT_CELL,
  HOUSE_X,
  HOUSE_Y,
  LEVEL_HEIGHT,
  LEVEL_THRESHOLDS,
  MAP_HEIGHT,
  MAP_WIDTH,
  WALL_LEVELS,
} from '../constants';
import { FIELD, GRID_COLUMNS, GRID_ROWS } from './terrainField';
import { canStand, getHeightAt, getLevelAt } from './terrainQueries';

const levelOfValue = (value: number) =>
  LEVEL_THRESHOLDS.filter((threshold) => value >= threshold).length;

// 격자 꼭짓점 중 조건에 맞는 첫 점의 월드 좌표
function findVertex(match: (x: number, y: number) => boolean) {
  for (let otherIndex = 1; otherIndex < GRID_ROWS - 2; otherIndex++) {
    for (let index = 1; index < GRID_COLUMNS - 2; index++) {
      const [x, y] = [index * HEIGHT_CELL, otherIndex * HEIGHT_CELL];
      if (match(x, y)) {
        return { x, y };
      }
    }
  }
  return null;
}

describe('terrain 격자', () => {
  it('격자는 지도 전체를 덮는다', () => {
    expect(GRID_COLUMNS).toBe(Math.ceil(MAP_WIDTH / HEIGHT_CELL) + 1);
    expect(GRID_ROWS).toBe(Math.ceil(MAP_HEIGHT / HEIGHT_CELL) + 1);
    expect(FIELD).toHaveLength(GRID_COLUMNS * GRID_ROWS);
  });

  it('본부 마당은 평평한 바닥(0층)이다', () => {
    expect(getLevelAt(HOUSE_X, HOUSE_Y)).toBe(0);
  });

  it('바다(지도 모서리)는 0층이다', () => {
    expect(getLevelAt(0, 0)).toBe(0);
    expect(getLevelAt(MAP_WIDTH, MAP_HEIGHT)).toBe(0);
  });
});

describe('levelAt', () => {
  it('격자 꼭짓점에서는 그 점의 값을 문턱값으로 자른 층이다', () => {
    for (const [column, otherIndex] of [
      [10, 10],
      [100, 60],
      [150, 100],
      [200, 130],
    ]) {
      const value = FIELD[otherIndex * GRID_COLUMNS + column];
      expect(getLevelAt(column * HEIGHT_CELL, otherIndex * HEIGHT_CELL)).toBe(
        levelOfValue(value),
      );
    }
  });

  it('지도 밖은 가장자리 값으로 맞춘다', () => {
    expect(getLevelAt(-500, -500)).toBe(getLevelAt(0, 0));
    expect(getLevelAt(MAP_WIDTH + 900, MAP_HEIGHT + 900)).toBe(
      getLevelAt(MAP_WIDTH - 1, MAP_HEIGHT - 1),
    );
  });

  it('언덕이 있는 곳이 있다', () => {
    expect(findVertex((x, y) => getLevelAt(x, y) >= 3)).not.toBeNull();
  });
});

describe('heightAt', () => {
  it('층 하나는 LEVEL_HEIGHT다', () => {
    const hill = findVertex((x, y) => getLevelAt(x, y) === 2);
    expect(hill).not.toBeNull();
    expect(getHeightAt(hill?.x ?? 0, hill?.y ?? 0)).toBe(2 * LEVEL_HEIGHT);
  });
});

describe('canStand', () => {
  it('평평한 곳에는 설 수 있다', () => {
    expect(canStand({ x: HOUSE_X, y: HOUSE_Y }, 16)).toBe(true);
  });

  it('몸 둘레에 세 층 이상이 걸치면 설 수 없다', () => {
    const cliff = findVertex((x, y) => {
      const levels = [
        getLevelAt(x, y),
        getLevelAt(x + 16, y),
        getLevelAt(x - 16, y),
        getLevelAt(x, y + 16),
        getLevelAt(x, y - 16),
      ];
      return Math.max(...levels) - Math.min(...levels) >= WALL_LEVELS;
    });
    expect(cliff).not.toBeNull();
    expect(canStand({ x: cliff?.x ?? 0, y: cliff?.y ?? 0 }, 16)).toBe(false);
  });
});
