import {
  createCanvas,
  createPixelContext,
  getCanvasContext,
} from '../canvas/canvasHelpers';
import { OUTLINE_COLOR } from '../constants';
import type { SheetEntry, Stack } from '../types';

const OUTLINE = OUTLINE_COLOR;
const RIM_OFFSETS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

function maskWithColor(context: CanvasRenderingContext2D, textureSize: number) {
  Object.assign(context, {
    globalCompositeOperation: 'source-in',
    fillStyle: OUTLINE,
  });
  context.fillRect(0, 0, textureSize, textureSize);
}

function createSilhouette(layer: HTMLCanvasElement, textureSize: number) {
  const canvas = createCanvas(textureSize, textureSize);
  const context = getCanvasContext(canvas);
  context.drawImage(layer, 0, 0);
  maskWithColor(context, textureSize);
  return canvas;
}

// 층의 모양을 한 칸씩 사방으로 넓힌 짙은 그림. 모든 층의 윤곽을 먼저 깔고 그 위에 색 층을 쌓으면 바깥 윤곽만 남는다.
function createRim(layer: HTMLCanvasElement, textureSize: number) {
  const shadow = createSilhouette(layer, textureSize);
  const canvas = createCanvas(textureSize, textureSize);
  const context = getCanvasContext(canvas);
  RIM_OFFSETS.forEach(([deltaX, deltaY]) => {
    context.drawImage(shadow, deltaX, deltaY);
  });
  return canvas;
}

async function loadImage(url: string) {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

function cutLayer(sheet: HTMLImageElement, entry: SheetEntry, index: number) {
  const { textureSize, columns } = entry;
  const canvas = createCanvas(textureSize, textureSize);
  const [sourceX, sourceY] = [
    (index % columns) * textureSize,
    Math.floor(index / columns) * textureSize,
  ];
  createPixelContext(canvas).drawImage(
    sheet,
    sourceX,
    sourceY,
    textureSize,
    textureSize,
    0,
    0,
    textureSize,
    textureSize,
  );
  return canvas;
}

export default async function loadStack(
  directory: string,
  entry: SheetEntry,
): Promise<Stack> {
  const sheet = await loadImage(directory + entry.file);
  const { layerCount, lift, width, height, textureSize } = entry;
  const layers = Array.from({ length: layerCount }, (_, index) =>
    cutLayer(sheet, entry, index),
  );
  const rims = layers.map((layer) => createRim(layer, textureSize));
  return {
    layers,
    rims,
    layerCount,
    lift,
    width,
    height,
    cache: new Map(),
  };
}
