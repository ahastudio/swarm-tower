import { FENCE_STEP } from '../constants';
import { calculateHeading } from '../mathHelpers';
import type { FencePiece, Segment } from '../types';
import house from './house';

const HALF_WIDTH = 165;
const GROW_WIDTH = 60;
const TOP = 180;
const GROW_TOP = 40;
const BOTTOM = 195;
const GROW_BOTTOM = 20;
const GATE_HALF = 50;

// 마당 크기는 본부 레벨마다 넓어진다. 문은 아래쪽 울타리에 있고, 넓어져도 타워 첫 구역(문 앞)을 넘지 않는다.
export const calculateYard = (level: number) => ({
  startX: house.x - HALF_WIDTH - GROW_WIDTH * (level - 1),
  endX: house.x + HALF_WIDTH + GROW_WIDTH * (level - 1),
  startY: house.y - TOP - GROW_TOP * (level - 1),
  endY: house.y + BOTTOM + GROW_BOTTOM * (level - 1),
});

export const YARD = calculateYard(1);
const GATE = [house.x - GATE_HALF, house.x + GATE_HALF];

export const FENCES: Segment[] = [];
export const fencePieces: FencePiece[] = [];

type Yard = ReturnType<typeof calculateYard>;

const createFenceSegments = (yard: Yard): Segment[] => [
  [yard.startX, yard.startY, yard.endX, yard.startY],
  [yard.startX, yard.startY, yard.startX, yard.endY],
  [yard.endX, yard.startY, yard.endX, yard.endY],
  [yard.startX, yard.endY, GATE[0], yard.endY],
  [GATE[1], yard.endY, yard.endX, yard.endY],
];

export function rebuildFences() {
  Object.assign(YARD, calculateYard(house.level));
  FENCES.length = 0;
  FENCES.push(...createFenceSegments(YARD));
}

// 조각의 양 끝 기둥 중심 사이가 37.4(층 그림 17칸)라서, 이 간격으로 놓으면 이웃 조각의 기둥이 하나로 겹치고
// 모든 변의 모양이 같다. 기둥 중심이 구간 끝(모서리)에 놓인다
function createPiecesAlong(segment: Segment): FencePiece[] {
  const [startX, startY, endX, endY] = segment;
  const segmentLength = Math.hypot(endX - startX, endY - startY);
  const [deltaX, deltaY] = [
    (endX - startX) / segmentLength,
    (endY - startY) / segmentLength,
  ];
  const segmentCount = Math.max(1, Math.round(segmentLength / FENCE_STEP));
  return Array.from({ length: segmentCount }, (_, index) => [
    startX + (deltaX * segmentLength * (index + 0.5)) / segmentCount,
    startY + (deltaY * segmentLength * (index + 0.5)) / segmentCount,
    calculateHeading(deltaX, deltaY),
  ]);
}

export function buildFencePieces() {
  fencePieces.length = 0;
  fencePieces.push(...FENCES.flatMap((segment) => createPiecesAlong(segment)));
}

export function isInYardArea(x: number, y: number, margin: YardMargin) {
  const insideX = x > YARD.startX - margin.left && x < YARD.endX + margin.right;
  return (
    insideX && y > YARD.startY - margin.top && y < YARD.endY + margin.bottom
  );
}

export interface YardMargin {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

rebuildFences();
buildFencePieces();
