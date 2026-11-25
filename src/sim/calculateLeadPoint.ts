import type { Enemy, Point } from '../types';

// 날아가는 동안 적이 걸어갈 만큼 앞을 겨눈다
export default function calculateLeadPoint(
  target: Enemy,
  flight: number,
): Point {
  return {
    x: target.x + target.velocityX * flight,
    y: target.y + target.velocityY * flight,
  };
}
