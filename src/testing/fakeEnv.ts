import type { Placement, RenderEnvironment } from '../render/scene';
import type { Point, Stack } from '../types';
import { type Call, createFakeContext } from './fakeCanvas';

export interface FakeRenderEnvironment {
  environment: RenderEnvironment;
  calls: Call[];
  placed: { point: Point; margin: number }[];
  shadows: number[][];
  stacks: { stack: Stack; placement: Placement }[];
}

// 월드 위치 at의 화면 발 위치를 (x + 1000, y + 500)으로 정해, 월드 좌표와 화면 좌표가 섞이면 드러나게 한다
export const projectFoot = (point: Point): Point => ({
  x: point.x + 1000,
  y: point.y + 500,
});

// 장면 모음 대신 호출을 기록하고 그리기 함수를 바로 부르는 가짜 Env
export function makeRenderEnvironment(
  zoom = 2,
  size = { width: 1000, height: 600 },
): FakeRenderEnvironment {
  const { context, calls } = createFakeContext();
  const placed: FakeRenderEnvironment['placed'] = [];
  const shadows: number[][] = [];
  const stacks: FakeRenderEnvironment['stacks'] = [];
  const renderEnvironment: RenderEnvironment = {
    context,
    zoom,
    isVisible: (point, margin) =>
      point.x > -margin &&
      point.x < size.width + margin &&
      point.y > -margin &&
      point.y < size.height + margin,
    add: (_screenY, draw) => draw(),
    place: (point, margin, draw) => {
      placed.push({ point, margin });
      draw(projectFoot(point));
    },
    placeAlways: (point, draw) => {
      placed.push({ point, margin: Number.POSITIVE_INFINITY });
      draw(projectFoot(point));
    },
    shadow: (foot, radius) => {
      shadows.push([foot.x, foot.y, radius]);
    },
    stack: (stack, placement) => {
      stacks.push({ stack, placement });
    },
  };
  return { environment: renderEnvironment, calls, placed, shadows, stacks };
}
