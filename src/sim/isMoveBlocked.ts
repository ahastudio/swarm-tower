import { WALL_LEVELS } from '../constants';
import { measureSegmentDistance } from '../mathHelpers';
import type { Point } from '../types';
import { isInPond, isInsideIsland } from '../world/islandShape';
import { getLevelAt } from '../world/terrainQueries';
import { FENCES } from '../world/yard';

const FENCE_RADIUS = 16;
const STAND_INSIDE = 0.96;
const MIN_STEP = 1e-6;
// 바로 앞 이만큼(px)에서 세 층 이상 솟거나 꺼지면 벽이다
const LOOKAHEAD = 24;

const hitsFence = (point: Point) =>
  FENCES.some(
    (fence) => measureSegmentDistance(point.x, point.y, fence) < FENCE_RADIUS,
  );

const isForbiddenGround = (point: Point) =>
  !isInsideIsland(point.x, point.y, STAND_INSIDE) ||
  hitsFence(point) ||
  isInPond(point.x, point.y);

// 높이 때문에 못 가는 것은 현재 높이와 가려는 곳의 높이 차이가 세 층 이상일 때뿐이다. 높은 곳이라서 못 가는 것이 아니다
const isWall = (from: Point, to: Point) =>
  Math.abs(getLevelAt(to.x, to.y) - getLevelAt(from.x, from.y)) >= WALL_LEVELS;

function findPointAhead(from: Point, to: Point, length: number): Point {
  return {
    x: to.x + ((to.x - from.x) / length) * LOOKAHEAD,
    y: to.y + ((to.y - from.y) / length) * LOOKAHEAD,
  };
}

function isSteepStep(from: Point, to: Point) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length < MIN_STEP) {
    return false;
  }
  return [to, findPointAhead(from, to, length)].some((point) =>
    isWall(from, point),
  );
}

export default function isMoveBlocked(from: Point, to: Point) {
  return isForbiddenGround(to) || isSteepStep(from, to);
}
