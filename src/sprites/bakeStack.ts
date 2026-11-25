import { createCanvas, createPixelContext } from '../canvas/canvasHelpers';
import type { Built, Radians, Stack } from '../types';
import drawLayers from './drawLayers';

const PAD_RATIO = 0.75;

interface BakeView {
  angle: Radians;
  tilt: number;
}

// 카메라를 낮출수록 층 사이 간격이 벌어진다
export const calculateGap = (tilt: number) => 1 + (1 - tilt);

function calculateBakedSize(stack: Stack, tilt: number) {
  const pad = Math.ceil(stack.width * PAD_RATIO);
  const stackHeight = Math.ceil(
    stack.layerCount * stack.lift * calculateGap(tilt),
  );
  return { pad, height: pad * 2 + stackHeight };
}

// 층을 쌓는 자세: 맨 아래 층의 발이 합친 그림의 바닥 가운데에서 pad만큼 위에 온다
function createBakedPose(
  view: BakeView,
  size: { pad: number; height: number },
) {
  const foot = { x: size.pad, y: size.height - size.pad };
  const squashGap = { squash: view.tilt, gap: calculateGap(view.tilt) };
  return { ...foot, scale: 1, angle: view.angle, ...squashGap };
}

// 회전한 층들을 한 장으로 합친다. 윤곽 층을 먼저 깔고 색 층을 쌓는다.
// 카메라를 낮추면(tilt가 작아지면) 층 한 장 한 장은 위아래로 좁아지고(squash), 층 사이 간격은 벌어진다(gap).
export default function bakeStack(stack: Stack, view: BakeView): Built {
  const size = calculateBakedSize(stack, view.tilt);
  const canvas = createCanvas(size.pad * 2, size.height);
  drawLayers(createPixelContext(canvas), stack, createBakedPose(view, size));
  return { canvas, originX: size.pad, originY: size.height - size.pad };
}
