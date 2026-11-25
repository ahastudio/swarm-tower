import {
  calculateLift,
  project,
  scratchFirst,
  scratchSecond,
} from '../camera/projection';
import view from '../camera/view';
import {
  ISLAND_ELEVATION,
  MAP_MARGIN,
  SEA_COLOR,
  SIDE_LAYER_STEP,
} from '../constants';
import drawPonds from './drawPonds';
import drawSpotPads from './drawSpotPads';
import drawTerrainLevels from './drawTerrainLevels';
import getGroundLayers from './getGroundLayers';
import {
  setLayerTransform,
  setWorldTransform,
  type WorldOrigin,
} from './groundTransform';

const SIDE_COUNT = ISLAND_ELEVATION / SIDE_LAYER_STEP;

function putLayer(
  context: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  offset: number,
) {
  setLayerTransform(context, scratchFirst, offset);
  context.drawImage(image, 0, 0);
}

// 섬 옆면은 층을 하나씩 쌓아 만든다. 위쪽 절반과 아래쪽 절반의 흙색이 다르다
function drawSideBands(
  context: CanvasRenderingContext2D,
  bands: HTMLCanvasElement[],
) {
  for (let index = 0; index < SIDE_COUNT - 1; index++) {
    const band = bands[index < SIDE_COUNT / 2 ? 0 : 1];
    putLayer(
      context,
      band,
      calculateLift() - calculateLift((index + 1) * SIDE_LAYER_STEP),
    );
  }
}

function drawSeaAndIsland(context: CanvasRenderingContext2D) {
  const layers = getGroundLayers();
  putLayer(context, layers.sea, calculateLift());
  drawSideBands(context, layers.bands);
  putLayer(context, layers.top, 0);
}

function resetTransform(context: CanvasRenderingContext2D) {
  context.setTransform(view.pixelRatio, 0, 0, view.pixelRatio, 0, 0);
}

function clearScreen(context: CanvasRenderingContext2D) {
  resetTransform(context);
  context.imageSmoothingEnabled = false;
  context.fillStyle = SEA_COLOR;
  context.fillRect(0, 0, view.width, view.height);
}

// 월드 원점과 그림의 왼쪽 위 모서리(-여백, -여백)가 화면 어디인지
function projectOrigins(): WorldOrigin {
  project(-MAP_MARGIN, -MAP_MARGIN, scratchFirst);
  project(0, 0, scratchSecond);
  return { x: scratchSecond.x, y: scratchSecond.y };
}

function drawLand(context: CanvasRenderingContext2D, origin: WorldOrigin) {
  drawSeaAndIsland(context);
  drawPonds(context, origin);
  drawTerrainLevels(context, origin);
}

function drawWorldGround(context: CanvasRenderingContext2D) {
  const origin = projectOrigins();
  drawLand(context, origin);
  setWorldTransform(context, origin, 0);
  drawSpotPads(context);
}

export default function drawGround() {
  const { context } = view;
  clearScreen(context);
  drawWorldGround(context);
  resetTransform(context);
}
