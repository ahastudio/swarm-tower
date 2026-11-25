import camera from '../camera/camera';
import { scratchSecond, unproject } from '../camera/projection';
import view from '../camera/view';
import {
  MAX_TILT,
  MAX_ZOOM,
  MIN_TILT,
  MIN_ZOOM,
  TILT_PER_PIXEL,
} from '../constants';
import game from '../game';
import { clamp } from '../mathHelpers';
import type { Point } from '../types';
import { moveGesture, startGesture } from './gesture';
import pointerState, { type Mode } from './pointerState';

const ROTATE_PER_PIXEL = 0.006;
const WHEEL_ZOOM = 0.0012;
const RIGHT_BUTTON = 2;
const MIDDLE_BUTTON = 1;

// 왼쪽 이동, 오른쪽 드래그 회전, 가운데 드래그 이동
const MODE_BY_BUTTON: Record<number, Mode> = {
  [RIGHT_BUTTON]: 'rotate',
  [MIDDLE_BUTTON]: 'pan',
};

const isTouch = (pointerEvent: PointerEvent) =>
  pointerEvent.pointerType === 'touch';

function setTargetTo(pointerEvent: PointerEvent) {
  unproject(pointerEvent.clientX, pointerEvent.clientY, scratchSecond);
  game.worker.targetX = scratchSecond.x;
  game.worker.targetY = scratchSecond.y;
}

function rotateBy(delta: Point) {
  camera.rotation -= delta.x * ROTATE_PER_PIXEL;
  camera.tilt = clamp(
    camera.tilt + delta.y * TILT_PER_PIXEL,
    MIN_TILT,
    MAX_TILT,
  );
}

function panBy(delta: Point) {
  const inverseZoom = 1 / camera.zoom;
  camera.panX -=
    (delta.x * camera.rotationCos + delta.y * camera.rotationSin) * inverseZoom;
  camera.panY -=
    (-delta.x * camera.rotationSin + delta.y * camera.rotationCos) *
    inverseZoom;
}

const DRAGS: Record<Mode, (delta: Point, pointerEvent: PointerEvent) => void> =
  {
    none: () => undefined,
    gesture: () => undefined,
    rotate: rotateBy,
    pan: panBy,
    move: (_delta, pointerEvent) => setTargetTo(pointerEvent),
  };

// 터치 하나를 기록한다. 손가락이 둘 이상이면 마우스 조작으로 넘어가지 않는다
function trackTouchDown(pointerEvent: PointerEvent) {
  pointerState.touches.set(pointerEvent.pointerId, {
    x: pointerEvent.clientX,
    y: pointerEvent.clientY,
  });
  if (pointerState.touches.size === 2) {
    startGesture();
  }
  return pointerState.touches.size >= 2;
}

function beginMouseMode(pointerEvent: PointerEvent) {
  pointerState.mode = MODE_BY_BUTTON[pointerEvent.button] ?? 'move';
  if (pointerState.mode === 'move') {
    setTargetTo(pointerEvent);
  }
}

function rememberPointer(pointerEvent: PointerEvent) {
  pointerState.lastX = pointerEvent.clientX;
  pointerState.lastY = pointerEvent.clientY;
}

export function onPointerDown(pointerEvent: PointerEvent) {
  view.canvas.setPointerCapture(pointerEvent.pointerId);
  rememberPointer(pointerEvent);
  if (isTouch(pointerEvent) && trackTouchDown(pointerEvent)) {
    return;
  }
  beginMouseMode(pointerEvent);
}

// 손가락이 둘 이상이면 두 손가락 조작만 하고 true를 돌려준다
function moveGestureIfActive() {
  if (pointerState.mode === 'gesture') {
    moveGesture();
  }
}

function trackTouchMove(pointerEvent: PointerEvent) {
  pointerState.touches.set(pointerEvent.pointerId, {
    x: pointerEvent.clientX,
    y: pointerEvent.clientY,
  });
  if (pointerState.touches.size >= 2) {
    moveGestureIfActive();
    return true;
  }
  return false;
}

function drag(pointerEvent: PointerEvent) {
  const delta = {
    x: pointerEvent.clientX - pointerState.lastX,
    y: pointerEvent.clientY - pointerState.lastY,
  };
  rememberPointer(pointerEvent);
  DRAGS[pointerState.mode](delta, pointerEvent);
}

export function onPointerMove(pointerEvent: PointerEvent) {
  const tracked =
    isTouch(pointerEvent) && pointerState.touches.has(pointerEvent.pointerId);
  if (tracked && trackTouchMove(pointerEvent)) {
    return;
  }
  drag(pointerEvent);
}

export function onPointerLift(pointerEvent: PointerEvent) {
  pointerState.touches.delete(pointerEvent.pointerId);
  if (!isTouch(pointerEvent) || pointerState.touches.size < 2) {
    pointerState.mode = 'none';
  }
}

export function onWheel(wheelEvent: WheelEvent) {
  wheelEvent.preventDefault();
  camera.zoom = clamp(
    camera.zoom * Math.exp(-wheelEvent.deltaY * WHEEL_ZOOM),
    MIN_ZOOM,
    MAX_ZOOM,
  );
}
