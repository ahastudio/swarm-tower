import type { Effect, Point } from '../types';

// 퍼져 나가는 흰 고리. age는 이미 지난 연출 시간이다
export default function buildRing(
  point: Point,
  radius: number,
  age = 0,
): Effect {
  return { x: point.x, y: point.y, age, radius, isBuildEffect: true };
}
