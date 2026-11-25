import camera from '../camera/camera';
import { HOUSE_MAX_HP, LABEL_YELLOW_COLOR, OUTLINE_COLOR } from '../constants';
import game from '../game';
import { spriteAssets } from '../sprites/assets';
import type { Point } from '../types';
import house from '../world/house';
import drawOutlinedText from './drawOutlinedText';
import { fillRect, type Rect } from './paint';
import type { RenderEnvironment } from './scene';

const BOUNCE_SECONDS = 0.6;
const BOUNCE_AMOUNT = 0.18;
const BOUNCE_SPEED = 18;
const BAR_WIDTH = 100;
const BAR_HEIGHT = 8;
const BAR_DROP = 46;
const LABEL_RATIO = 0.78;
const LABEL_RISE = 4;

const bounceScale = () =>
  1 +
  BOUNCE_AMOUNT *
    Math.max(0, 1 - game.houseBorn / BOUNCE_SECONDS) *
    Math.sin(game.houseBorn * BOUNCE_SPEED);

function drawLevelLabel(
  environment: RenderEnvironment,
  foot: Point,
  scale: number,
) {
  const { context, zoom } = environment;
  const spriteStack = spriteAssets.houses[house.level - 1];
  const height =
    spriteStack.layerCount *
    spriteStack.lift *
    (1 + (1 - camera.tilt)) *
    zoom *
    scale;
  drawOutlinedText(context, `레벨 ${house.level}`, {
    x: foot.x,
    y: foot.y - height * LABEL_RATIO - LABEL_RISE * zoom,
    font: `bold ${22 * zoom}px sans-serif`,
    lineWidth: 6 * zoom,
    stroke: OUTLINE_COLOR,
    fill: LABEL_YELLOW_COLOR,
  });
}

function calculateHealthBarRect(foot: Point, zoom: number): Rect {
  return {
    x: foot.x - (BAR_WIDTH / 2) * zoom,
    y: foot.y + BAR_DROP * zoom,
    width: BAR_WIDTH * zoom,
    height: BAR_HEIGHT * zoom,
  };
}

function drawHealthBar(environment: RenderEnvironment, foot: Point) {
  const full = calculateHealthBarRect(foot, environment.zoom);
  const ratio = Math.max(0, game.hp / HOUSE_MAX_HP);
  fillRect(environment.context, '#0006', full);
  fillRect(environment.context, '#5ec26a', {
    ...full,
    width: full.width * ratio,
  });
}

function drawHouse(environment: RenderEnvironment, foot: Point) {
  const scale = bounceScale();
  environment.shadow(foot, 60 + house.level * 16);
  environment.stack(spriteAssets.houses[house.level - 1], {
    angle: 0,
    x: foot.x,
    y: foot.y,
    scale,
  });
  drawLevelLabel(environment, foot, scale);
  drawHealthBar(environment, foot);
}

export default function addHouse(environment: RenderEnvironment) {
  environment.placeAlways(house, (foot) => drawHouse(environment, foot));
}
