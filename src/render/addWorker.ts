import camera from '../camera/camera';
import game from '../game';
import { spriteAssets } from '../sprites/assets';
import type { Point, Stack } from '../types';
import { strokeEllipse } from './paint';
import type { RenderEnvironment } from './scene';

const SWING_SECONDS = 0.3;
const SHADOW_RADIUS = 20;
const RING_RADIUS = 26;

// 쏘는 동작은 남은 시간에 따라 프레임이 넘어간다
function pickThrowStack(): Stack {
  const frames = spriteAssets.manThrow.length;
  const frame = ((1 - game.worker.swing / SWING_SECONDS) * frames) | 0;
  return spriteAssets.manThrow[Math.min(frames - 1, frame)];
}

// 걷는 동작은 걸음 수로 넘어간다
const pickWalkStack = (): Stack =>
  spriteAssets.manWalk[(game.worker.walk | 0) % spriteAssets.manWalk.length];

function pickCurrentStack(): Stack {
  if (game.worker.swing > 0) {
    return pickThrowStack();
  }
  return game.worker.isMoving ? pickWalkStack() : spriteAssets.manIdle;
}

function drawWorker(environment: RenderEnvironment, foot: Point) {
  const { context, zoom } = environment;
  const ring = { x: foot.x, y: foot.y + 2 * zoom, radiusX: RING_RADIUS * zoom };
  environment.shadow(foot, SHADOW_RADIUS);
  strokeEllipse(
    context,
    { color: '#d6ec58', width: 3 * zoom },
    { ...ring, radiusY: RING_RADIUS * camera.tilt * zoom },
  );
  environment.stack(pickCurrentStack(), {
    angle: game.worker.heading,
    x: foot.x,
    y: foot.y,
  });
}

export default function addWorker(environment: RenderEnvironment) {
  environment.placeAlways(game.worker, (foot) => drawWorker(environment, foot));
}
