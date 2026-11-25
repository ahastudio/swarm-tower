import {
  FLOW_CELL,
  FLOW_COLUMNS,
  FLOW_ROWS,
  HOUSE_X,
  HOUSE_Y,
} from '../constants';
import { clamp, measureSegmentDistance } from '../mathHelpers';
import type { Point } from '../types';
import { isInPond, isInsideIsland } from './islandShape';
import { canStand } from './terrainQueries';
import { FENCES } from './yard';

// 흐름장: 울타리가 막은 칸을 피해 본부까지 가는 거리를 칸마다 구해 둔다. 적은 거리가 줄어드는 쪽으로 몰려간다.
const CELL_COUNT = FLOW_COLUMNS * FLOW_ROWS;
const UNREACHED = 1e9;
const REACHED_LIMIT = 1e8;
const DIAGONAL = 1.41;
const FENCE_CLEARANCE = 21;
// 섬 가장자리에서 이만큼 안쪽까지만 걸을 수 있다(섬 반지름에 대한 비율)
const ISLAND_WALKABLE_RATIO = 0.98;
const POND_CLEARANCE = 24;
const ENEMY_BODY_RADIUS = 16;
// 적이 향하는 곳은 본부 중심에서 오른쪽으로 이만큼 떨어진 칸이다
const GOAL_OFFSET_X = 40;

export const blocked = new Uint8Array(CELL_COUNT);
export const distance = new Float32Array(CELL_COUNT).fill(UNREACHED);
export const flowX = new Float32Array(CELL_COUNT);
export const flowY = new Float32Array(CELL_COUNT);

// 이웃으로 한 칸 가는 방법: [열 차이, 행 차이, 드는 비용]
type Step = [number, number, number];
const NEIGHBORS: Step[] = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, DIAGONAL],
  [-1, 1, DIAGONAL],
  [1, -1, DIAGONAL],
  [-1, -1, DIAGONAL],
];

export function getCellIndex(x: number, y: number) {
  const row = clamp((y / FLOW_CELL) | 0, 0, FLOW_ROWS - 1);
  return row * FLOW_COLUMNS + clamp((x / FLOW_CELL) | 0, 0, FLOW_COLUMNS - 1);
}

const isInGrid = (x: number, y: number) =>
  x >= 0 && y >= 0 && x < FLOW_COLUMNS && y < FLOW_ROWS;

// cell에서 step만큼 간 칸의 번호. 격자 밖이면 -1
function findNeighbor(cell: number, step: Step) {
  const x = (cell % FLOW_COLUMNS) + step[0];
  const y = ((cell / FLOW_COLUMNS) | 0) + step[1];
  return isInGrid(x, y) ? y * FLOW_COLUMNS + x : -1;
}

const isWaterOrCliff = (x: number, y: number) =>
  !isInsideIsland(x, y, ISLAND_WALKABLE_RATIO) ||
  isInPond(x, y, POND_CLEARANCE) ||
  !canStand({ x, y }, ENEMY_BODY_RADIUS);

const isBehindFence = (x: number, y: number) =>
  FENCES.some((fence) => measureSegmentDistance(x, y, fence) < FENCE_CLEARANCE);

function isBlockedCell(x: number, y: number) {
  const worldX = (x + 0.5) * FLOW_CELL;
  const worldY = (y + 0.5) * FLOW_CELL;
  return isWaterOrCliff(worldX, worldY) || isBehindFence(worldX, worldY);
}

function markBlockedCells() {
  for (let row = 0; row < FLOW_ROWS; row++) {
    for (let column = 0; column < FLOW_COLUMNS; column++) {
      blocked[row * FLOW_COLUMNS + column] = isBlockedCell(column, row) ? 1 : 0;
    }
  }
}

// 대각선으로 막힌 모서리를 비스듬히 뚫지 않는다
function cutsCorner(cell: number, step: Step) {
  const [deltaX, deltaY] = step;
  if (deltaX === 0 || deltaY === 0) {
    return false;
  }
  const [x, y] = [cell % FLOW_COLUMNS, (cell / FLOW_COLUMNS) | 0];
  return (
    Math.max(
      blocked[y * FLOW_COLUMNS + x + deltaX],
      blocked[(y + deltaY) * FLOW_COLUMNS + x],
    ) === 1
  );
}

interface Edge {
  from: number;
  to: number;
  cost: number;
}

function relaxEdge(queue: number[], edge: Edge) {
  const { from, to, cost } = edge;
  if (distance[from] + cost < distance[to]) {
    distance[to] = distance[from] + cost;
    queue.push(to);
  }
}

function relaxStep(queue: number[], cell: number, step: Step) {
  const next = findNeighbor(cell, step);
  if (next < 0 || blocked[next] || cutsCorner(cell, step)) {
    return;
  }
  relaxEdge(queue, { from: cell, to: next, cost: step[2] });
}

// 거리 순으로 퍼뜨린다. 작은 격자라 단순 큐로 충분하다
function spreadDistances() {
  const queue = [getCellIndex(HOUSE_X + GOAL_OFFSET_X, HOUSE_Y)];
  distance[queue[0]] = 0;
  for (let head = 0; head < queue.length; head++) {
    NEIGHBORS.forEach((step) => {
      relaxStep(queue, queue[head], step);
    });
  }
}

function addGain(sum: Point, cell: number, step: Step) {
  const next = findNeighbor(cell, step);
  const gain = next < 0 ? 0 : distance[cell] - distance[next];
  if (gain > 0) {
    sum.x += (step[0] / step[2]) * gain;
    sum.y += (step[1] / step[2]) * gain;
  }
}

function calculateUnitGradient(cell: number): Point {
  const sum = { x: 0, y: 0 };
  NEIGHBORS.forEach((step) => {
    addGain(sum, cell, step);
  });
  const length = Math.hypot(sum.x, sum.y) || 1;
  return { x: sum.x / length, y: sum.y / length };
}

function setFlowVector(cell: number) {
  if (blocked[cell] || distance[cell] > REACHED_LIMIT) {
    return;
  }
  const unit = calculateUnitGradient(cell);
  flowX[cell] = unit.x;
  flowY[cell] = unit.y;
}

function resetGrids() {
  blocked.fill(0);
  distance.fill(UNREACHED);
  flowX.fill(0);
  flowY.fill(0);
}

export function buildFlow() {
  resetGrids();
  markBlockedCells();
  spreadDistances();
  for (let cell = 0; cell < CELL_COUNT; cell++) {
    setFlowVector(cell);
  }
}

buildFlow();
