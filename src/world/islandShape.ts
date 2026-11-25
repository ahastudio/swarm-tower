import { ISLAND, PONDS } from '../constants';

// 전체 배경은 바다 위의 섬이다. 섬 둘레는 완만하게 구불거린다.
const calculateCoastRatio = (angle: number) =>
  1 +
  0.05 * Math.sin(3 * angle + 1) +
  0.035 * Math.sin(5 * angle + 2) +
  0.025 * Math.sin(8 * angle);

// 1보다 작으면 섬 안
export function calculateIslandRadius(x: number, y: number) {
  const deltaX = (x - ISLAND.centerX) / ISLAND.radiusX;
  const deltaY = (y - ISLAND.centerY) / ISLAND.radiusY;
  return (
    Math.hypot(deltaX, deltaY) / calculateCoastRatio(Math.atan2(deltaY, deltaX))
  );
}

export const isInsideIsland = (x: number, y: number, index = 1) =>
  calculateIslandRadius(x, y) < index;

export const findShorePoint = (angle: number): [number, number] => [
  ISLAND.centerX +
    ISLAND.radiusX * calculateCoastRatio(angle) * Math.cos(angle),
  ISLAND.centerY +
    ISLAND.radiusY * calculateCoastRatio(angle) * Math.sin(angle),
];

export const isInPond = (x: number, y: number, margin = 12) =>
  PONDS.some(
    ([pondX, pondY, radiusX, radiusY]) =>
      ((x - pondX) / (radiusX + margin)) ** 2 +
        ((y - pondY) / (radiusY + margin)) ** 2 <
      1,
  );
