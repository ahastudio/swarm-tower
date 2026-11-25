import type { Radians, Stack } from '../types';

// 층을 아래부터 쌓는 자세. x, y는 맨 아래 층의 발 위치, k는 배율, squash는 층 하나를 위아래로 누르는 비율,
// gap은 카메라를 낮출 때 벌어지는 층 사이 간격의 배율이다
interface LayerPose {
  x: number;
  y: number;
  scale: number;
  angle: Radians;
  squash: number;
  gap: number;
}

interface LayerPlacement {
  x: number;
  y: number;
  scale: number;
  angle: Radians;
  squash: number;
  width: number;
  height: number;
}

function createPlacement(stack: Stack, pose: LayerPose, index: number) {
  const lifted = pose.y - index * stack.lift * pose.gap * pose.scale;
  const { x, scale, angle, squash } = pose;
  return {
    x,
    y: lifted,
    scale,
    angle,
    squash,
    width: stack.width,
    height: stack.height,
  };
}

function applyPlacement(
  context: CanvasRenderingContext2D,
  layerPlacement: LayerPlacement,
) {
  context.translate(layerPlacement.x, layerPlacement.y);
  context.scale(
    layerPlacement.scale,
    layerPlacement.scale * layerPlacement.squash,
  );
  context.rotate(layerPlacement.angle);
}

function drawLayer(
  context: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  layerPlacement: LayerPlacement,
) {
  context.save();
  applyPlacement(context, layerPlacement);
  context.drawImage(
    image,
    -layerPlacement.width / 2,
    -layerPlacement.height / 2,
    layerPlacement.width,
    layerPlacement.height,
  );
  context.restore();
}

// 윤곽 층을 먼저 모두 깔고, 그 위에 색 층을 쌓는다
export default function drawLayers(
  context: CanvasRenderingContext2D,
  stack: Stack,
  pose: LayerPose,
) {
  for (const set of [stack.rims, stack.layers]) {
    set.forEach((image, index) => {
      drawLayer(context, image, createPlacement(stack, pose, index));
    });
  }
}
