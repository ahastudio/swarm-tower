import { createCanvas, getCanvasContext } from '../canvas/canvasHelpers';
import {
  MAP_HEIGHT,
  MAP_MARGIN,
  MAP_WIDTH,
  PONDS,
  SEA_COLOR,
  SOIL_COLOR,
} from '../constants';
import { repeatTimes } from '../mathHelpers';
import { nextRandom, withSeed } from '../randomNumbers';
import { findShorePoint } from '../world/islandShape';
import { fillEllipse, type Pen } from './paint';

// 바닥: 바다, 섬 옆면(층), 섬 윗면을 반 해상도 캔버스로 한 번만 그려 둔다(굵은 도트 느낌)
export const GROUND_SCALE = 0.5;
const SEED = 3;
const SHORE_STEPS = 360;
const SAND_COLOR = '#ecd9a0';
const SPAN_X = MAP_WIDTH + MAP_MARGIN * 2;
const SPAN_Y = MAP_HEIGHT + MAP_MARGIN * 2;

interface GroundLayers {
  sea: HTMLCanvasElement;
  bands: HTMLCanvasElement[];
  top: HTMLCanvasElement;
}

interface Layer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

function createLayer(): Layer {
  const canvas = createCanvas(
    Math.ceil(SPAN_X * GROUND_SCALE),
    Math.ceil(SPAN_Y * GROUND_SCALE),
  );
  const groundContext = getCanvasContext(canvas);
  groundContext.scale(GROUND_SCALE, GROUND_SCALE);
  groundContext.translate(MAP_MARGIN, MAP_MARGIN);
  return { canvas, context: groundContext };
}

function islandPath(context: CanvasRenderingContext2D) {
  context.beginPath();
  context.moveTo(...findShorePoint(0));
  for (let index = 1; index <= SHORE_STEPS; index++) {
    context.lineTo(...findShorePoint((index / SHORE_STEPS) * Math.PI * 2));
  }
  context.closePath();
}

function strokeIsland(context: CanvasRenderingContext2D, pens: Pen[]) {
  islandPath(context);
  context.lineJoin = 'round';
  for (const pen of pens) {
    Object.assign(context, { strokeStyle: pen.color, lineWidth: pen.width });
    context.stroke();
  }
}

function seaStreak(context: CanvasRenderingContext2D) {
  const x = nextRandom() * SPAN_X - MAP_MARGIN;
  const y = nextRandom() * SPAN_Y - MAP_MARGIN;
  context.fillStyle = nextRandom() < 0.5 ? '#5fc4ee' : '#3fa6d8';
  context.fillRect(x, y, 30 + nextRandom() * 50, 6);
}

function seaFoam(context: CanvasRenderingContext2D) {
  const x = nextRandom() * SPAN_X - MAP_MARGIN;
  const y = nextRandom() * SPAN_Y - MAP_MARGIN;
  context.fillStyle = '#c9efff';
  context.fillRect(x, y, 22 + nextRandom() * 20, 4);
}

function paintOpenSea(context: CanvasRenderingContext2D) {
  context.fillStyle = SEA_COLOR;
  context.fillRect(-MAP_MARGIN, -MAP_MARGIN, SPAN_X, SPAN_Y);
  repeatTimes(2400, () => seaStreak(context));
  repeatTimes(1700, () => seaFoam(context));
}

function paintSea() {
  const { canvas, context } = createLayer();
  paintOpenSea(context);
  strokeIsland(context, [
    { color: 'rgba(255,255,255,.35)', width: 110 },
    { color: 'rgba(255,255,255,.55)', width: 50 },
  ]);
  return canvas;
}

// 섬 옆면: 아래쪽일수록 어두운 흙색 두 가지
function paintBand(color: string) {
  const { canvas, context } = createLayer();
  islandPath(context);
  context.fillStyle = color;
  context.fill();
  return canvas;
}

function grassColor(shade: number) {
  if (shade < 0.35) {
    return '#a8d98a';
  }
  return shade < 0.7 ? '#cdeba9' : '#d9f0b8';
}

function grassBlob(context: CanvasRenderingContext2D) {
  const x = nextRandom() * MAP_WIDTH;
  const y = nextRandom() * MAP_HEIGHT;
  const radius = 25 + nextRandom() * 70;
  fillEllipse(context, grassColor(nextRandom()), {
    x,
    y,
    radiusX: radius * 1.4,
    radiusY: radius,
  });
}

function grassSpeck(context: CanvasRenderingContext2D) {
  const x = nextRandom() * MAP_WIDTH;
  const y = nextRandom() * MAP_HEIGHT;
  context.fillStyle = nextRandom() < 0.5 ? '#9fd27f' : '#e6f7c4';
  context.fillRect(x, y, 4, 4);
}

function paintMeadow(context: CanvasRenderingContext2D) {
  context.fillStyle = '#bfe39a';
  context.fillRect(-MAP_MARGIN, -MAP_MARGIN, SPAN_X, SPAN_Y);
  repeatTimes(1700, () => grassBlob(context));
  repeatTimes(8500, () => grassSpeck(context));
}

function sandSparkle(context: CanvasRenderingContext2D) {
  const angle = nextRandom() * 6.283;
  const [x, y] = findShorePoint(angle);
  const radius = 30 + nextRandom() * 50;
  context.fillStyle = '#fff4cf';
  context.fillRect(
    x - Math.cos(angle) * radius,
    y - Math.sin(angle) * radius,
    5,
    5,
  );
}

function paintShoreSand(context: CanvasRenderingContext2D) {
  strokeIsland(context, [
    { color: '#f4e6b8', width: 120 },
    { color: SAND_COLOR, width: 56 },
  ]);
  repeatTimes(1500, () => sandSparkle(context));
}

function fillPond(
  context: CanvasRenderingContext2D,
  color: string,
  pond: number[],
) {
  const [x, y, pondRadiusX, pondRadiusY] = pond;
  fillEllipse(context, color, {
    x,
    y,
    radiusX: pondRadiusX,
    radiusY: pondRadiusY,
  });
}

// 연못: 둘레 모래만 그리고 안쪽은 윗면에 구멍을 낸다. 구덩이 벽과 물은 그릴 때 층으로 쌓는다
function paintPonds(context: CanvasRenderingContext2D) {
  for (const [x, y, radiusX, radiusY] of PONDS) {
    fillPond(context, SAND_COLOR, [x, y, radiusX + 26, radiusY + 24]);
  }
  context.globalCompositeOperation = 'destination-out';
  PONDS.forEach((pond) => {
    fillPond(context, '#000', pond);
  });
  context.globalCompositeOperation = 'source-over';
}

function clipToIsland(context: CanvasRenderingContext2D) {
  islandPath(context);
  context.save();
  context.clip();
}

function paintLand(context: CanvasRenderingContext2D) {
  paintMeadow(context);
  paintShoreSand(context);
  paintPonds(context);
}

function paintTop() {
  const { canvas, context } = createLayer();
  clipToIsland(context);
  paintLand(context);
  context.restore();
  return canvas;
}

function buildLayers(): GroundLayers {
  const sea = paintSea();
  const bands = ['#7a5838', SOIL_COLOR].map(paintBand);
  return { sea, bands, top: paintTop() };
}

let cached: GroundLayers | undefined;

export default function getGroundLayers() {
  cached ??= withSeed(SEED, buildLayers);
  return cached;
}
