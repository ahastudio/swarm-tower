import {
  ALL_SPOTS,
  HOUSE_X,
  HOUSE_Y,
  ISLAND,
  MAP_HEIGHT,
  MAP_WIDTH,
} from '../constants';
import { measureSegmentDistance } from '../mathHelpers';
import { nextRandom, withSeed } from '../randomNumbers';
import type { Point, PropEntry } from '../types';
import { findShorePoint, isInPond, isInsideIsland } from '../world/islandShape';
import { FENCES, isInYardArea, type YardMargin } from '../world/yard';

// 나무, 덤불, 꽃, 바위 같은 꾸밈의 위치(시드가 같아 매번 같다). 앞뒤 정렬을 위해 y 순서로 정렬해 둔다.
const SEED = 11;
const SCATTER_COUNT = 900;
const FOREST_COUNT = 560;
const FLOWER_BED_COUNT = 130;
const FLOWERS_PER_BED = 6;
const SCATTER_NAMES = [
  'tree',
  'pine',
  'bush',
  'mush',
  'redf',
  'yelf',
  'rock',
  'stone',
  'tree',
  'pine',
  'redf',
  'yelf',
];
const SCATTER_YARD: YardMargin = { left: 40, right: 60, top: 40, bottom: 40 };
const FOREST_YARD: YardMargin = { left: 60, right: 80, top: 60, bottom: 60 };
const POND_CLEARANCE = 40;
const FENCE_CLEARANCE = 60;
const HOUSE_CLEARANCE = 150;
const SPOT_CLEARANCE = 80;
const BED_FENCE_CLEARANCE = 90;

type Blocker = (x: number, y: number) => boolean;

const isNearFence = (x: number, y: number) =>
  FENCES.some((fence) => measureSegmentDistance(x, y, fence) < FENCE_CLEARANCE);
const isNearHouse = (x: number, y: number) =>
  Math.hypot(x - HOUSE_X, y - HOUSE_Y) < HOUSE_CLEARANCE;
const isNearSpot = (x: number, y: number) =>
  ALL_SPOTS.some(
    (spot) => Math.hypot(x - spot[0], y - spot[1]) < SPOT_CLEARANCE,
  );
const inYard: Blocker = (x, y) => isInYardArea(x, y, SCATTER_YARD);
const outsideIsland: Blocker = (x, y) => !isInsideIsland(x, y, 0.9);
const nearPond: Blocker = (x, y) => isInPond(x, y, POND_CLEARANCE);

const SCATTER_BLOCKERS = [
  isNearFence,
  inYard,
  outsideIsland,
  isNearHouse,
  isNearSpot,
  nearPond,
];

const isOpenGround = (x: number, y: number) =>
  !SCATTER_BLOCKERS.some((blocked) => blocked(x, y));

const pickName = () => SCATTER_NAMES[(nextRandom() * SCATTER_NAMES.length) | 0];

function createScatteredProps(): PropEntry[] {
  const [x, y] = [nextRandom() * MAP_WIDTH, nextRandom() * MAP_HEIGHT];
  return isOpenGround(x, y) ? [[pickName(), x, y]] : [];
}

function pickForestPoint(): Point {
  const angle = nextRandom() * Math.PI * 2;
  const radius = 0.8 + nextRandom() * 0.08;
  const [shoreX, shoreY] = findShorePoint(angle);
  return {
    x: ISLAND.centerX + (shoreX - ISLAND.centerX) * radius,
    y: ISLAND.centerY + (shoreY - ISLAND.centerY) * radius,
  };
}

function createForestProps(): PropEntry[] {
  const point = pickForestPoint();
  if (isInYardArea(point.x, point.y, FOREST_YARD)) {
    return [];
  }
  return [[nextRandom() < 0.6 ? 'pine' : 'tree', point.x, point.y]];
}

const BED_BLOCKERS: Blocker[] = [
  (x, y) => !isInsideIsland(x, y, 0.8),
  (x, y) =>
    FENCES.some(
      (fence) => measureSegmentDistance(x, y, fence) < BED_FENCE_CLEARANCE,
    ),
  nearPond,
  (x, y) => isInYardArea(x, y, FOREST_YARD),
];

function createFlowersAt(x: number, y: number): PropEntry[] {
  return Array.from({ length: FLOWERS_PER_BED }, () => [
    nextRandom() < 0.5 ? 'redf' : 'yelf',
    x + (nextRandom() - 0.5) * 70,
    y + (nextRandom() - 0.5) * 50,
  ]);
}

function createFlowerBedProps(): PropEntry[] {
  const x = 100 + nextRandom() * (MAP_WIDTH - 300);
  const y = 100 + nextRandom() * (MAP_HEIGHT - 200);
  const blocked = BED_BLOCKERS.some((blocker) => blocker(x, y));
  return blocked ? [] : createFlowersAt(x, y);
}

const repeat = (count: number, make: () => PropEntry[]) =>
  Array.from({ length: count }, make).flat();

function buildProps() {
  return [
    ...repeat(SCATTER_COUNT, createScatteredProps),
    ...repeat(FOREST_COUNT, createForestProps),
    ...repeat(FLOWER_BED_COUNT, createFlowerBedProps),
  ].sort((left, right) => left[2] - right[2]);
}

const propList: PropEntry[] = withSeed(SEED, buildProps);

export default propList;
