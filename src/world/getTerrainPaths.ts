import { tracePolygon } from '../canvas/canvasHelpers';
import { HEIGHT_CELL, LEVEL_COUNT, LEVEL_THRESHOLDS } from '../constants';
import type { Point } from '../types';
import { FIELD, GRID_COLUMNS, GRID_ROWS } from './terrainField';

interface Corner {
  x: number;
  y: number;
  value: number;
  isAboveThreshold: boolean;
}

// 칸 하나의 네 꼭짓점을 왼쪽 위부터 시계 방향으로
const CORNER_OFFSETS = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

// 한 줄을 훑는 중의 상태. run은 통째로 찬 칸이 이어진 시작 열이다(없으면 -1)
interface Row {
  path: Path2D;
  row: number;
  threshold: number;
  run: number;
}

function createCellCorners(row: Row, column: number): Corner[] {
  return CORNER_OFFSETS.map(([cellOffsetX, cellOffsetY]) => {
    const value =
      FIELD[(row.row + cellOffsetY) * GRID_COLUMNS + column + cellOffsetX];
    const x = (column + cellOffsetX) * HEIGHT_CELL;
    const y = (row.row + cellOffsetY) * HEIGHT_CELL;
    return { x, y, value, isAboveThreshold: value >= row.threshold };
  });
}

function findEdgePoints(from: Corner, to: Corner, threshold: number) {
  const points: Point[] = from.isAboveThreshold
    ? [{ x: from.x, y: from.y }]
    : [];
  if (from.isAboveThreshold !== to.isAboveThreshold) {
    const fraction = (threshold - from.value) / (to.value - from.value);
    points.push({
      x: from.x + (to.x - from.x) * fraction,
      y: from.y + (to.y - from.y) * fraction,
    });
  }
  return points;
}

function addPolygon(row: Row, corners: Corner[]) {
  const points = corners.flatMap((corner, index) =>
    findEdgePoints(corner, corners[(index + 1) % 4], row.threshold),
  );
  tracePolygon(row.path, points);
}

function flushRun(row: Row, end: number) {
  if (row.run >= 0) {
    const x = row.run * HEIGHT_CELL;
    const y = row.row * HEIGHT_CELL;
    row.path.rect(x, y, (end - row.run) * HEIGHT_CELL, HEIGHT_CELL);
    row.run = -1;
  }
}

function closeCell(row: Row, column: number, corners: Corner[]) {
  flushRun(row, column);
  if (corners.some((corner) => corner.isAboveThreshold)) {
    addPolygon(row, corners);
  }
}

function extendRun(row: Row, column: number) {
  if (row.run < 0) {
    row.run = column;
  }
}

function addCell(row: Row, column: number) {
  const corners = createCellCorners(row, column);
  if (corners.every((corner) => corner.isAboveThreshold)) {
    extendRun(row, column);
    return;
  }
  closeCell(row, column, corners);
}

function addRow(row: Row) {
  for (let column = 0; column < GRID_COLUMNS - 1; column++) {
    addCell(row, column);
  }
  flushRun(row, GRID_COLUMNS - 1);
}

function buildLevelPath(level: number) {
  const path = new Path2D();
  const threshold = LEVEL_THRESHOLDS[level - 1];
  for (let rowIndex = 0; rowIndex < GRID_ROWS - 1; rowIndex++) {
    addRow({ path, row: rowIndex, threshold, run: -1 });
  }
  return path;
}

let cached: Path2D[] | undefined;

// 층마다 경계 모양을 처음 쓸 때 한 번만 만든다. 인덱스 level - 1이 level층이다
export default function getTerrainPaths() {
  cached ??= Array.from({ length: LEVEL_COUNT }, (_, index) =>
    buildLevelPath(index + 1),
  );
  return cached;
}
