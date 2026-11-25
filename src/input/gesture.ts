import camera from '../camera/camera';
import {
  MAX_TILT,
  MAX_ZOOM,
  MIN_TILT,
  MIN_ZOOM,
  TILT_PER_PIXEL,
} from '../constants';
import game from '../game';
import { clamp } from '../mathHelpers';
import type { Radians } from '../types';
import type { Gesture } from './pointerState';
import pointerState from './pointerState';

// 두 손가락이 이만큼(px) 움직이면 어떤 조작인지 정한다
const GESTURE_START = 12;

const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

interface Fingers {
  distance: number;
  angle: Radians;
  middleY: number;
}

function readFingers(): Fingers {
  const [firstTouch, secondTouch] = [...pointerState.touches.values()];
  return {
    distance:
      Math.hypot(secondTouch.x - firstTouch.x, secondTouch.y - firstTouch.y) ||
      1,
    angle: Math.atan2(
      secondTouch.y - firstTouch.y,
      secondTouch.x - firstTouch.x,
    ),
    middleY: (firstTouch.y + secondTouch.y) / 2,
  };
}

export function startGesture() {
  game.worker.targetX = game.worker.x;
  game.worker.targetY = game.worker.y;
  const { distance, angle, middleY } = readFingers();
  pointerState.gesture = {
    kind: 'pending',
    startDistance: distance,
    startAngle: angle,
    startMiddleY: middleY,
    distance,
    angle,
    middleY,
  };
  pointerState.mode = 'gesture';
}

// 거리, 비틂(호의 길이), 위아래 중 가장 크게 움직인 쪽으로 정한다
function measure(gesture: Gesture, fingers: Fingers) {
  const distanceChange = Math.abs(fingers.distance - gesture.startDistance);
  const angleChange =
    (Math.abs(wrap(fingers.angle - gesture.startAngle)) *
      gesture.startDistance) /
    2;
  const middleChange = Math.abs(fingers.middleY - gesture.startMiddleY);
  const horizontalChange = Math.max(distanceChange, angleChange);
  return {
    largestChange: Math.max(horizontalChange, middleChange),
    isVertical: middleChange > horizontalChange,
  };
}

function decideKind(gesture: Gesture, fingers: Fingers) {
  if (gesture.kind !== 'pending') {
    return;
  }
  const metrics = measure(gesture, fingers);
  if (metrics.largestChange >= GESTURE_START) {
    gesture.kind = metrics.isVertical ? 'tilt' : 'view';
  }
}

function applyGesture(gesture: Gesture, fingers: Fingers) {
  if (gesture.kind === 'view') {
    camera.zoom = clamp(
      (camera.zoom * fingers.distance) / gesture.distance,
      MIN_ZOOM,
      MAX_ZOOM,
    );
    camera.rotation += wrap(fingers.angle - gesture.angle);
    return;
  }
  camera.tilt = clamp(
    camera.tilt + (fingers.middleY - gesture.middleY) * TILT_PER_PIXEL,
    MIN_TILT,
    MAX_TILT,
  );
}

function followGesture(gesture: Gesture, fingers: Fingers) {
  applyGesture(gesture, fingers);
  Object.assign(gesture, {
    distance: fingers.distance,
    angle: fingers.angle,
    middleY: fingers.middleY,
  });
}

export function moveGesture() {
  const context = pointerState.gesture;
  const current = readFingers();
  decideKind(context, current);
  if (context.kind !== 'pending') {
    followGesture(context, current);
  }
}
