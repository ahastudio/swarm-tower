import camera from '../camera/camera';
import { project, scratchFirst } from '../camera/projection';
import view from '../camera/view';
import { POND_DEPTH, PONDS, SOIL_COLOR } from '../constants';
import { setWorldTransform, type WorldOrigin } from './groundTransform';
import { fillEllipse, fillRect } from './paint';

const WALL_LAYERS = POND_DEPTH / 2;
const WALL_COLORS = [SOIL_COLOR, '#8f6a42', '#6f5035'];
const SPARKLES = 6;

// 연못은 주변보다 낮게 파인 구덩이다. 벽을 아래로 층층이 쌓고 그 아래쪽에 물이 고인다
const pickWallColor = (layer: number) => WALL_COLORS[Math.floor(layer / 2)];

function drawWalls(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
  pond: number[],
) {
  const [x, y, pondRadiusX, pondRadiusY] = pond;
  for (let step = 0; step < WALL_LAYERS; step++) {
    setWorldTransform(context, origin, -2 - step * 2);
    fillEllipse(context, pickWallColor(step), {
      x,
      y,
      radiusX: pondRadiusX,
      radiusY: pondRadiusY,
    });
  }
}

function drawSparkles(context: CanvasRenderingContext2D, pond: number[]) {
  const [x, y, radiusX, radiusY] = pond;
  for (let sparkle = 0; sparkle < SPARKLES; sparkle++) {
    const rect = {
      x: x - radiusX * 0.5 + sparkle * radiusX * 0.2,
      y: y - radiusY * 0.3 + (sparkle % 2) * radiusY * 0.4,
      width: 14,
      height: 4,
    };
    fillRect(context, '#d6f4ff', rect);
  }
}

function drawWater(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
  pond: number[],
) {
  const [x, y, radiusX, radiusY] = pond;
  setWorldTransform(context, origin, -POND_DEPTH * 0.65);
  fillEllipse(context, '#6cc4e8', {
    x,
    y,
    radiusX: radiusX * 0.97,
    radiusY: radiusY * 0.97,
  });
  fillEllipse(context, '#8fd8f2', {
    x: x - radiusX * 0.15,
    y: y - radiusY * 0.2,
    radiusX: radiusX * 0.68,
    radiusY: radiusY * 0.58,
  });
  drawSparkles(context, pond);
}

function isOnScreen(pond: number[]) {
  const margin = Math.max(pond[2], pond[3]) * 1.3 * camera.zoom;
  const { x, y } = scratchFirst;
  const insideX = x >= -margin && x <= view.width + margin;
  return insideX && y >= -margin && y <= view.height + margin;
}

function drawPond(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
  pond: number[],
) {
  project(pond[0], pond[1], scratchFirst);
  if (isOnScreen(pond)) {
    drawWalls(context, origin, pond);
    drawWater(context, origin, pond);
  }
}

export default function drawPonds(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
) {
  PONDS.forEach((pond) => {
    drawPond(context, origin, pond);
  });
}
