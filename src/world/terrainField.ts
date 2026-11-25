import {
  ALL_SPOTS,
  HEIGHT_CELL,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_LEVEL,
  PONDS,
  SPOT_HALF,
  UPGRADE_PAD,
} from '../constants';
import { smoothstep } from '../mathHelpers';
import { calculateIslandRadius } from './islandShape';
import { calculateYard } from './yard';

// 땅의 높낮이: 연속 값 f(x, y)를 문턱값으로 잘라 층(level)을 나눈다. 완만한 언덕은 한 층씩 오르내리고(걸을 수 있다),
// 고원 가장자리는 두 층 이상 한꺼번에 솟아 절벽이 된다(못 걷는다). 본부 마당, 타워 판, 연못, 바닷가는 평평하게 둔다.
export const GRID_COLUMNS = Math.ceil(MAP_WIDTH / HEIGHT_CELL) + 1;
export const GRID_ROWS = Math.ceil(MAP_HEIGHT / HEIGHT_CELL) + 1;

const YARD_MAX = calculateYard(MAX_LEVEL);
const FLAT_PADS = [...ALL_SPOTS.map(([x, y]) => ({ x, y })), UPGRADE_PAD];
// 연못 가장자리에서 이만큼 떨어진 곳까지 땅이 평평하다
const POND_FLAT_MARGIN = 40;

const calculateBaseNoise = (x: number, y: number) =>
  0.5 +
  0.22 * Math.sin(x / 520 + 1.3 + 0.8 * Math.sin(y / 700)) +
  0.18 * Math.sin(y / 430 - x / 900 + 2) +
  0.12 * Math.sin((x + y) / 260 + 0.5);

const calculatePlateauNoise = (x: number, y: number) =>
  Math.sin(x / 380 + 0.7 + 1.2 * Math.sin(y / 510)) +
  Math.sin(y / 330 - 1.1 + 0.9 * Math.sin(x / 640));

const measureYardDistance = (x: number, y: number) =>
  Math.hypot(
    Math.max(YARD_MAX.startX - x, 0, x - YARD_MAX.endX),
    Math.max(YARD_MAX.startY - y, 0, y - YARD_MAX.endY),
  );

const measurePadDistance = (
  x: number,
  y: number,
  pad: { x: number; y: number },
) =>
  Math.hypot(
    Math.max(Math.abs(x - pad.x) - SPOT_HALF, 0),
    Math.max(Math.abs(y - pad.y) - SPOT_HALF, 0),
  );

// 연못 안은 0이고, 밖에서는 가장자리까지의 거리를 가로세로 중 작은 반지름에 맞춰 잰다
function measurePondDistance(x: number, y: number, pond: number[]) {
  const [pondX, pondY, radiusX, radiusY] = pond;
  const distance = Math.hypot(
    (x - pondX) / (radiusX + POND_FLAT_MARGIN),
    (y - pondY) / (radiusY + POND_FLAT_MARGIN),
  );
  return distance < 1 ? 0 : (distance - 1) * Math.min(radiusX, radiusY);
}

function measureFlatGroundDistance(x: number, y: number) {
  const pads = FLAT_PADS.map((pad) => measurePadDistance(x, y, pad));
  const ponds = PONDS.map((pond) => measurePondDistance(x, y, pond));
  return Math.min(measureYardDistance(x, y), ...pads, ...ponds);
}

// 고원 가장자리: 대부분은 급하게 솟는 절벽이고, 램프 잡음이 큰 곳만 멀리서부터 완만하게 올라가는 비탈이라 걸어 오를 수 있다
function calculateCliffRamp(x: number, y: number) {
  const distance =
    Math.sin(x / 700 + 2.1 + Math.sin(y / 900)) *
    Math.sin(y / 610 - 0.4 + 0.7 * Math.sin(x / 800));
  const halfWidth = 0.02 + 0.3 * smoothstep(0.0, 0.35, distance);
  return smoothstep(
    1.46 - halfWidth,
    1.46 + halfWidth,
    calculatePlateauNoise(x, y),
  );
}

function calculateTerrainField(x: number, y: number) {
  const flat = smoothstep(10, 110, measureFlatGroundDistance(x, y));
  const z = flat * (1 - smoothstep(0.8, 0.93, calculateIslandRadius(x, y)));
  return (
    z *
    (calculateBaseNoise(x, y) +
      1.6 * calculateCliffRamp(x, y) * smoothstep(0.9, 1, z))
  );
}

function buildGrid() {
  const grid = new Float32Array(GRID_COLUMNS * GRID_ROWS);
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let column = 0; column < GRID_COLUMNS; column++) {
      grid[row * GRID_COLUMNS + column] = calculateTerrainField(
        column * HEIGHT_CELL,
        row * HEIGHT_CELL,
      );
    }
  }
  return grid;
}

export const FIELD = buildGrid();
