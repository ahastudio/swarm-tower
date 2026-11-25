import type { Segment } from './types';

export const clamp = (x: number, min: number, max: number) =>
  Math.max(min, Math.min(max, x));

export function repeatTimes(count: number, action: () => void) {
  for (let index = 0; index < count; index++) {
    action();
  }
}

// 방향 (x, y)를 그림의 앞쪽이 화면 아래일 때의 회전각으로 바꾼다
export const calculateHeading = (x: number, y: number) => Math.atan2(-x, y);

export function smoothstep(from: number, to: number, x: number) {
  const fraction = clamp((x - from) / (to - from), 0, 1);
  return fraction * fraction * (3 - 2 * fraction);
}

export function measureSegmentDistance(x: number, y: number, segment: Segment) {
  const [startX, startY, endX, endY] = segment;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const fraction = clamp(
    ((x - startX) * deltaX + (y - startY) * deltaY) /
      (deltaX * deltaX + deltaY * deltaY),
    0,
    1,
  );
  return Math.hypot(
    x - startX - deltaX * fraction,
    y - startY - deltaY * fraction,
  );
}

// 배열에서 i번째를 맨 뒤 원소로 덮어쓰고 줄인다. 순서가 바뀌어도 되는 목록에서 빠르게 지운다
export function swapRemove<T>(items: T[], index: number) {
  items[index] = items[items.length - 1];
  items.pop();
}
