import camera from '../camera/camera';
import { project, scratchFirst } from '../camera/projection';
import view from '../camera/view';
import drawSprite from '../sprites/drawSprite';
import type { Point, Radians, Stack } from '../types';
import { fillEllipse } from './paint';

// 한 프레임에 그릴 서 있는 물체의 모음. 발의 화면 y 순서로 정렬해 뒤에 있는 것이 앞의 것을 가리지 않게 그린다.
const list: [number, () => void][] = [];

const SHADOW_COLOR = 'rgba(50,70,40,.25)';
const SHADOW_DROP = 2;

// 스택을 놓는 모습: 물체 자체의 회전(angle), 화면 발 위치(x, y), 배율(k)
export interface Placement {
  angle: Radians;
  x: number;
  y: number;
  scale?: number;
}

type DrawAt = (foot: Point) => void;

export interface RenderEnvironment {
  context: CanvasRenderingContext2D;
  zoom: number;
  isVisible: (point: Point, margin: number) => boolean;
  add: (sortY: number, draw: () => void) => void;
  place: (point: Point, margin: number, draw: DrawAt) => void;
  placeAlways: (point: Point, draw: DrawAt) => void;
  shadow: (foot: Point, radius: number) => void;
  stack: (spriteStack: Stack, placement: Placement) => void;
}

const add = (sortY: number, draw: () => void) => {
  list.push([sortY, draw]);
};

const isVisible = (point: Point, margin: number) =>
  point.x > -margin &&
  point.x < view.width + margin &&
  point.y > -margin &&
  point.y < view.height + margin;

// 방금 투영한 화면 위치를 복사해 정렬 목록에 올린다. 임시 점은 다음 물체가 덮어쓴다
function addFoot(draw: DrawAt) {
  const foot = { ...scratchFirst };
  add(foot.y, () => draw(foot));
}

function place(point: Point, margin: number, draw: DrawAt) {
  project(point.x, point.y, scratchFirst);
  if (isVisible(scratchFirst, margin)) {
    addFoot(draw);
  }
}

function placeAlways(point: Point, draw: DrawAt) {
  project(point.x, point.y, scratchFirst);
  addFoot(draw);
}

function drawShadow(foot: Point, radius: number) {
  const zoom = camera.zoom;
  fillEllipse(view.context, SHADOW_COLOR, {
    x: foot.x,
    y: foot.y + SHADOW_DROP * zoom,
    radiusX: radius * zoom,
    radiusY: radius * camera.tilt * zoom,
  });
}

function drawStack(spriteStack: Stack, placement: Placement) {
  const pose = {
    angle: placement.angle + camera.rotation,
    x: placement.x,
    y: placement.y,
  };
  drawSprite(view.context, spriteStack, {
    ...pose,
    scale: camera.zoom * (placement.scale ?? 1),
    tilt: camera.tilt,
  });
}

export function beginScene(): RenderEnvironment {
  list.length = 0;
  return {
    context: view.context,
    zoom: camera.zoom,
    isVisible,
    add,
    place,
    placeAlways,
    shadow: drawShadow,
    stack: drawStack,
  };
}

export function flushScene() {
  list.sort((left, right) => left[0] - right[0]);
  for (const [, draw] of list) {
    draw();
  }
}
