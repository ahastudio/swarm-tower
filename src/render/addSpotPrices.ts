import { HINT_BLUE_COLOR, LABEL_CREAM_COLOR } from '../constants';
import game from '../game';
import type { Point, Spot } from '../types';
import drawOutlinedText from './drawOutlinedText';
import { drawCoinIcon, withTransform } from './paint';
import type { RenderEnvironment } from './scene';

const PRICE_MARGIN = 80;
const PULSE_GROW = 0.3;
const LABEL_RISE = 6;
const PRICE_STROKE = LABEL_CREAM_COLOR;

function paintPrice(context: CanvasRenderingContext2D, spot: Spot) {
  drawOutlinedText(context, String(spot.cost - spot.paid), {
    x: -10,
    y: 0,
    font: 'bold 30px sans-serif',
    lineWidth: 7,
    stroke: PRICE_STROKE,
    fill: '#4a4338',
  });
  if (spot.isUpgrade) {
    drawOutlinedText(context, '본부', {
      x: 0,
      y: -26,
      font: 'bold 16px sans-serif',
      lineWidth: 5,
      stroke: PRICE_STROKE,
      fill: HINT_BLUE_COLOR,
    });
  }
  drawCoinIcon(context, { x: 22, y: 1, radius: 11 }, 3);
}

function drawPrice(environment: RenderEnvironment, foot: Point, spot: Spot) {
  const { zoom } = environment;
  const scale = zoom * (1 + PULSE_GROW * spot.pulse);
  const point = { x: foot.x, y: foot.y - LABEL_RISE * zoom, scale };
  withTransform(environment.context, point, () =>
    paintPrice(environment.context, spot),
  );
}

export default function addSpotPrices(environment: RenderEnvironment) {
  for (const spot of game.spots) {
    if (!spot.isBuilt) {
      environment.place(spot, PRICE_MARGIN, (foot) =>
        drawPrice(environment, foot, spot),
      );
    }
  }
}
