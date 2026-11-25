import {
  HEIGHT_CELL,
  LEVEL_HEIGHT,
  LEVEL_THRESHOLDS,
  WALL_LEVELS,
} from '../constants';
import { clamp } from '../mathHelpers';
import type { Point } from '../types';
import { FIELD, GRID_COLUMNS, GRID_ROWS } from './terrainField';

// 격자 끝 칸에서 한 칸 더 읽지 않도록 남기는 여백
const GRID_EDGE_MARGIN = 1.001;

// 꼭짓점 사이를 직선으로 이은 f 값. 그려지는 경계와 같다
function sampleField(x: number, y: number) {
  const gridX = clamp(x / HEIGHT_CELL, 0, GRID_COLUMNS - GRID_EDGE_MARGIN);
  const gridY = clamp(y / HEIGHT_CELL, 0, GRID_ROWS - GRID_EDGE_MARGIN);
  const [column, row] = [gridX | 0, gridY | 0];
  const [fractionX, fractionY, cell] = [
    gridX - column,
    gridY - row,
    row * GRID_COLUMNS + column,
  ];
  return (
    FIELD[cell] * (1 - fractionX) * (1 - fractionY) +
    FIELD[cell + 1] * fractionX * (1 - fractionY) +
    FIELD[cell + GRID_COLUMNS] * (1 - fractionX) * fractionY +
    FIELD[cell + GRID_COLUMNS + 1] * fractionX * fractionY
  );
}

export function getLevelAt(x: number, y: number) {
  const fieldValue = sampleField(x, y);
  return LEVEL_THRESHOLDS.reduce(
    (level, threshold) => level + (fieldValue >= threshold ? 1 : 0),
    0,
  );
}

export const getHeightAt = (x: number, y: number) =>
  getLevelAt(x, y) * LEVEL_HEIGHT;

// 몸 둘레(반지름 radius)에 세 층 이상이 걸치면 벽처럼 솟은 절벽이라 설 수 없다. 한 층씩 오르는 비탈은 지나간다
export function canStand(center: Point, radius: number) {
  const { x, y } = center;
  const levels = [
    getLevelAt(x, y),
    getLevelAt(x + radius, y),
    getLevelAt(x - radius, y),
    getLevelAt(x, y + radius),
    getLevelAt(x, y - radius),
  ];
  return Math.max(...levels) - Math.min(...levels) < WALL_LEVELS;
}
