import type { Built, Radians, Stack } from '../types';
import bakeStack, { calculateGap } from './bakeStack';
import drawLayers from './drawLayers';

// 회전 각도를 이만큼의 단계로 나눠 합친 그림을 캐시한다
const BUCKETS = 64;
// 캐시 키에서 각도 단계가 높이 단계와 겹치지 않게 곱하는 수
const ANGLE_KEY_STRIDE = 100;
// 카메라 높낮이(tilt 0.5~1)를 이만큼의 단계로 나눈다
const TILT_STEPS = 14;
const MIN_TILT = 0.5;
const TILT_RANGE = 0.5;
// 한 프레임에 새로 합칠 수 있는 그림 수(회전할 때 끊기지 않게)
const BAKES_PER_FRAME = 8;
const FULL_TURN = Math.PI * 2;

export const budget = { count: 0 };

// 이 물체의 화면상 모습. angle은 시계 방향 라디안, tilt는 카메라 높낮이, scale은 배율이다
interface SpritePose {
  angle: Radians;
  x: number;
  y: number;
  scale: number;
  tilt: number;
}

interface Bucket {
  angleStep: number;
  tiltStep: number;
}

function findBucket(pose: SpritePose): Bucket {
  const turns = Math.round((pose.angle / FULL_TURN) * BUCKETS);
  return {
    angleStep: ((turns % BUCKETS) + BUCKETS) % BUCKETS,
    tiltStep: Math.round(((pose.tilt - MIN_TILT) / TILT_RANGE) * TILT_STEPS),
  };
}

const createCacheKey = (bucket: Bucket) =>
  bucket.angleStep * ANGLE_KEY_STRIDE + bucket.tiltStep;
const calculateAngle = (bucket: Bucket) =>
  (bucket.angleStep / BUCKETS) * FULL_TURN;
const calculateTilt = (bucket: Bucket) =>
  MIN_TILT + (bucket.tiltStep / TILT_STEPS) * TILT_RANGE;

function bakeAndCache(stack: Stack, bucket: Bucket) {
  const built = bakeStack(stack, {
    angle: calculateAngle(bucket),
    tilt: calculateTilt(bucket),
  });
  stack.cache.set(createCacheKey(bucket), built);
  return built;
}

// 합친 그림이 있으면 그것을, 없고 이번 프레임에 합칠 여유가 있으면 새로 합쳐 돌려준다
function findBaked(stack: Stack, bucket: Bucket) {
  const cached = stack.cache.get(createCacheKey(bucket));
  if (cached || budget.count >= BAKES_PER_FRAME) {
    return cached;
  }
  budget.count++;
  return bakeAndCache(stack, bucket);
}

function drawBaked(
  context: CanvasRenderingContext2D,
  built: Built,
  pose: SpritePose,
) {
  const { x, y, scale } = pose;
  context.drawImage(
    built.canvas,
    x - built.originX * scale,
    y - built.originY * scale,
    built.canvas.width * scale,
    built.canvas.height * scale,
  );
}

function drawUnbaked(
  context: CanvasRenderingContext2D,
  stack: Stack,
  pose: SpritePose,
) {
  const bucket = findBucket(pose);
  const tilt = calculateTilt(bucket);
  const { x, y, scale } = pose;
  const origin = { x, y, scale, angle: calculateAngle(bucket) };
  drawLayers(context, stack, {
    ...origin,
    squash: tilt,
    gap: calculateGap(tilt),
  });
}

export default function drawSprite(
  context: CanvasRenderingContext2D,
  stack: Stack,
  pose: SpritePose,
) {
  const baked = findBaked(stack, findBucket(pose));
  if (!baked) {
    drawUnbaked(context, stack, pose);
    return;
  }
  drawBaked(context, baked, pose);
}
