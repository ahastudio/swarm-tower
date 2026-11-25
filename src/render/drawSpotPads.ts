import { COIN_GOLD_COLOR, SPOT_HALF, UPGRADE_BLUE_COLOR } from '../constants';
import game from '../game';
import type { Spot } from '../types';
import { fillRect, type Rect } from './paint';

const APPEAR_SECONDS = 0.35;
const PULSE_GROW = 0.1;
const SHADOW_COLOR = 'rgba(60,70,40,.25)';

interface PadColors {
  face: string;
  fill: string;
  border: string;
}

const BUILD_COLORS: PadColors = {
  face: '#fff3d6',
  fill: COIN_GOLD_COLOR,
  border: '#e7a23c',
};
const UPGRADE_COLORS: PadColors = {
  face: '#e3f1ff',
  fill: UPGRADE_BLUE_COLOR,
  border: '#3f8fe0',
};

const pickPadColors = (spot: Spot) =>
  spot.isUpgrade ? UPGRADE_COLORS : BUILD_COLORS;

// 나타날 때 작게 시작해 커지고, 동전이 들어오면 잠깐 더 커진다
function calculatePadRadius(spot: Spot) {
  const appear = Math.min(1, spot.born / APPEAR_SECONDS);
  const grown = SPOT_HALF * (1 + PULSE_GROW * spot.pulse);
  return grown * (1 - (1 - appear) ** 3 * 0.9);
}

const createSquare = (spot: Spot, radius: number): Rect => ({
  x: spot.x - radius,
  y: spot.y - radius,
  width: radius * 2,
  height: radius * 2,
});

// 가장자리에서 inset만큼 안쪽으로(음수면 바깥으로) 줄인 정사각형
const shrink = (rect: Rect, inset: number): Rect => ({
  x: rect.x + inset,
  y: rect.y + inset,
  width: rect.width - inset * 2,
  height: rect.height - inset * 2,
});

function strokeSquare(context: CanvasRenderingContext2D, rect: Rect) {
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

function fillLevel(spot: Spot, radius: number): Rect {
  const height = radius * 2 * (spot.paid / spot.cost);
  return {
    x: spot.x - radius,
    y: spot.y + radius - height,
    width: radius * 2,
    height,
  };
}

function drawDashedFrame(context: CanvasRenderingContext2D, face: Rect) {
  Object.assign(context, { strokeStyle: '#fffbe8', lineWidth: 2 });
  context.setLineDash([8, 8]);
  strokeSquare(context, shrink(face, 12));
  context.setLineDash([]);
}

function drawBorders(
  context: CanvasRenderingContext2D,
  spot: Spot,
  face: Rect,
) {
  const border = spot.pulse > 0.3 ? '#fff' : pickPadColors(spot).border;
  Object.assign(context, { strokeStyle: border, lineWidth: 6 });
  strokeSquare(context, shrink(face, 3));
  drawDashedFrame(context, face);
}

function fillPadFaces(
  context: CanvasRenderingContext2D,
  spot: Spot,
  face: Rect,
) {
  fillRect(context, SHADOW_COLOR, shrink(face, -4));
  fillRect(context, pickPadColors(spot).face, face);
}

function drawPad(context: CanvasRenderingContext2D, spot: Spot) {
  const radius = calculatePadRadius(spot);
  const face = createSquare(spot, radius);
  fillPadFaces(context, spot, face);
  fillRect(context, pickPadColors(spot).fill, fillLevel(spot, radius));
  drawBorders(context, spot, face);
}

export default function drawSpotPads(context: CanvasRenderingContext2D) {
  context.save();
  for (const spot of game.spots) {
    if (!spot.isBuilt) {
      drawPad(context, spot);
    }
  }
  context.restore();
}
