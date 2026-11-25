import { calculateLift, project } from '../camera/projection';
import { LEVEL_COUNT, LEVEL_HEIGHT, MAP_MARGIN } from '../constants';
import type { Point } from '../types';
import getTerrainPaths from '../world/getTerrainPaths';
import getGroundLayers from './getGroundLayers';
import {
  setLayerTransform,
  setWorldTransform,
  type WorldOrigin,
} from './groundTransform';

const SIDE_COLORS = [
  '#6c9f4a',
  '#78ab53',
  '#85b95d',
  '#92c668',
  '#9fd374',
  '#aadd80',
];
const TOP_COLORS = [
  '#b5df89',
  '#c4e99a',
  '#d6f3b0',
  '#e2f8c2',
  '#ecfccd',
  '#f4ffd9',
];
const SIDE_LAYERS = LEVEL_HEIGHT / 2;
const TEXTURE_ALPHA = 0.45;
const textureCorner: Point = { x: 0, y: 0 };

// 윗면 질감을 한 번 더 얹는다. 그림의 왼쪽 위 모서리는 지도 모서리(-여백, -여백)에 놓는다
function paintTexture(context: CanvasRenderingContext2D, level: number) {
  project(-MAP_MARGIN, -MAP_MARGIN, textureCorner);
  setLayerTransform(
    context,
    textureCorner,
    -calculateLift(level * LEVEL_HEIGHT),
  );
  context.globalAlpha = TEXTURE_ALPHA;
  context.drawImage(getGroundLayers().top, 0, 0);
}

function drawTexture(context: CanvasRenderingContext2D, level: number) {
  context.save();
  context.clip(getTerrainPaths()[level - 1]);
  paintTexture(context, level);
  context.restore();
}

function drawSides(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
  level: number,
) {
  for (let step = 0; step < SIDE_LAYERS; step++) {
    setWorldTransform(context, origin, (level - 1) * LEVEL_HEIGHT + step * 2);
    context.fillStyle = SIDE_COLORS[level - 1];
    context.fill(getTerrainPaths()[level - 1]);
  }
}

function fillTop(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
  level: number,
) {
  setWorldTransform(context, origin, level * LEVEL_HEIGHT);
  context.fillStyle = TOP_COLORS[level - 1];
  context.fill(getTerrainPaths()[level - 1]);
}

// 낮은 층부터 차례로 그려 위 층이 아래 층을 덮는다. 층마다 흙 옆면을 쌓고 윗면을 얹는다
function drawLevel(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
  level: number,
) {
  drawSides(context, origin, level);
  fillTop(context, origin, level);
  drawTexture(context, level);
}

export default function drawTerrainLevels(
  context: CanvasRenderingContext2D,
  origin: WorldOrigin,
) {
  for (let level = 1; level <= LEVEL_COUNT; level++) {
    drawLevel(context, origin, level);
  }
}
